const mongoose =
  require("mongoose");

/* ================= Transaction ================= */

const transactionSchema =
  new mongoose.Schema(
    {
      type: {
        type: String,

        enum: [
          "EARNING",
          "WITHDRAW",
          "REFUND",
          "BONUS",
        ],

        required: true,
      },

      amount: {
        type: Number,

        required: true,

        min: 0,
      },

      referenceId: {
        type:
          mongoose.Schema.Types.ObjectId,
      },

      referenceType: {
        type: String,

        enum: [
          "JOB",
          "PAYMENT",
          "WITHDRAW",
          "REFUND",
        ],

        default: "JOB",
      },

      createdAt: {
        type: Date,
        default: Date.now,
      },
    },

    {
      timestamps: true,
    }
  );

/* ================= Wallet ================= */

const walletSchema =
  new mongoose.Schema(
    {
      workerId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "User",

        unique: true,

        required: true,
      },

      balance: {
        type: Number,

        default: 0,

        min: 0,
      },

      transactions: [
        transactionSchema,
      ],
    },

    {
      timestamps: true,
    }
  );

/* ================= Indexes ================= */

walletSchema.index({
  workerId: 1,
});

/* ================= Export ================= */

module.exports =
  mongoose.model(
    "Wallet",
    walletSchema
  );