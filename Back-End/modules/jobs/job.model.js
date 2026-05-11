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

    // ================= Service =================

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

    // Optional for OPEN jobs
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },

    acceptedProposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
    },

    // ================= Booking Type =================

    bookingType: {
      type: String,
      enum: ["DIRECT", "OPEN"],
      default: "DIRECT",
      index: true,
    },

    // ================= Status =================

    status: {
      type: String,
      enum: [
        "PENDING",
        "ACCEPTED",
        "ACTIVE",
        "DONE",
        "CANCELED",
        "REJECTED",
      ],
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
      },
    ],

    canceledBy: {
      type: String,
      enum: [
        "CLIENT",
        "TECHNICIAN",
        "ADMIN",
      ],
    },

    cancelReason: String,

    // ================= Pricing =================

    total_price: {
      type: Number,
      required: true,
      min: 0,
      max: 10000,
      default: 0,
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
      enum: [
        "UNPAID",
        "DEPOSIT_PAID",
        "PAID",
      ],
      default: "UNPAID",
      index: true,
    },

    depositAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: [
        "MOCK",
        "FAWRY",
        "PAYPAL",
        "CASH",
      ],
      index: true,
    },

    paymentRef: {
      type: String,
      index: true,
      sparse: true,
    },

    // ================= Optional Location =================

    location: {
      lat: Number,
      lng: Number,
    },
  },

  {
    timestamps: true,
  }
);

// ================= Indexes =================

jobSchema.index({
  clientId: 1,
});

jobSchema.index({
  workerId: 1,
});

jobSchema.index({
  status: 1,
});

jobSchema.index({
  bookingType: 1,
});

jobSchema.index({
  bookingType: 1,
  status: 1,
});

jobSchema.index({
  acceptedProposalId: 1,
});

// ================= Virtuals =================

jobSchema.virtual(
  "commission_amount"
).get(function () {

  const total =
    Number(
      this.total_price
    ) || 0;

  const commission =
    Number(
      this.site_commission
    ) || 0;

  return +(
    total *
    (commission / 100)
  ).toFixed(2);
});

jobSchema.virtual(
  "provider_earnings"
).get(function () {

  const total =
    Number(
      this.total_price
    ) || 0;

  const commission =
    Number(
      this.commission_amount
    ) || 0;

  return +(
    total - commission
  ).toFixed(2);
});

// ================= UI STATE =================

jobSchema.virtual("uiState").get(
  function () {
    return {

      canReview:
        this.status ===
          "DONE" &&
        !this.reviewId,

      canChat: [
        "ACCEPTED",
        "ACTIVE",
      ].includes(
        this.status
      ),

      canAccept:
        this.status ===
        "PENDING",

      canPayFinal:
        this.status ===
          "DONE" &&
        this.paymentStatus !==
          "PAID",
    };
  }
);

// ================= JSON =================

jobSchema.set("toJSON", {
  virtuals: true,
});

jobSchema.set("toObject", {
  virtuals: true,
});

module.exports =
  mongoose.model(
    "Job",
    jobSchema
  );