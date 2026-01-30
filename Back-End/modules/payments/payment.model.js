const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
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
      required: true,
      index: true,
    },

    method: {
      type: String,
      enum: ["CASH", "WALLET", "CARD"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    platformCommission: {
      type: Number,
      required: true,
      min: 0,
    },

    workerAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true,
    },

    transactionRef: {
      type: String, // external gateway ref (Stripe, Paymob, etc.)
    },

    paidAt: {
      type: Date,
    },

    refundedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

/* ================= Indexes ================= */

paymentSchema.index({ createdAt: -1 });

/* ================= Hooks ================= */

// Automatically set paidAt
paymentSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "PAID") {
    this.paidAt = new Date();
  }

  if (this.isModified("status") && this.status === "REFUNDED") {
    this.refundedAt = new Date();
  }

  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
