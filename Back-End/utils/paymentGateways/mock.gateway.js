/**
 * Enhanced Mock Payment Gateway
 * For development and testing only
 * Supports full payment lifecycle and status management
 */

const PaymentGateway = require('./gateway.base');

class MockGateway extends PaymentGateway {
  constructor(config = {}) {
    super(config);
    this.name = 'MOCK';
    this.testMode = true;
    
    // Simulate random failures (0-10% by default)
    this.failureRate = config.failureRate || 0.05;
    
    // Delay to simulate network latency
    this.networkDelay = config.networkDelay || 500;
    
    // In-memory store for testing
    this.transactions = new Map();
  }

  /**
   * Process payment charge
   * Simulates gateway response with realistic delays
   */
  async charge(paymentData) {
    // Simulate network delay
    await this.delay(this.networkDelay);

    const {
      amount,
      jobId,
      clientId,
      type,
    } = paymentData;

    // Validate amount
    if (!amount || amount <= 0) {
      const error = new Error('Invalid payment amount');
      error.code = 'INVALID_AMOUNT';
      error.retryable = false;
      throw error;
    }

    // Simulate random failures (for testing error handling)
    if (Math.random() < this.failureRate) {
      const error = new Error('Mock gateway error: Random simulated failure');
      error.code = 'GATEWAY_ERROR';
      error.retryable = true;
      throw error;
    }

    // Generate transaction ID
    const transactionId = this.generateTransactionId(jobId, clientId, type);

    // Store for webhook simulation
    this.transactions.set(transactionId, {
      transactionId,
      jobId,
      clientId,
      amount,
      type,
      status: 'PENDING', // Mock starts as PENDING
      createdAt: new Date(),
    });

    // Return response
    return this.formatResponse({
      transactionId,
      status: 'PENDING',
      message: `Mock payment created. Use /api/payments/mock-webhook to confirm.`,
      approveUrl: `http://localhost:3000/mock-approve/${transactionId}`,
    });
  }

  /**
   * Simulate webhook confirmation
   * In production, this would be called by the payment provider
   */
  async confirmPayment(transactionId, success = true) {
    await this.delay(300);

    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (success) {
      transaction.status = 'COMPLETED';
      transaction.confirmedAt = new Date();
    } else {
      transaction.status = 'FAILED';
      transaction.failureReason = 'Mock payment declined';
    }

    return transaction;
  }

  /**
   * Simulate payment capture (for PayPal-like flows)
   */
  async capture(transactionId, amount) {
    await this.delay(500);

    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'PENDING') {
      throw new Error(`Cannot capture ${transaction.status} transaction`);
    }

    if (transaction.amount !== amount) {
      throw new Error('Capture amount mismatch');
    }

    transaction.status = 'CAPTURED';
    transaction.capturedAt = new Date();

    return this.formatResponse({
      transactionId,
      status: 'CAPTURED',
      message: 'Payment captured successfully',
    });
  }

  /**
   * Verify webhook signature (mock version - always valid)
   */
  verifyWebhookSignature(payload, signature) {
    // In mock mode, we skip verification
    // In production with real gateways, this would validate HMAC
    return true;
  }

  /**
   * Parse webhook data
   */
  parseWebhookData(webhookBody) {
    return {
      transactionId: webhookBody.transactionId,
      status: webhookBody.status,
      amount: webhookBody.amount,
      timestamp: webhookBody.timestamp,
      metadata: webhookBody.metadata || {},
    };
  }

  /**
   * Refund payment
   */
  async refund(transactionId, amount) {
    await this.delay(500);

    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    transaction.status = 'REFUNDED';
    transaction.refundedAt = new Date();
    transaction.refundAmount = amount;

    return this.formatResponse({
      transactionId,
      status: 'REFUNDED',
      refundAmount: amount,
      message: 'Payment refunded successfully',
    });
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionId) {
    await this.delay(100);

    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return this.formatResponse({
      transactionId,
      status: transaction.status,
      amount: transaction.amount,
      createdAt: transaction.createdAt,
      confirmedAt: transaction.confirmedAt || null,
    });
  }

  /**
   * Get all transactions (for testing)
   */
  getAllTransactions() {
    return Array.from(this.transactions.values());
  }

  /**
   * Clear all transactions (for testing cleanup)
   */
  clearTransactions() {
    this.transactions.clear();
  }

  /**
   * Helper: Simulate async delay
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Helper: Generate mock transaction ID
   */
  generateTransactionId(jobId, clientId, type) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `MOCK_${timestamp}_${random}`;
  }
}

module.exports = new MockGateway({
  failureRate: parseFloat(process.env.MOCK_FAILURE_RATE) || 0.05,
  networkDelay: parseInt(process.env.MOCK_NETWORK_DELAY) || 500,
});
