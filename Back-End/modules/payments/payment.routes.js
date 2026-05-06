const router = require("express").Router();
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");
const controller = require("./payment.controller.refactored");
const webhookHandler = require("./webhook.handler");

// ================= WEBHOOK ROUTES (PUBLIC, NO AUTH) =================
// Mock webhook for development
router.post("/mock-webhook", controller.mockWebhook);

// Fawry webhook
router.post("/webhook/fawry", webhookHandler.handleFawryWebhook);

// PayPal webhook
router.post("/webhook/paypal", webhookHandler.handlePayPalWebhook);

// Webhook health check
router.get("/webhook/health", webhookHandler.webhookHealth);

// ================= PROTECTED ROUTES (REQUIRE AUTH) =================
router.use(protect);

// Client pays deposit
router.post(
  "/deposit",
  authorize("client"),
  controller.deposit
);

// Client pays final payment
router.post(
  "/final",
  authorize("client"),
  controller.final
);

// Get payment history for job
router.get("/job/:jobId", controller.getJobPayments);

// Retry payment
router.post("/:paymentId/retry", controller.retryPayment);

// Get payment details
router.get("/:paymentId", controller.getPayment);

module.exports = router;