const mongoose = require("mongoose");

const technicianServiceSchema = new mongoose.Schema(
  {
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      max: 10000,
    },

    duration_minutes: {
      type: Number,
      required: true,
      min: 15,
      max: 480,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// technician can't add same service twice
technicianServiceSchema.index(
  { technicianId: 1, serviceId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "TechnicianService",
  technicianServiceSchema
);
