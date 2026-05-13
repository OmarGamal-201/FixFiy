const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    // ================= JOB =================

   jobId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Job",
  default: null,
  sparse: true,
},

    // ================= TYPE =================

    conversationType: {
      type: String,
      enum: ["INQUIRY", "JOB"],
      default: "INQUIRY",
    },

    // ================= USERS =================

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // ================= LAST MESSAGE =================

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // ================= STATUS =================

    isClosed: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

// ================= INDEXES =================

// Fast participant search
conversationSchema.index({
  participants: 1,
});

// Fast job conversation search
conversationSchema.index({
  jobId: 1,
});

// Fast sorting by latest message
conversationSchema.index({
  lastMessageAt: -1,
});

module.exports = mongoose.model(
  "Conversation",
  conversationSchema
);