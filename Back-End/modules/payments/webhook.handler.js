/**
 * Webhook Handlers
 * Receive and process payment confirmations from payment gateways
 */

const Payment = require("./payment.model");
const PaymentService = require("./payment.service.refactored");
const gatewayFactory = require("../../utils/paymentGateways");

/**
 * Fawry Webhook Handler
 * POST /api/payments/webhook/fawry
 */
exports.handleFawryWebhook = async (req, res) => {
  try {
    console.log("[FAWRY_WEBHOOK] Received webhook");

    const fawryGateway = gatewayFactory.get("FAWRY");

    // 1. Verify webhook signature
    const signature = req.headers["x-signature"] || req.body.signature;
    if (!fawryGateway.verifyWebhookSignature(req.body, signature)) {
      console.error("[FAWRY_WEBHOOK_ERROR] Invalid signature");
      return res.status(401).json({
        success: false,
        error: "Invalid signature",
      });
    }

    // 2. Parse webhook data
    const webhookData = fawryGateway.parseWebhookData(req.body);
    console.log("[FAWRY_WEBHOOK] Parsed data:", webhookData);

    // 3. Find payment by transaction ID
    const payment = await Payment.findOne({
      transactionId: webhookData.transactionId,
    });

    if (!payment) {
      console.warn(`[FAWRY_WEBHOOK] Payment not found for transaction ${webhookData.transactionId}`);
      // Return 200 to acknowledge receipt (don't retry)
      return res.json({ success: true, message: "Received" });
    }

    // 4. Check for duplicate webhook processing
    if (payment.webhookStatus === "PROCESSED") {
      console.log("[FAWRY_WEBHOOK] Already processed, returning cached response");
      return res.json({ success: true, message: "Already processed" });
    }

    // 5. Update webhook status
    payment.webhookStatus = "RECEIVED";
    payment.webhookReceivedAt = new Date();
    payment.webhookAttempts = (payment.webhookAttempts || 0) + 1;

    // 6. Process based on payment status
    if (webhookData.status === "PAID") {
      await PaymentService.confirmPayment(payment._id, {
        source: "fawry_webhook",
        webhookData,
      });
    } else if (
      webhookData.status === "FAILED" ||
      webhookData.status === "CANCELLED"
    ) {
      await PaymentService.handlePaymentFailure(
        payment._id,
        webhookData.status,
        {
          webhookData,
        }
      );
    } else {
      // Unknown status, update payment for logging
      payment.webhookStatus = "PROCESSED";
      payment.webhookProcessedAt = new Date();
      await payment.save();

      console.warn(
        `[FAWRY_WEBHOOK] Unknown status: ${webhookData.status}`
      );
    }

    // 7. Return success response
    res.json({
      success: true,
      message: "Webhook processed successfully",
      transactionId: webhookData.transactionId,
    });
  } catch (error) {
    console.error("[FAWRY_WEBHOOK_ERROR]", error.message);

    // Log error but return 200 (don't retry)
    res.status(200).json({
      success: false,
      error: error.message,
      message: "Webhook received but processing failed - will retry",
    });
  }
};

/**
 * PayPal Webhook Handler
 * POST /api/payments/webhook/paypal
 */
exports.handlePayPalWebhook = async (req, res) => {
  try {
    console.log("[PAYPAL_WEBHOOK] Received webhook");

    const paypalGateway = gatewayFactory.get("PAYPAL");

    // 1. Verify webhook signature
    const signature = req.headers["paypal-transmission-sig"];
    const transmissionId = req.headers["paypal-transmission-id"];
    const transmissionTime = req.headers["paypal-transmission-time"];
    const certUrl = req.headers["paypal-cert-url"];
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    // TODO: Implement proper PayPal signature verification
    // await paypalGateway.verifyWebhookSignature(req.body, signature, webhookId);

    // 2. Parse webhook data
    const webhookData = paypalGateway.parseWebhookData(req.body);

    console.log("[PAYPAL_WEBHOOK] Parsed data:", webhookData);

    // 3. Event type
    const eventType = req.body.event_type;

    /**
     * ============================================================
     * ORDER APPROVED / COMPLETED
     * ============================================================
     */
    if (
      eventType === "CHECKOUT.ORDER.APPROVED" ||
      eventType === "CHECKOUT.ORDER.COMPLETED"
    ) {
      const orderId = webhookData.transactionId;

      console.log("[PAYPAL_WEBHOOK] Order ID:", orderId);

      // Find payment
      const payment = await Payment.findOne({
        transactionId: orderId,
      });

      if (!payment) {
        console.warn(
          `[PAYPAL_WEBHOOK] Payment not found for order ${orderId}`
        );

        return res.json({
          success: true,
          message: "Received",
        });
      }

      // Already processed
      if (payment.webhookStatus === "PROCESSED") {
        console.log("[PAYPAL_WEBHOOK] Already processed");

        return res.json({
          success: true,
          message: "Already processed",
        });
      }

      // Mark webhook received
      payment.webhookStatus = "RECEIVED";
      payment.webhookReceivedAt = new Date();

      await payment.save();

      console.log(
        `[PAYPAL_WEBHOOK] Confirming payment ${payment._id}`
      );

      // CONFIRM PAYMENT مباشرة
      await PaymentService.confirmPayment(payment._id, {
        source: "paypal_webhook",
        webhookData,
      });

      console.log(
        `[PAYPAL_WEBHOOK] Payment confirmed ${payment._id}`
      );
    }

    /**
     * ============================================================
     * CAPTURE COMPLETED
     * ============================================================
     */
    else if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const captureId = req.body.resource?.id;

      console.log("[PAYPAL_WEBHOOK] Capture ID:", captureId);

      const payment = await Payment.findOne({
        $or: [
          { transactionId: captureId },
          { "metadata.captureId": captureId },
        ],
      });

      if (!payment) {
        console.warn(
          `[PAYPAL_WEBHOOK] Payment not found for capture ${captureId}`
        );

        return res.json({
          success: true,
          message: "Received",
        });
      }

      if (payment.webhookStatus === "PROCESSED") {
        return res.json({
          success: true,
          message: "Already processed",
        });
      }

      payment.webhookStatus = "RECEIVED";
      payment.webhookReceivedAt = new Date();

      await payment.save();

      await PaymentService.confirmPayment(payment._id, {
        source: "paypal_webhook",
        webhookData,
      });

      console.log(
        `[PAYPAL_WEBHOOK] Capture confirmed ${payment._id}`
      );
    }

    /**
     * ============================================================
     * PAYMENT DENIED
     * ============================================================
     */
    else if (eventType === "PAYMENT.CAPTURE.DENIED") {
      const captureId = req.body.resource?.id;

      const payment = await Payment.findOne({
        $or: [
          { transactionId: captureId },
          { "metadata.captureId": captureId },
        ],
      });

      if (!payment) {
        return res.json({
          success: true,
          message: "Received",
        });
      }

      await PaymentService.handlePaymentFailure(
        payment._id,
        "PAYMENT_DECLINED",
        {
          webhookData,
        }
      );

      console.log(
        `[PAYPAL_WEBHOOK] Payment declined ${payment._id}`
      );
    }

    /**
     * ============================================================
     * UNKNOWN EVENT
     * ============================================================
     */
    else {
      console.log(
        `[PAYPAL_WEBHOOK] Ignored event type: ${eventType}`
      );
    }

    // Success response
    return res.json({
      success: true,
      message: "Webhook processed successfully",
    });

  } catch (error) {
    console.error("[PAYPAL_WEBHOOK_ERROR]", error);

    return res.status(200).json({
      success: false,
      error: error.message,
    });
  }
};
/**
 * Webhook Health Check
 * GET /api/payments/webhook/health
 */
exports.webhookHealth = async (req, res) => {
  try {
    // Check if webhooks are properly configured
    const webhookStatus = {
      fawry: !!process.env.FAWRY_API_KEY,
      paypal: !!process.env.PAYPAL_CLIENT_ID,
      mock: true,
    };

    const recentWebhooks = await Payment.find({
      webhookReceivedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    })
      .select("transactionId webhookStatus createdAt")
      .limit(10);

    res.json({
      success: true,
      data: {
        configured: webhookStatus,
        recentWebhooks,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = exports;
