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
    serviceId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Service",
  required: true
},

    description: {
      type: String,
      required: true,
      trim: true,
      minLength: 15,
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

    // ================= Status =================
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "ACTIVE", "DONE", "CANCELED"],
      default: "PENDING",
    },

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

    paymentRef: String, // gateway reference id
  },
  { timestamps: true }
);

// ================= Virtuals =================
jobSchema.virtual("commission_amount").get(function () {
  return +(this.total_price * (this.site_commission / 100)).toFixed(2);
});

jobSchema.virtual("provider_earnings").get(function () {
  return +(this.total_price - this.commission_amount).toFixed(2);
});

jobSchema.set("toJSON", { virtuals: true });
jobSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Job", jobSchema);
