const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema(
  {
    platformCommissionPercent: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },

    currency: {
      type: String,
      default: "EGP",
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// ensure single document
systemSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) settings = await this.create({});
  return settings;
};

module.exports = mongoose.model(
  "SystemSettings",
  systemSettingsSchema
);
