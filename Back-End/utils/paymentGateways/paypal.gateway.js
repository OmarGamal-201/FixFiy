/**
 * PayPal Payment Gateway
 * Improved implementation with order capture
 * Supports test and production modes
 */

const PaymentGateway = require('./gateway.base');
const axios = require('axios');

class PayPalGateway extends PaymentGateway {
  constructor(config = {}) {
    super(config);
    this.name = 'PAYPAL';
    this.clientId = config.clientId || process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = config.clientSecret || process.env.PAYPAL_SECRET;
    this.testMode = (process.env.PAYPAL_MODE === 'sandbox');

    // PayPal API endpoints
    if (this.testMode) {
      this.baseUrl = 'https://api-m.sandbox.paypal.com';
    } else {
      this.baseUrl = 'https://api-m.paypal.com';
    }

    // Cache access token
    this.accessToken = null;
    this.accessTokenExpiry = null;

    if (!this.clientId || !this.clientSecret) {
      console.warn('⚠️ PayPal credentials not configured');
    }
  }

  /**
   * Get or refresh access token
   */
  async getAccessToken() {
    // Return cached token if still valid
    if (this.accessToken && this.accessTokenExpiry > Date.now()) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          auth: {
            username: this.clientId,
            password: this.clientSecret,
          },
          headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
          },
        }
      );

      // Cache token
      this.accessToken = response.data.access_token;
      this.accessTokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // Refresh 1min before expiry

      return this.accessToken;
    } catch (error) {
      console.error('PayPal token error:', error.message);
      const err = new Error('Failed to get PayPal access token');
      err.code = 'PAYPAL_AUTH_FAILED';
      err.retryable = true;
      throw err;
    }
  }

  /**
   * Create PayPal order
   */
  async charge(paymentData) {
    const {
      amount,
      jobId,
      clientId,
      type,
      description = 'FixFiy Service Payment',
<<<<<<< HEAD
      returnUrl = `${process.env.APP_URL || 'http://localhost:3000'}/PaymentCallback`,
=======
      returnUrl = `${process.env.APP_URL || 'http://localhost:5173'}/payment-callback`,
>>>>>>> 628ae33e1d6e189b512ecc59d06866dbaba73cd4
    } = paymentData;

    // Validate amount
    if (!amount || amount <= 0) {
      const error = new Error('Invalid payment amount');
      error.code = 'INVALID_AMOUNT';
      error.retryable = false;
      throw error;
    }

    try {
      const accessToken = await this.getAccessToken();

      // Create order payload
     const orderPayload = {
  intent: 'CAPTURE',

  purchase_units: [
    {
      reference_id: this.generateReference(jobId, clientId),

      amount: {
        currency_code: 'USD',
        value: parseFloat(amount).toFixed(2),
      },
    },
  ],

  application_context: {
    brand_name: 'FixFiy',
    return_url: returnUrl,
    cancel_url: `${returnUrl}?cancelled=true`,
    shipping_preference: 'NO_SHIPPING',
    user_action: 'PAY_NOW',
  },

  ...(paymentData.customerEmail && {
    payer: {
      email_address: paymentData.customerEmail,
    },
  }),
};

      // Create order
      const orderResponse = await axios.post(
        `${this.baseUrl}/v2/checkout/orders`,
        orderPayload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Extract approval link
      const approveLink = orderResponse.data.links?.find(
        (link) => link.rel === 'approve'
      );

      if (!approveLink) {
        throw new Error('No approval link in PayPal response');
      }

      return this.formatResponse({
        transactionId: orderResponse.data.id,
        status: 'PENDING',
        approveUrl: approveLink.href,
        amount: amount,
        message: 'Please approve payment on PayPal page',
        expiresIn: 3 * 60 * 60 * 1000, // 3 hours
      });
    } catch (error) {
      console.error('PayPal charge error:', error.message);

      const err = new Error(error.response?.data?.message || error.message);
      err.code = error.response?.status || 'PAYPAL_ERROR';
      err.retryable = !error.response || error.response.status >= 500;
      throw err;
    }
  }

  /**
   * Capture approved order (THIS WAS MISSING IN ORIGINAL!)
   * Must be called after user approves payment on PayPal
   */
  async capture(orderId, amount) {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    try {
      const accessToken = await this.getAccessToken();

      const captureResponse = await axios.post(
        `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Check capture status
      const capture = captureResponse.data.purchase_units?.[0]?.payments?.captures?.[0];

      if (!capture || capture.status !== 'COMPLETED') {
        throw new Error('Payment capture failed or pending');
      }

      return this.formatResponse({
        transactionId: capture.id,
        orderId: orderId,
        status: 'PAID',
        amount: capture.amount.value,
        message: 'Payment captured successfully',
      });
    } catch (error) {
      console.error('PayPal capture error:', error.message);

      const err = new Error(error.response?.data?.message || error.message);
      err.code = 'PAYPAL_CAPTURE_FAILED';
      err.retryable = !error.response || error.response.status >= 500;
      throw err;
    }
  }

  /**
   * Get order details and status
   */
  async getPaymentStatus(orderId) {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseUrl}/v2/checkout/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const order = response.data;
      const capture = order.purchase_units?.[0]?.payments?.captures?.[0];

      let status = 'PENDING';
      if (capture?.status === 'COMPLETED') {
        status = 'PAID';
      } else if (order.status === 'APPROVED') {
        status = 'PROCESSING';
      } else if (order.status === 'VOIDED' || order.status === 'PAYER_ACTION_REQUIRED') {
        status = 'FAILED';
      }

      return this.formatResponse({
        transactionId: capture?.id || orderId,
        orderId: orderId,
        status: status,
        amount: order.purchase_units?.[0]?.amount?.value,
        payerEmail: order.payer?.email_address,
      });
    } catch (error) {
      console.error('PayPal status check error:', error.message);
      throw error;
    }
  }

  /**
   * Refund a payment
   */
  async refund(captureId, amount) {
    if (!captureId) {
      throw new Error('Capture ID is required');
    }

    try {
      const accessToken = await this.getAccessToken();

      const refundPayload = {
        amount: {
          value: parseFloat(amount).toFixed(2),
          currency_code: 'USD',
        },
      };

      const response = await axios.post(
        `${this.baseUrl}/v2/payments/captures/${captureId}/refund`,
        refundPayload,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return this.formatResponse({
        transactionId: response.data.id,
        status: 'REFUNDED',
        amount: amount,
        message: 'Payment refunded successfully',
      });
    } catch (error) {
      console.error('PayPal refund error:', error.message);

      const err = new Error(error.response?.data?.message || error.message);
      err.code = 'PAYPAL_REFUND_FAILED';
      err.retryable = true;
      throw err;
    }
  }

  /**
   * Verify webhook signature from PayPal
   */
  verifyWebhookSignature(webhookBody, signature, webhookId) {
    // PayPal webhook signature verification is complex
    // In production, you should verify using PayPal's signature verification endpoint
    // For now, return true - implement full verification in production
    console.warn('⚠️ PayPal webhook signature verification not implemented');
    return true;
  }

  /**
   * Parse PayPal webhook data
   */
  parseWebhookData(webhookBody) {
    const resource = webhookBody.resource || {};

    let status = 'UNKNOWN';
    if (resource.status === 'COMPLETED') {
      status = 'PAID';
    } else if (resource.status === 'FAILED') {
      status = 'FAILED';
    } else if (resource.status === 'REFUNDED') {
      status = 'REFUNDED';
    }

    return {
      transactionId: resource.id || resource.supplementary_data?.related_ids?.order_id,
      status: status,
      amount: resource.amount?.value,
      currency: resource.amount?.currency_code,
      eventType: webhookBody.event_type,
      timestamp: webhookBody.create_time,
      raw: webhookBody,
    };
  }
}

// Export singleton instance
module.exports = new PayPalGateway({
  clientId: process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_SECRET,
});
