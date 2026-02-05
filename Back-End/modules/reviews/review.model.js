const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      unique: true, // Review واحدة لكل Job
    },

    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxLength: 500,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ workerId: 1 });

module.exports = mongoose.model("Review", reviewSchema);
