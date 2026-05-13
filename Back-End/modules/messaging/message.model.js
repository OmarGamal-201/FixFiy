const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // ================= CONVERSATION =================

    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    // ================= SENDER =================

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ================= MESSAGE =================

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // ================= TYPE =================

    messageType: {
      type: String,
      enum: [
        "TEXT",
        "SYSTEM",
        "IMAGE",
      ],
      default: "TEXT",
    },

    // ================= READ =================

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },

    // ================= OPTIONAL FILE =================

    image: {
      type: String,
      default: "",
    },
  },

  {
    timestamps: true,
  }
);

// ================= INDEXES =================

messageSchema.index({
  conversationId: 1,
  createdAt: 1,
});

module.exports = mongoose.model(
  "Message",
  messageSchema
);