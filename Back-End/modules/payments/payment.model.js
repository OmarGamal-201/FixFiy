const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    /* ================= CORE FIELDS ================= */
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    type: {
      type: String,
      enum: ["DEPOSIT", "FINAL"],
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    heldBy: {
      type: String,
      enum: ["PLATFORM", "WORKER"],
      default: "PLATFORM",
    },

    /* ================= PAYMENT PROVIDER ================= */
    provider: {
      type: String,
      enum: ["MOCK", "FAWRY", "PAYPAL"],
      required: true,
      index: true,
    },

    transactionId: {
      type: String,
      index: true,
      sparse: true,
    },

    /* ================= PAYMENT STATUS ================= */
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "PAID", "FAILED", "CANCELLED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },

    /* ================= IDEMPOTENCY & RETRY ================= */
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxRetries: {
      type: Number,
      default: 3,
    },

    lastRetryAt: Date,

    /* ================= ERROR HANDLING ================= */
    failureReason: {
      type: String,
      enum: [
        "GATEWAY_ERROR",
        "DECLINED",
        "TIMEOUT",
        "INVALID_AMOUNT",
        "DUPLICATE",
        "USER_CANCELLED",
        "VALIDATION_ERROR",
        "UNKNOWN",
      ],
      sparse: true,
    },

    failureDetails: {
      message: String,
      code: String,
      gatewayResponse: Object,
    },

    /* ================= WEBHOOK TRACKING ================= */
    webhookStatus: {
      type: String,
      enum: ["PENDING", "RECEIVED", "PROCESSED", "FAILED"],
      default: "PENDING",
    },

    webhookReceivedAt: Date,

    webhookProcessedAt: Date,

    webhookAttempts: {
      type: Number,
      default: 0,
    },

    /* ================= AUDIT TRAIL ================= */
    metadata: {
      userAgent: String,
      ipAddress: String,
      sessionId: String,
      source: String, // "web", "mobile", "api"
    },

    statusHistory: [
      {
        status: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
        reason: String,
      },
    ],

    /* ================= TIMESTAMPS ================= */
    initiatedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: Date,

    expiresAt: Date, // When pending payment expires
  },
  { timestamps: true }
);

/* ================= INDEXES ================= */
// Compound index for duplicate detection
paymentSchema.index({ jobId: 1, clientId: 1, type: 1 });

// For webhook processing
paymentSchema.index({ webhookStatus: 1, provider: 1 });

// For analytics and reporting
paymentSchema.index({ createdAt: -1, status: 1 });

// For worker earnings
paymentSchema.index({ workerId: 1, status: 1 });

/* ================= VIRTUALS ================= */
paymentSchema.virtual("isRetryable").get(function () {
  return (
    this.status === "FAILED" &&
    this.retryCount < this.maxRetries
  );
});

paymentSchema.virtual("isPending").get(function () {
  return this.status === "PENDING" || this.status === "PROCESSING";
});

paymentSchema.virtual("canCapture").get(function () {
  return this.status === "PENDING" && this.provider === "PAYPAL";
});

paymentSchema.set("toJSON", { virtuals: true });
paymentSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Payment", paymentSchema);
