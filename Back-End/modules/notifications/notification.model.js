const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
        // 💬 Messaging
        "NEW_MESSAGE",

        // 🧰 Jobs
        "JOB_CREATED",
        "JOB_ACCEPTED",
        "JOB_IN_PROGRESS",
        "JOB_COMPLETED",
        "JOB_CANCELLED",
        "JOB_DISPUTED",

        // 💰 Payments
        "PAYMENT_COMPLETED",
        "PAYMENT_FAILED",
        "WITHDRAWAL_COMPLETED",

        // 👮 Admin / System
        "ADMIN_ALERT",
        "ACCOUNT_VERIFIED",
        "ACCOUNT_SUSPENDED",
        "SYSTEM_ALERT",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    // reference to Job / Message / Payment / etc.
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 🔍 Optimized queries
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
