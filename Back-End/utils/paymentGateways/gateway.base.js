/**
 * Abstract Payment Gateway Base Class
 * Defines interface for all payment gateway implementations
 */

class PaymentGateway {
  /**
   * Initialize gateway with credentials
   */
  constructor(config = {}) {
    this.config = config;
    this.name = 'GATEWAY';
    this.timeout = config.timeout || 30000;
    this.testMode = config.testMode || false;
  }

  /**
   * Charge/create payment order
   * Returns: { success: boolean, transactionId: string, ... }
   */
  async charge(paymentData) {
    throw new Error('charge() must be implemented');
  }

  /**
   * Capture/confirm a pending payment (for gateways that support it)
   */
  async capture(transactionId, amount) {
    throw new Error('capture() must be implemented');
  }

  /**
   * Verify webhook signature from gateway
   */
  verifyWebhookSignature(payload, signature) {
    throw new Error('verifyWebhookSignature() must be implemented');
  }

  /**
   * Parse webhook data into standardized format
   */
  parseWebhookData(webhookBody) {
    throw new Error('parseWebhookData() must be implemented');
  }

  /**
   * Refund a payment
   */
  async refund(transactionId, amount) {
    throw new Error('refund() must be implemented');
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionId) {
    throw new Error('getPaymentStatus() must be implemented');
  }

  /**
   * Format response in standardized way
   */
  formatResponse(data) {
    return {
      success: true,
      provider: this.name,
      timestamp: new Date().toISOString(),
      ...data,
    };
  }

  /**
   * Format error in standardized way
   */
  formatError(error) {
    return {
      success: false,
      provider: this.name,
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        retryable: error.retryable !== false,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Helper: Make HTTP request with timeout
   */
  async makeRequest(method, url, data = null, headers = {}) {
    const axios = require('axios');

    try {
      const config = {
        method,
        url,
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'FixFiy-Payment-Gateway/1.0',
          ...headers,
        },
      };

      if (data) config.data = data;

      const response = await axios(config);
      return response.data;
    } catch (error) {
      const err = new Error(error.response?.data?.message || error.message);
      err.code = error.response?.status || 'REQUEST_FAILED';
      err.retryable = !error.response || error.response.status >= 500;
      throw err;
    }
  }

  /**
   * Helper: Generate unique reference for transaction
   */
  generateReference(jobId, clientId, timestamp = Date.now()) {
    const crypto = require('crypto');
    const data = `${jobId}:${clientId}:${timestamp}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
  }

  /**
   * Helper: Hash for signature verification
   */
  hashSignature(data, secret, algorithm = 'sha256') {
    const crypto = require('crypto');
    return crypto.createHmac(algorithm, secret).update(data).digest('hex');
  }
}

module.exports = PaymentGateway;
