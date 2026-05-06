/**
 * Payment Error Definitions
 * Centralized error codes for payment processing
 */

const PaymentErrors = {
  // Job Validation Errors
  JOB_NOT_FOUND: {
    code: 'PAYMENT_001',
    message: 'Job not found',
    statusCode: 404,
    retryable: false,
  },
  JOB_NOT_OWNED_BY_CLIENT: {
    code: 'PAYMENT_002',
    message: 'Job does not belong to this client',
    statusCode: 403,
    retryable: false,
  },
  INVALID_JOB_PAYMENT_STATUS: {
    code: 'PAYMENT_003',
    message: 'Job payment status does not allow this action',
    statusCode: 400,
    retryable: false,
  },

  // Payment Amount Errors
  INVALID_PAYMENT_AMOUNT: {
    code: 'PAYMENT_010',
    message: 'Payment amount is invalid',
    statusCode: 400,
    retryable: false,
  },
  AMOUNT_MISMATCH: {
    code: 'PAYMENT_011',
    message: 'Payment amount does not match job amount',
    statusCode: 400,
    retryable: false,
  },
  INSUFFICIENT_AMOUNT: {
    code: 'PAYMENT_012',
    message: 'Payment amount is below minimum',
    statusCode: 400,
    retryable: false,
  },
  EXCESSIVE_AMOUNT: {
    code: 'PAYMENT_013',
    message: 'Payment amount exceeds maximum',
    statusCode: 400,
    retryable: false,
  },

  // Duplicate Payment Errors
  DUPLICATE_PAYMENT_DETECTED: {
    code: 'PAYMENT_020',
    message: 'A payment for this job is already in progress',
    statusCode: 409,
    retryable: false,
  },
  PAYMENT_ALREADY_PROCESSED: {
    code: 'PAYMENT_021',
    message: 'This payment has already been processed',
    statusCode: 409,
    retryable: false,
  },

  // Payment Method Errors
  INVALID_PAYMENT_METHOD: {
    code: 'PAYMENT_030',
    message: 'Payment method is not supported',
    statusCode: 400,
    retryable: false,
  },
  PAYMENT_METHOD_NOT_CONFIGURED: {
    code: 'PAYMENT_031',
    message: 'Payment method is not configured',
    statusCode: 503,
    retryable: true,
  },

  // Gateway Errors
  GATEWAY_ERROR: {
    code: 'PAYMENT_040',
    message: 'Payment gateway error occurred',
    statusCode: 502,
    retryable: true,
  },
  GATEWAY_TIMEOUT: {
    code: 'PAYMENT_041',
    message: 'Payment gateway request timed out',
    statusCode: 504,
    retryable: true,
  },
  GATEWAY_UNAVAILABLE: {
    code: 'PAYMENT_042',
    message: 'Payment gateway is unavailable',
    statusCode: 503,
    retryable: true,
  },
  GATEWAY_INVALID_RESPONSE: {
    code: 'PAYMENT_043',
    message: 'Invalid response from payment gateway',
    statusCode: 502,
    retryable: true,
  },

  // Payment Processing Errors
  PAYMENT_DECLINED: {
    code: 'PAYMENT_050',
    message: 'Payment was declined by the gateway',
    statusCode: 400,
    retryable: true,
  },
  PAYMENT_FAILED: {
    code: 'PAYMENT_051',
    message: 'Payment processing failed',
    statusCode: 400,
    retryable: true,
  },
  PAYMENT_CANCELLED: {
    code: 'PAYMENT_052',
    message: 'Payment was cancelled',
    statusCode: 400,
    retryable: false,
  },

  // Database Errors
  DATABASE_ERROR: {
    code: 'PAYMENT_060',
    message: 'Database operation failed',
    statusCode: 500,
    retryable: true,
  },
  TRANSACTION_FAILED: {
    code: 'PAYMENT_061',
    message: 'Transaction could not be completed',
    statusCode: 500,
    retryable: true,
  },

  // Wallet Errors
  WALLET_UPDATE_FAILED: {
    code: 'PAYMENT_070',
    message: 'Failed to update worker wallet',
    statusCode: 500,
    retryable: true,
  },
  INSUFFICIENT_WALLET_BALANCE: {
    code: 'PAYMENT_071',
    message: 'Insufficient wallet balance',
    statusCode: 400,
    retryable: false,
  },

  // Validation Errors
  MISSING_REQUIRED_FIELD: {
    code: 'PAYMENT_080',
    message: 'Missing required field',
    statusCode: 400,
    retryable: false,
  },
  INVALID_REQUEST_FORMAT: {
    code: 'PAYMENT_081',
    message: 'Invalid request format',
    statusCode: 400,
    retryable: false,
  },

  // Authorization Errors
  UNAUTHORIZED: {
    code: 'PAYMENT_090',
    message: 'Unauthorized to perform this action',
    statusCode: 403,
    retryable: false,
  },
  PERMISSION_DENIED: {
    code: 'PAYMENT_091',
    message: 'Permission denied',
    statusCode: 403,
    retryable: false,
  },

  // Generic Errors
  INTERNAL_SERVER_ERROR: {
    code: 'PAYMENT_999',
    message: 'Internal server error',
    statusCode: 500,
    retryable: true,
  },
};

/**
 * Custom Payment Error class
 */
class PaymentError extends Error {
  constructor(errorDef, details = {}) {
    super(errorDef.message);
    this.name = 'PaymentError';
    this.code = errorDef.code;
    this.statusCode = errorDef.statusCode;
    this.retryable = errorDef.retryable;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        retryable: this.retryable,
        timestamp: this.timestamp,
      },
    };
  }
}

module.exports = {
  PaymentErrors,
  PaymentError,
};
