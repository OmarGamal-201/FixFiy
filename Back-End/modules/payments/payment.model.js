const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    type: {
      type: String,
      enum: ["DEPOSIT", "FINAL"],
      required: true,
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

    provider: {
      type: String,
      enum: ["MOCK", "PAYPAL"],
      required: true,
    },

    transactionId: String,

    status: {
      type: String,
      enum: ["PAID", "FAILED", "REFUNDED"],
      default: "PAID",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
