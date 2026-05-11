const mongoose = require("mongoose");

const Conversation =
  require("./conversation.model");

const Message =
  require("./message.model");

const Job =
  require("../jobs/job.model");

const {
  createNotification,
} = require(
  "../notifications/notification.service"
);

const {
  emitNotification,
} = require(
  "../../utils/emitNotification"
);

/**
 * =========================================
 * CREATE CONVERSATION
 * =========================================
 */

const createConversation =
  async (
    jobId,
    userId
  ) => {

    if (!jobId)
      throw new Error(
        "jobId is required"
      );

    if (!userId)
      throw new Error(
        "userId is required"
      );

    if (
      !mongoose.Types.ObjectId.isValid(
        jobId
      )
    ) {
      throw new Error(
        "Invalid jobId"
      );
    }

    const job =
      await Job.findById(
        jobId
      );

    if (!job)
      throw new Error(
        "Job not found"
      );

    // ONLY ACCEPTED / ACTIVE JOBS

    if (
      ![
        "ACCEPTED",
        "ACTIVE",
      ].includes(
        job.status
      )
    ) {
      throw new Error(
        "Conversation not allowed for this job"
      );
    }

    const userIdStr =
      userId.toString();

    const isClient =
      job.clientId.toString() ===
      userIdStr;

    const isWorker =
      job.workerId &&
      job.workerId.toString() ===
        userIdStr;

    if (
      !isClient &&
      !isWorker
    ) {
      throw new Error(
        "Not authorized"
      );
    }

    // CHECK EXISTING CONVERSATION

    let conversation =
      await Conversation.findOne(
        {
          jobId,
        }
      );

    if (conversation)
      return conversation;

    // CREATE NEW

    conversation =
      await Conversation.create(
        {
          jobId,

          participants: [
            job.clientId,
            job.workerId,
          ],

          isClosed: false,
        }
      );

    return conversation;
  };

/**
 * =========================================
 * SEND MESSAGE
 * =========================================
 */

const sendMessage =
  async (
    conversationId,
    senderId,
    content
  ) => {

    if (!conversationId)
      throw new Error(
        "conversationId is required"
      );

    if (!senderId)
      throw new Error(
        "senderId is required"
      );

    if (
      !content ||
      !content.trim()
    ) {
      throw new Error(
        "content is required"
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        conversationId
      )
    ) {
      throw new Error(
        "Invalid conversationId"
      );
    }

    const conversation =
      await Conversation.findById(
        conversationId
      );

    if (!conversation) {
      throw new Error(
        "Conversation not found"
      );
    }

    if (
      conversation.isClosed
    ) {
      throw new Error(
        "Conversation closed"
      );
    }

    const senderIdStr =
      senderId.toString();

    // VERIFY PARTICIPANT

    const isParticipant =
      conversation.participants.some(
        (id) =>
          id.toString() ===
          senderIdStr
      );

    if (!isParticipant) {
      throw new Error(
        "Not authorized"
      );
    }

    /**
     * SAVE MESSAGE
     */

    let message =
      await Message.create({
        conversationId,
        senderId,
        content,
      });

    /**
     * IMPORTANT FIX
     * POPULATE SENDER
     */

    message =
      await Message.findById(
        message._id
      ).populate(
        "senderId",
        "_id name role"
      );

    /**
     * UPDATE CONVERSATION
     */

    conversation.lastMessage =
      content;

    conversation.lastMessageAt =
      new Date();

    await conversation.save();

    /**
     * FIND RECEIVER
     */

    const receiverId =
      conversation.participants.find(
        (id) =>
          id.toString() !==
          senderIdStr
      );

    if (!receiverId) {
      throw new Error(
        "Receiver not found"
      );
    }

    /**
     * CREATE NOTIFICATION
     */

    await createNotification({
      userId: receiverId,

      type: "NEW_MESSAGE",

      title:
        "New Message",

      message:
        "You have a new message",

      referenceId:
        conversation._id,
    });

    /**
     * REALTIME NOTIFICATION
     */

    emitNotification(
      receiverId,
      {
        type:
          "NEW_MESSAGE",

        title:
          "New Message",

        message:
          "You have a new message",

        conversationId:
          conversation._id,
      }
    );

    return message;
  };

/**
 * =========================================
 * GET CONVERSATION MESSAGES
 * =========================================
 */

const getConversationMessages =
  async (
    conversationId,
    userId
  ) => {

    if (!conversationId) {
      throw new Error(
        "conversationId is required"
      );
    }

    if (!userId) {
      throw new Error(
        "userId is required"
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        conversationId
      )
    ) {
      throw new Error(
        "Invalid conversationId"
      );
    }

    const conversation =
      await Conversation.findById(
        conversationId
      );

    if (!conversation) {
      throw new Error(
        "Conversation not found"
      );
    }

    const isParticipant =
      conversation.participants.some(
        (id) =>
          id.toString() ===
          userId.toString()
      );

    if (!isParticipant) {
      throw new Error(
        "Not authorized"
      );
    }

    /**
     * IMPORTANT FIX
     * POPULATE senderId
     */

    return Message.find({
      conversationId,
    })
      .populate(
        "senderId",
        "_id name role"
      )
      .sort({
        createdAt: 1,
      });
  };

module.exports = {
  createConversation,
  sendMessage,
  getConversationMessages,
};