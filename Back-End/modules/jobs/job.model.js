const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    // ================= Core Info =================
    title: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 30,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minLength: 15,
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    // ================= Relations =================
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },

    // ================= Status =================
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "ACTIVE", "DONE", "CANCELED"],
      default: "PENDING",
    },

    statusHistory: [
      {
        status: String,
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    canceledBy: {
      type: String,
      enum: ["CLIENT", "TECHNICIAN", "ADMIN"],
    },

    cancelReason: String,

    // ================= Pricing =================
    total_price: {
      type: Number,
      required: true,
      min: 0,
      max: 10000,
    },

    site_commission: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },

    // ================= Payment =================
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "DEPOSIT_PAID", "PAID"],
      default: "UNPAID",
    },

    depositAmount: {
      type: Number,
      default: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["PAYPAL", "PAYMOB", "CASH"],
    },

    paymentRef: String,
  },
  { timestamps: true }
);

// ================= Indexes =================
jobSchema.index({ clientId: 1 });
jobSchema.index({ workerId: 1 });
jobSchema.index({ status: 1 });

// ================= Virtuals =================
jobSchema.virtual("commission_amount").get(function () {
  return +(this.total_price * (this.site_commission / 100)).toFixed(2);
});

jobSchema.virtual("provider_earnings").get(function () {
  return +(this.total_price - this.commission_amount).toFixed(2);
});
jobSchema.virtual("uiState").get(function () {
  return {
    canReview: this.status === "DONE" && !this.reviewId,
    canChat: ["ACCEPTED", "ACTIVE"].includes(this.status),
    canAccept: this.status === "PENDING",
    canPayFinal: this.status === "DONE" && this.paymentStatus !== "PAID",
  };
});

jobSchema.set("toJSON", { virtuals: true });
jobSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Job", jobSchema);
