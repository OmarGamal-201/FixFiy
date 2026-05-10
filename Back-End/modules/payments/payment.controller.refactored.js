/**
 * Refactored Payment Controller
 * WITH:
 * - Comprehensive validation
 * - Proper error handling with error codes
 * - Status tracking
 * - Structured responses
 * - Logging
 */

const PaymentService = require("./payment.service.refactored");
const PaymentValidator = require("./payment.validation");
const { PaymentError, PaymentErrors } = require("./payment.errors");

/**
 * POST /api/payments/deposit
 * Client initiates deposit payment
 */
exports.deposit = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user.id;
    const clientId = req.user.id;

    // Validate request format
    PaymentValidator.validateRequestFormat(req.body, ["jobId"]);

    // Extract metadata
    const metadata = {
      customerEmail: req.user.email,
      customerPhone: req.user.phone,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      sessionId: req.session?.id,
    };

    console.log(`[PAYMENT_DEPOSIT] Initiated by ${userId} for job ${jobId}`);

    // Process deposit
    const result = await PaymentService.payDeposit(
      jobId,
      clientId,
      userId,
      metadata
    );

    // Return response
    res.status(201).json({
      success: true,
      data: {
        payment: {
          id: result.payment._id,
          jobId: result.payment.jobId,
          amount: result.payment.amount,
          status: result.payment.status,
          transactionId: result.payment.transactionId,
          createdAt: result.payment.createdAt,
        },
        approveUrl: result.approveUrl,
        message: result.message,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: "v2",
      },
    });
  } catch (err) {
    // Handle known payment errors
    if (err instanceof PaymentError) {
      return res.status(err.statusCode || 400).json(err.toJSON());
    }

    // Handle unknown errors
    console.error("[PAYMENT_ERROR]", err.message);

    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
        retryable: true,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * POST /api/payments/final
 * Client initiates final payment
 */
exports.final = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user.id;
    const clientId = req.user.id;

    // Validate request format
    PaymentValidator.validateRequestFormat(req.body, ["jobId"]);

    // Extract metadata
    const metadata = {
      customerEmail: req.user.email,
      customerPhone: req.user.phone,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      sessionId: req.session?.id,
    };

    console.log(`[PAYMENT_FINAL] Initiated by ${userId} for job ${jobId}`);

    // Process final payment
    const result = await PaymentService.payFinal(
      jobId,
      clientId,
      userId,
      metadata
    );

    // Return response
    res.status(201).json({
      success: true,
      data: {
        payment: {
          id: result.payment._id,
          jobId: result.payment.jobId,
          amount: result.payment.amount,
          status: result.payment.status,
          transactionId: result.payment.transactionId,
          createdAt: result.payment.createdAt,
        },
        approveUrl: result.approveUrl,
        message: result.message,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: "v2",
      },
    });
  } catch (err) {
    // Handle known payment errors
    if (err instanceof PaymentError) {
      return res.status(err.statusCode || 400).json(err.toJSON());
    }

    // Handle unknown errors
    console.error("[PAYMENT_ERROR]", err.message);

    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
        retryable: true,
        timestamp: new Date().toISOString(),
      },
    });
  }
};

/**
 * GET /api/payments/:paymentId
 * Get payment details
 */
exports.getPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await PaymentService.getPayment(paymentId);

    // Verify user has access
    if (
      payment.clientId.toString() !== req.user.id &&
      payment.workerId?.toString() !== req.user.id
    ) {
      throw new PaymentError(PaymentErrors.UNAUTHORIZED, { paymentId });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (err) {
    if (err instanceof PaymentError) {
      return res.status(err.statusCode || 400).json(err.toJSON());
    }

    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to retrieve payment",
      },
    });
  }
};



/**
 * GET /api/payments/job/:jobId
 * Get payment history for a job
 */
exports.getJobPayments = async (req, res) => {
  try {
    const { jobId } = req.params;

    const payments = await PaymentService.getPaymentHistory(jobId);

    res.json({
      success: true,
      data: payments,
      count: payments.length,
    });
  } catch (err) {
    console.error("[PAYMENT_ERROR]", err.message);

    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to retrieve payment history",
      },
    });
  }
};

/**
 * POST /api/payments/retry/:paymentId
 * Retry a failed payment
 */
exports.retryPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await PaymentService.getPayment(paymentId);

    // Verify authorization
    if (payment.clientId.toString() !== req.user.id) {
      throw new PaymentError(PaymentErrors.UNAUTHORIZED, { paymentId });
    }

    // Check if payment is retryable
    if (!payment.isRetryable) {
      throw new PaymentError(PaymentErrors.PAYMENT_ALREADY_PROCESSED, {
        paymentId,
        status: payment.status,
      });
    }

    // Increment retry count
    payment.retryCount += 1;
    payment.lastRetryAt = new Date();
    payment.status = "PENDING";

    await payment.save();

    res.json({
      success: true,
      data: {
        message: "Payment retry initiated",
        payment: {
          id: payment._id,
          status: payment.status,
          retryCount: payment.retryCount,
        },
      },
    });
  } catch (err) {
    if (err instanceof PaymentError) {
      return res.status(err.statusCode || 400).json(err.toJSON());
    }

    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to retry payment",
      },
    });
  }
};

/**
 * POST /api/payments/mock-webhook
 * Test endpoint for mock gateway webhook confirmation
 * Only works in development mode
 */
exports.mockWebhook = async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        success: false,
        error: { message: "Not available in production" },
      });
    }

    const { transactionId, success = true } = req.body;

    if (!transactionId) {
      throw new Error("transactionId is required");
    }

    const Payment = require("./payment.model");
    const payment = await Payment.findOne({ transactionId });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: { message: "Payment not found" },
      });
    }

    if (success) {
      await PaymentService.confirmPayment(payment._id, { source: "mock-webhook" });
    } else {
      await PaymentService.handlePaymentFailure(payment._id, "PAYMENT_DECLINED", {
        reason: "Mock payment declined",
      });
    }

    res.json({
      success: true,
      message: success ? "Payment confirmed" : "Payment declined",
      data: {
        paymentId: payment._id,
        status: success ? "PAID" : "FAILED",
      },
    });
  } catch (err) {
    console.error("[MOCK_WEBHOOK_ERROR]", err.message);

    res.status(500).json({
      success: false,
      error: { message: err.message },
    });
  }
};

module.exports = exports;
