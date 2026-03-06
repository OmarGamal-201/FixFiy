const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 100,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minLength: 10,
      maxLength: 500,
    },

    base_price: {
      type: Number,
      required: true,
      min: 0,
      max: 10000,
      set: (val) => Math.round(val * 100) / 100,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "plumbing",
        "electrical",
        "carpentry",
        "painting",
        "hvac",
        "appliance_repair",
        "cleaning",
        "landscaping",
        "pest_control",
        "general",
      ],
      index: true,
    },

    duration_minutes: {
      type: Number,
      default: 60,
      min: 15,
      max: 480,
    },

    status: {
      type: String,
      enum: ["available", "not-available"],
      default: "available",
      index: true,
    },

    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    booking_count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ===== Indexes =====
serviceSchema.index({
  name: "text",
  category: "text",
  description: "text",
});
serviceSchema.index({ status: 1, category: 1 });

// ===== Virtuals =====
serviceSchema.virtual("formatted_price").get(function () {
  return `${this.base_price.toFixed(2)} EGP`;
});

serviceSchema.virtual("duration_hours").get(function () {
  return Math.round((this.duration_minutes / 60) * 100) / 100;
});

serviceSchema.set("toJSON", { virtuals: true });
serviceSchema.set("toObject", { virtuals: true });

// ===== Methods =====
serviceSchema.methods.isAvailable = function () {
  return this.status === "available";
};

const Service = mongoose.model("Service", serviceSchema);
module.exports = { Service };
