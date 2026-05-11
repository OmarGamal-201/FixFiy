const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema(
  {
    // ================= Relations =================
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ================= Proposal Details =================
    message: {
      type: String,
      required: true,
      trim: true,
      minLength: 10,
      maxLength: 1000,
    },

   proposedPrice: {
  type: Number,
  default: 0,
},

    estimatedDuration: {
      type: Number, // hours
      min: 0,
      max: 168, // max 1 week
    },

    // ================= Status =================
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"],
      default: "PENDING",
      index: true,
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

    rejectionReason: String,

    // ================= Acceptance Details =================
    acceptedAt: Date,

    // Track which proposal was accepted (for reference)
    acceptedByClientAt: Date,
  },
  { timestamps: true }
);

// ================= Indexes =================
proposalSchema.index({ jobId: 1, technicianId: 1 }, { unique: true });
proposalSchema.index({ jobId: 1, status: 1 });
proposalSchema.index({ technicianId: 1, status: 1 });
proposalSchema.index({ createdAt: -1 });

// ================= Virtuals =================
proposalSchema.virtual("isPending").get(function () {
  return this.status === "PENDING";
});

proposalSchema.virtual("isAccepted").get(function () {
  return this.status === "ACCEPTED";
});

proposalSchema.set("toJSON", { virtuals: true });
proposalSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Proposal", proposalSchema);
