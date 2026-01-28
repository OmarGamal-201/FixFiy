const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    content: {
      type: String,
      required: true,
      trim: true
    },

    messageType: {
      type: String,
      enum: ["TEXT", "SYSTEM"],
      default: "TEXT"
    },

    isRead: {
      type: Boolean,
      default: false
    },

    readAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
