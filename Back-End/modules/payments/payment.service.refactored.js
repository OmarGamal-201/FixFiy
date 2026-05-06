/**
 * Refactored Payment Service
 * WITH:
 * - Transaction safety using MongoDB sessions
 * - Idempotency key checking (no duplicate charges)
 * - Comprehensive validation
 * - Proper error handling
 * - Status lifecycle management
 * - Retry mechanism
 * - Logging
 */

const Payment = require("./payment.model");
const Job = require("../jobs/job.model");
const gateway = require("../../utils/paymentGateways");
const { addToWallet } = require("./wallet.service");
const { createNotification } = require("../notifications/notification.service");
const PaymentValidator = require("./payment.validation");
const IdempotencyService = require("./idempotency.service");
const { PaymentError, PaymentErrors } = require("./payment.errors");
const mongoose = require("mongoose");

class PaymentService {
  /**
   * Process deposit payment with full validation and safety
   */
  static async payDeposit(jobId, clientId, userId, metadata = {}) {
    // 1. Validate request and job
    const job = await PaymentValidator.validateDepositPayment(
      jobId,
      clientId,
      userId
    );

    // 2. Check for duplicate/in-flight payments
    const idempotencyKey = IdempotencyService.generateKey(
      jobId,
      clientId,
      job.depositAmount,
      "DEPOSIT"
    );

    const existingPayment = await Payment.findOne({ idempotencyKey });
    if (existingPayment) {
      if (existingPayment.status !== "FAILED") {
        throw new PaymentError(PaymentErrors.DUPLICATE_PAYMENT_DETECTED, {
          existingPaymentId: existingPayment._id,
          status: existingPayment.status,
        });
      }
      // If previous payment failed, allow retry
    }

    // 3. Validate amount
    PaymentValidator.validateAmount(
      job.depositAmount,
      process.env.PAYMENT_MIN_AMOUNT || 1,
      process.env.PAYMENT_MAX_AMOUNT || 10000
    );

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 4. Create payment record (PENDING status)
      const paymentData = {
        jobId,
        clientId,
        amount: job.depositAmount,
        type: "DEPOSIT",
        heldBy: "PLATFORM",
        provider: (process.env.PAYMENT_PROVIDER || "MOCK").toUpperCase(),
        status: "PENDING",
        idempotencyKey,
        metadata: {
          ...metadata,
          source: "web",
          timestamp: new Date().toISOString(),
        },
        statusHistory: [{ status: "PENDING", reason: "Payment initiated" }],
      };

      let payment = await Payment.create([paymentData], { session });
      payment = payment[0];

      // 5. Call payment gateway
      let gatewayResult;
      try {
        console.log(`[PAYMENT] Processing deposit with ${paymentData.provider}`);

        gatewayResult = await gateway.charge({
          amount: job.depositAmount,
          jobId,
          clientId,
          type: "DEPOSIT",
          description: `Deposit for ${job.title}`,
          customerEmail: metadata.customerEmail,
          customerPhone: metadata.customerPhone,
        });
      } catch (gatewayError) {
        // Update payment as FAILED
        payment.status = "FAILED";
        payment.failureReason = gatewayError.code || "GATEWAY_ERROR";
        payment.failureDetails = {
          message: gatewayError.message,
          code: gatewayError.code,
        };
        payment.statusHistory.push({
          status: "FAILED",
          reason: gatewayError.message,
        });

        await payment.save({ session });
        await session.abortTransaction();

        console.error("[PAYMENT_FAILED]", gatewayError.message);
        throw gatewayError;
      }

      // 6. Update payment with gateway response
      payment.status = "PROCESSING";
      payment.transactionId = gatewayResult.transactionId;
      payment.statusHistory.push({
        status: "PROCESSING",
        reason: `Transaction initiated with ${gatewayResult.gateway || paymentData.provider}`,
      });

if (gatewayResult.approveUrl) {
  payment.metadata.redirectUrl = gatewayResult.approveUrl;
}
      await payment.save({ session });

      // 7. Update job status (only update to DEPOSIT_PAID after payment success - webhook will do this)
      job.paymentMethod = paymentData.provider;
      job.paymentRef = payment._id.toString();
      await job.save({ session });

      // 8. Commit transaction
      await session.commitTransaction();

      // 9. Send notification (outside transaction)
      await createNotification({
        userId: clientId,
        type: "PAYMENT_INITIATED",
        title: "Payment Processing",
        message: `Deposit payment of ${job.depositAmount} is being processed`,
        referenceId: payment._id,
      });

      console.log(`[PAYMENT_SUCCESS] Deposit payment created: ${payment._id}`);

      return {
  payment,
  approveUrl: gatewayResult.approveUrl,
  message: gatewayResult.message || "Payment initiated",
};
    } catch (error) {
      // Abort transaction if it's still active
      try {
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
      } catch (abortError) {
        console.error("[ABORT_ERROR]", abortError.message);
      }
      
      console.error("[PAYMENT_ERROR]", error.message);
      throw error instanceof PaymentError
        ? error
        : new PaymentError(PaymentErrors.DATABASE_ERROR, {
            originalError: error.message,
          });
    } finally {
      session.endSession();
    }
  }

  /**
   * Process final payment with full validation and safety
   */
  static async payFinal(jobId, clientId, userId, metadata = {}) {
    // 1. Validate request and job
    const job = await PaymentValidator.validateFinalPayment(
      jobId,
      clientId,
      userId
    );

    // 2. Calculate provider earnings (server-side, not from request!)
    const providerEarnings =
      job.total_price - (job.total_price * job.site_commission) / 100;

    // 3. Check for duplicate/in-flight payments
    const idempotencyKey = IdempotencyService.generateKey(
      jobId,
      job.workerId,
      providerEarnings,
      "FINAL"
    );

    const existingPayment = await Payment.findOne({ idempotencyKey });
    if (existingPayment) {
      if (existingPayment.status !== "FAILED") {
        throw new PaymentError(PaymentErrors.DUPLICATE_PAYMENT_DETECTED, {
          existingPaymentId: existingPayment._id,
          status: existingPayment.status,
        });
      }
    }

    // 4. Validate amount
    PaymentValidator.validateAmount(
      providerEarnings,
      process.env.PAYMENT_MIN_AMOUNT || 1,
      process.env.PAYMENT_MAX_AMOUNT || 10000
    );

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 5. Create payment record (PENDING status)
      const paymentData = {
        jobId,
        clientId,
        workerId: job.workerId,
        amount: providerEarnings,
        type: "FINAL",
        heldBy: "WORKER",
        provider: (process.env.PAYMENT_PROVIDER || "MOCK").toUpperCase(),
        status: "PENDING",
        idempotencyKey,
        metadata: {
          ...metadata,
          source: "web",
          timestamp: new Date().toISOString(),
        },
        statusHistory: [{ status: "PENDING", reason: "Final payment initiated" }],
      };

      let payment = await Payment.create([paymentData], { session });
      payment = payment[0];

      // 6. Call payment gateway
      let gatewayResult;
      try {
        console.log(`[PAYMENT] Processing final payment with ${paymentData.provider}`);

        gatewayResult = await gateway.charge({
          amount: providerEarnings,
          jobId,
          clientId,
          type: "FINAL",
          description: `Final payment for ${job.title}`,
          customerEmail: metadata.customerEmail,
        });
      } catch (gatewayError) {
        // Update payment as FAILED
        payment.status = "FAILED";
        payment.failureReason = gatewayError.code || "GATEWAY_ERROR";
        payment.failureDetails = {
          message: gatewayError.message,
          code: gatewayError.code,
        };
        payment.statusHistory.push({
          status: "FAILED",
          reason: gatewayError.message,
        });

        await payment.save({ session });
        await session.abortTransaction();

        console.error("[PAYMENT_FAILED]", gatewayError.message);
        throw gatewayError;
      }

      // 7. Update payment with gateway response
      payment.status = "PROCESSING";
      payment.transactionId = gatewayResult.transactionId;
      payment.statusHistory.push({
        status: "PROCESSING",
        reason: `Transaction initiated with ${gatewayResult.gateway || paymentData.provider}`,
      });

  if (gatewayResult.approveUrl) {
  payment.metadata.redirectUrl = gatewayResult.approveUrl;
}

      await payment.save({ session });

      // 8. Update job status (will be marked PAID only after webhook confirmation)
      job.paymentMethod = paymentData.provider;
      job.paymentRef = payment._id.toString();
      await job.save({ session });

      // 9. Commit transaction
      await session.commitTransaction();

      // 10. Send notification (outside transaction)
      await createNotification({
        userId: job.workerId,
        type: "PAYMENT_INITIATED",
        title: "Payment Processing",
        message: `Final payment of ${providerEarnings} is being processed`,
        referenceId: payment._id,
      });

      console.log(`[PAYMENT_SUCCESS] Final payment created: ${payment._id}`);

return {
  payment,
  approveUrl: gatewayResult.approveUrl,
  message: gatewayResult.message || "Please approve payment on PayPal page",
};
    } catch (error) {
      // Abort transaction if it's still active
      try {
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
      } catch (abortError) {
        console.error("[ABORT_ERROR]", abortError.message);
      }
      
      console.error("[PAYMENT_ERROR]", error.message);
      throw error instanceof PaymentError
        ? error
        : new PaymentError(PaymentErrors.DATABASE_ERROR, {
            originalError: error.message,
          });
    } finally {
      session.endSession();
    }
  }

  /**
   * Confirm payment after successful webhook (called by webhook handler)
   */
  static async confirmPayment(paymentId, webhookData = {}) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payment = await Payment.findById(paymentId).session(session);
      if (!payment) {
        throw new PaymentError(PaymentErrors.JOB_NOT_FOUND, { paymentId });
      }

      // Update payment to PAID
      payment.status = "PAID";
      payment.completedAt = new Date();
      payment.statusHistory.push({
        status: "PAID",
        reason: `Confirmed via ${webhookData.source || "webhook"}`,
      });
      payment.webhookStatus = "PROCESSED";
      payment.webhookProcessedAt = new Date();

      await payment.save({ session });

      // Get job
      const job = await Job.findById(payment.jobId).session(session);
      if (!job) {
        throw new PaymentError(PaymentErrors.JOB_NOT_FOUND, {
          jobId: payment.jobId,
        });
      }

      // Update job payment status based on payment type
      if (payment.type === "DEPOSIT") {
        job.paymentStatus = "DEPOSIT_PAID";
      } else if (payment.type === "FINAL") {
        job.paymentStatus = "PAID";

        // Add to worker wallet
        await addToWallet(
          {
            workerId: payment.workerId,
            amount: payment.amount,
            referenceId: payment.jobId,
            referenceType: "JOB",
            type: "EARNING",
          },
          { session }
        );
      }

      await job.save({ session });

      // Send notification
      await createNotification({
        userId: payment.clientId,
        type: "PAYMENT_COMPLETED",
        title:
          payment.type === "DEPOSIT"
            ? "Deposit Confirmed"
            : "Payment Completed",
        message:
          payment.type === "DEPOSIT"
            ? "Your deposit has been confirmed"
            : "Final payment has been processed and funds added to worker wallet",
        referenceId: payment._id,
      });

      if (payment.type === "FINAL" && payment.workerId) {
        await createNotification({
          userId: payment.workerId,
          type: "PAYMENT_COMPLETED",
          title: "Payment Received",
          message: `${payment.amount} has been added to your wallet`,
          referenceId: payment._id,
        });
      }

      await session.commitTransaction();

      console.log(`[PAYMENT_CONFIRMED] Payment ${paymentId} confirmed`);

      return payment;
    } catch (error) {
      if (session.inTransaction()) {
  await session.abortTransaction();
}
      console.error("[PAYMENT_CONFIRMATION_ERROR]", error.message);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Handle payment failure (called by webhook if payment failed)
   */
  static async handlePaymentFailure(paymentId, reason = "UNKNOWN", details = {}) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payment = await Payment.findById(paymentId).session(session);
      if (!payment) {
        throw new Error("Payment not found");
      }

      payment.status = "FAILED";
      payment.failureReason = reason;
      payment.failureDetails = details;
      payment.statusHistory.push({
        status: "FAILED",
        reason,
      });

      await payment.save({ session });

      // Send notification to client
      await createNotification({
        userId: payment.clientId,
        type: "PAYMENT_FAILED",
        title: "Payment Failed",
        message: `Your payment of ${payment.amount} could not be processed. Please try again.`,
        referenceId: payment._id,
      });

      await session.commitTransaction();

      console.log(`[PAYMENT_FAILED] Payment ${paymentId} marked as failed`);

      return payment;
    } catch (error) {
      if (session.inTransaction()) {
  await session.abortTransaction();
}
      console.error("[PAYMENT_FAILURE_HANDLER_ERROR]", error.message);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get payment history for a job
   */
  static async getPaymentHistory(jobId) {
    return Payment.find({ jobId })
      .select("-metadata.sessionId")
      .sort({ createdAt: -1 });
  }

  /**
   * Get payment by ID
   */
  static async getPayment(paymentId) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new PaymentError(PaymentErrors.JOB_NOT_FOUND, { paymentId });
    }
    return payment;
  }
}

module.exports = PaymentService;
