const mongoose = require("mongoose");

const withdrawRequestSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin
    },

    processedAt: Date,

    note: String,
  },
  { timestamps: true }
);

withdrawRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("WithdrawRequest", withdrawRequestSchema);
