/**
 * Fawry Payment Gateway
 * Egyptian payment gateway integration
 * Supports test and production modes
 * 
 * Fawry is a leading Egyptian payment solution provider
 * Supports: Credit/Debit cards, E-wallets, Bank transfers
 * 
 * API Documentation: https://developer.fawry.io/
 */

const PaymentGateway = require('./gateway.base');

class FawryGateway extends PaymentGateway {
  constructor(config = {}) {
    super(config);
    this.name = 'FAWRY';
    this.testMode = config.testMode === true;
    this.apiKey = config.apiKey || process.env.FAWRY_API_KEY;
    this.secretKey = config.secretKey || process.env.FAWRY_SECRET_KEY;
    this.merchantCode = config.merchantCode || process.env.FAWRY_MERCHANT_CODE;

    // Fawry API endpoints
    if (this.testMode) {
      this.baseUrl = 'https://atg.fawry.io/api/v2'; // Test environment
    } else {
      this.baseUrl = 'https://api.fawry.io/api/v2'; // Production environment
    }

    this.chargeEndpoint = '/charge';
    this.statusEndpoint = '/status';
    this.webhookSecret = config.webhookSecret || process.env.WEBHOOK_SECRET_FAWRY;

    if (!this.apiKey || !this.secretKey || !this.merchantCode) {
      console.warn('⚠️ Fawry credentials not configured. Set FAWRY_API_KEY, FAWRY_SECRET_KEY, FAWRY_MERCHANT_CODE');
    }
  }

  /**
   * Create charge request with Fawry
   */
  async charge(paymentData) {
    const {
      amount,
      jobId,
      clientId,
      type,
      description = 'FixFiy Service Payment',
      returnUrl = `${process.env.APP_URL || 'http://localhost:3000'}/payment-callback`,
    } = paymentData;

    // Validate amount
    if (!amount || amount < 0.5) {
      const error = new Error('Amount must be at least 0.50 EGP');
      error.code = 'INVALID_AMOUNT';
      error.retryable = false;
      throw error;
    }

    // Generate unique reference
    const reference = this.generateReference(jobId, clientId);

    // Build request payload
    const chargePayload = {
      merchantCode: this.merchantCode,
      merchantRefNum: reference,
      amount: parseFloat(amount).toFixed(2), // Fawry requires 2 decimal places
      currencyCode: 'EGP', // Egyptian Pound
      chargeItems: [
        {
          itemId: `${type}_${jobId}`,
          description: `${description} - ${type}`,
          price: parseFloat(amount).toFixed(2),
          quantity: 1,
        },
      ],
      customer: {
        id: clientId,
        email: paymentData.customerEmail || 'noreply@fixfiy.app',
        phoneNumber: paymentData.customerPhone || null,
      },
      paymentMethod: 'CARD', // Main payment method
      language: 'en-US',
      authCapture: true, // Auto-capture authorized payments
      returnUrl: returnUrl,
      notificationUrl: `${process.env.APP_URL || 'http://localhost:3000'}/api/payments/webhook/fawry`,
    };

    // Add metadata for tracking
    chargePayload.metadata = {
      jobId,
      clientId,
      paymentType: type,
      timestamp: new Date().toISOString(),
    };

    try {
      // Calculate signature for request authentication
      const signature = this.generateRequestSignature(chargePayload);

      // Make API request to Fawry
      const response = await this.makeRequest(
        'POST',
        `${this.baseUrl}${this.chargeEndpoint}`,
        chargePayload,
        {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Signature': signature,
        }
      );

      // Handle Fawry response
      if (response.statusCode !== 200 && response.statusCode !== '200') {
        const error = new Error(response.statusMessage || 'Fawry charge failed');
        error.code = 'FAWRY_CHARGE_FAILED';
        error.retryable = response.statusCode >= 500;
        throw error;
      }

      return this.formatResponse({
        transactionId: response.fawryRefNumber,
        referenceId: reference,
        status: 'PENDING',
        redirectUrl: response.redirectUrl || `https://atg.fawry.io/checkout/${response.fawryRefNumber}`,
        amount: amount,
        message: 'Please complete payment on Fawry checkout page',
        expiresIn: 15 * 60 * 1000, // 15 minutes
      });
    } catch (error) {
      console.error('Fawry charge error:', error.message);

      const err = new Error(error.message || 'Fawry payment failed');
      err.code = error.code || 'GATEWAY_ERROR';
      err.retryable = error.retryable !== false;
      throw err;
    }
  }

  /**
   * Get payment status from Fawry
   */
  async getPaymentStatus(transactionId) {
    if (!transactionId) {
      throw new Error('Transaction ID is required');
    }

    try {
      const statusPayload = {
        merchantCode: this.merchantCode,
        fawryRefNumber: transactionId,
      };

      const signature = this.generateRequestSignature(statusPayload);

      const response = await this.makeRequest(
        'POST',
        `${this.baseUrl}${this.statusEndpoint}`,
        statusPayload,
        {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Signature': signature,
        }
      );

      // Map Fawry status to our standard status
      const status = this.mapFawryStatus(response.paymentStatus);

      return this.formatResponse({
        transactionId,
        status,
        amount: response.amount,
        currency: response.currencyCode || 'EGP',
        paymentMethod: response.paymentMethod,
        timestamp: response.transactionTime,
        raw: response,
      });
    } catch (error) {
      console.error('Fawry status check error:', error.message);
      throw error;
    }
  }

  /**
   * Refund a Fawry payment
   * Fawry refunds must be done manually or via admin panel
   * This is a placeholder for future implementation
   */
  async refund(transactionId, amount) {
    console.warn('⚠️ Fawry refunds not yet implemented. Please handle manually.');
    
    return this.formatResponse({
      transactionId,
      status: 'REFUND_PENDING',
      message: 'Refund must be processed manually via Fawry admin panel',
    });
  }

  /**
   * Capture/confirm a payment
   * Fawry auto-captures with authCapture=true, but this is here for compatibility
   */
  async capture(transactionId, amount) {
    // Fawry auto-captures, so just verify the payment status
    return this.getPaymentStatus(transactionId);
  }

  /**
   * Verify webhook signature from Fawry
   * Ensures webhook is actually from Fawry
   */
  verifyWebhookSignature(payload, signature) {
    if (!this.webhookSecret) {
      console.warn('⚠️ Webhook secret not configured');
      return false;
    }

    // Create canonical payload for signature verification
    const canonicalString = JSON.stringify(payload, Object.keys(payload).sort());
    const expectedSignature = this.hashSignature(canonicalString, this.webhookSecret);

    return expectedSignature === signature;
  }

  /**
   * Parse Fawry webhook data
   */
  parseWebhookData(webhookBody) {
    return {
      transactionId: webhookBody.fawryRefNumber,
      referenceId: webhookBody.merchantRefNum,
      status: this.mapFawryStatus(webhookBody.paymentStatus),
      amount: webhookBody.amount,
      currency: webhookBody.currencyCode,
      paymentMethod: webhookBody.paymentMethod,
      timestamp: webhookBody.transactionTime,
      metadata: webhookBody.metadata || {},
      raw: webhookBody,
    };
  }

  /**
   * Map Fawry payment status to our internal status
   */
  mapFawryStatus(fawryStatus) {
    const statusMap = {
      'SUCCESS': 'PAID',
      'PENDING': 'PENDING',
      'FAILED': 'FAILED',
      'CANCELLED': 'CANCELLED',
      'DECLINED': 'FAILED',
      'INVALID': 'FAILED',
    };

    return statusMap[fawryStatus] || 'UNKNOWN';
  }

  /**
   * Generate request signature for Fawry authentication
   * Uses merchant code + secret key + payload
   */
  generateRequestSignature(payload) {
    const crypto = require('crypto');
    
    // Create canonical string
    let canonicalString = this.merchantCode;
    
    // Add fields in specific order (Fawry requirement)
    if (payload.merchantRefNum) canonicalString += payload.merchantRefNum;
    if (payload.fawryRefNumber) canonicalString += payload.fawryRefNumber;
    
    canonicalString += this.secretKey;

    // Generate SHA256 hash
    return crypto
      .createHash('sha256')
      .update(canonicalString)
      .digest('hex');
  }

  /**
   * Generate request signature alternative (for newer Fawry API versions)
   */
  generateRequestSignatureV2(payload) {
    const crypto = require('crypto');
    const payloadStr = JSON.stringify(payload);
    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(payloadStr);
    return hmac.digest('hex');
  }
}

// Export singleton instance
module.exports = new FawryGateway({
  apiKey: process.env.FAWRY_API_KEY,
  secretKey: process.env.FAWRY_SECRET_KEY,
  merchantCode: process.env.FAWRY_MERCHANT_CODE,
  testMode: process.env.FAWRY_TEST_MODE === 'true',
  webhookSecret: process.env.WEBHOOK_SECRET_FAWRY,
});
