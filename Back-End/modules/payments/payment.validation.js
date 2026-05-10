/**
 * Payment Validation Module
 * Comprehensive validation for payment requests
 */

const { PaymentErrors, PaymentError } = require('./payment.errors');
const Job = require('../jobs/job.model');

class PaymentValidator {
  /**
   * Validate deposit payment request
   */
  static async validateDepositPayment(jobId, clientId, requestingUserId) {
    // 1. Check authorization
    if (clientId !== requestingUserId)
      // ✅ صح
  {
      throw new PaymentError(PaymentErrors.UNAUTHORIZED, {
        clientId,
        requestingUserId,
      });
    }

    // 2. Find job
    const job = await Job.findById(jobId);
    if (!job) {
      throw new PaymentError(PaymentErrors.JOB_NOT_FOUND, { jobId });
    }

    // 3. Verify job ownership
    if (job.clientId.toString() !== clientId.toString()) {
      throw new PaymentError(PaymentErrors.JOB_NOT_OWNED_BY_CLIENT, {
        jobId,
        clientId,
        actualOwner: job.clientId,
      });
    }

    // 4. Check payment status
    if (job.paymentStatus !== 'UNPAID') {
      throw new PaymentError(
        PaymentErrors.INVALID_JOB_PAYMENT_STATUS,
        {
          jobId,
          currentStatus: job.paymentStatus,
          allowedStatus: 'UNPAID',
        }
      );
    }

    // 5. Verify job has valid deposit amount
    if (!job.depositAmount || job.depositAmount <= 0) {
      throw new PaymentError(PaymentErrors.INVALID_PAYMENT_AMOUNT, {
        jobId,
        depositAmount: job.depositAmount,
      });
    }

    // 6. Verify job status allows deposit
    if (!['PENDING', 'ACCEPTED'].includes(job.status)) {
      throw new PaymentError(
        PaymentErrors.INVALID_JOB_PAYMENT_STATUS,
        {
          jobId,
          jobStatus: job.status,
          message: 'Job must be PENDING or ACCEPTED to pay deposit',
        }
      );
    }

    return job;
  }

  /**
   * Validate final payment request
   */
  static async validateFinalPayment(jobId, clientId, requestingUserId) {
    // 1. Check authorization
    if (clientId !== requestingUserId) {
      throw new PaymentError(PaymentErrors.UNAUTHORIZED, {
        clientId,
        requestingUserId,
      });
    }

    // 2. Find job
    const job = await Job.findById(jobId);
    if (!job) {
      throw new PaymentError(PaymentErrors.JOB_NOT_FOUND, { jobId });
    }

    // 3. Verify job ownership
    if (job.clientId.toString() !== clientId.toString()) {
      throw new PaymentError(PaymentErrors.JOB_NOT_OWNED_BY_CLIENT, {
        jobId,
        clientId,
        actualOwner: job.clientId,
      });
    }

    // 4. Check payment status - must have deposit paid
    if (job.paymentStatus !== 'DEPOSIT_PAID') {
      throw new PaymentError(
        PaymentErrors.INVALID_JOB_PAYMENT_STATUS,
        {
          jobId,
          currentStatus: job.paymentStatus,
          allowedStatus: 'DEPOSIT_PAID',
        }
      );
    }

    // 5. Verify job status allows final payment
    if (job.status !== 'DONE') {
      throw new PaymentError(
        PaymentErrors.INVALID_JOB_PAYMENT_STATUS,
        {
          jobId,
          jobStatus: job.status,
          message: 'Job must be DONE to pay final amount',
        }
      );
    }

    // 6. Verify worker is assigned
    if (!job.workerId) {
      throw new PaymentError(PaymentErrors.JOB_NOT_OWNED_BY_CLIENT, {
        jobId,
        message: 'No worker assigned to this job',
      });
    }

    return job;
  }

  /**
   * Validate payment amount
   */
  static validateAmount(amount, minAmount = 1, maxAmount = 10000) {
    if (!amount || typeof amount !== 'number') {
      throw new PaymentError(PaymentErrors.INVALID_PAYMENT_AMOUNT, {
        amount,
        message: 'Amount must be a number',
      });
    }

    if (amount < minAmount) {
      throw new PaymentError(PaymentErrors.INSUFFICIENT_AMOUNT, {
        amount,
        minAmount,
      });
    }

    if (amount > maxAmount) {
      throw new PaymentError(PaymentErrors.EXCESSIVE_AMOUNT, {
        amount,
        maxAmount,
      });
    }

    // Amount should not be NaN or Infinity
    if (!Number.isFinite(amount)) {
      throw new PaymentError(PaymentErrors.INVALID_PAYMENT_AMOUNT, {
        amount,
        message: 'Amount must be a finite number',
      });
    }

    return true;
  }

  /**
   * Validate payment method
   */
  static validatePaymentMethod(method, enabledMethods = ['MOCK', 'FAWRY', 'PAYPAL']) {
    if (!method) {
      throw new PaymentError(PaymentErrors.MISSING_REQUIRED_FIELD, {
        field: 'paymentMethod',
      });
    }

    const upperMethod = method.toUpperCase();
    if (!enabledMethods.includes(upperMethod)) {
      throw new PaymentError(PaymentErrors.INVALID_PAYMENT_METHOD, {
        method: upperMethod,
        enabledMethods,
      });
    }

    return upperMethod;
  }

  /**
   * Validate request format
   */
  static validateRequestFormat(body, requiredFields = ['jobId']) {
    for (const field of requiredFields) {
      if (!body[field]) {
        throw new PaymentError(PaymentErrors.MISSING_REQUIRED_FIELD, {
          field,
        });
      }
    }

    // Check for unexpected fields (security)
    const allowedFields = ['jobId', 'paymentMethod', ...requiredFields];
    const bodyFields = Object.keys(body);
    const unexpectedFields = bodyFields.filter(
      (field) => !allowedFields.includes(field)
    );

    if (unexpectedFields.length > 0) {
      // Log warning but don't fail - ignore extra fields
      console.warn('Unexpected fields in payment request:', unexpectedFields);
    }

    return true;
  }
}

module.exports = PaymentValidator;
