const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "USER_SUSPENDED",
        "USER_RESTORED",
        "TECHNICIAN_VERIFIED",
        "JOB_CANCELLED",
        "SETTINGS_UPDATED",
      ],
      required: true,
    },
    targetType: {
      type: String,
      enum: ["USER", "JOB", "SETTINGS"],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    note: String,
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
