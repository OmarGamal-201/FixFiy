const mongoose = require("mongoose");

const Conversation =
  require("./conversation.model");

const Message =
  require("./message.model");

const Job =
  require("../jobs/job.model");

const {
  User,
} = require("../users/user.model");

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
  async ({
    conversationType,
    jobId,
    workerId,
    userId,
  }) => {

    if (!userId) {
      throw new Error(
        "userId is required"
      );
    }

    /**
     * =========================================
     * INQUIRY CHAT
     * =========================================
     */

    if (
      conversationType ===
      "INQUIRY"
    ) {

      if (!workerId) {
        throw new Error(
          "workerId is required"
        );
      }

      const worker =
        await User.findById(
          workerId
        );

      if (!worker) {
        throw new Error(
          "Worker not found"
        );
      }

      // prevent self chat

      if (
        workerId.toString() ===
        userId.toString()
      ) {
        throw new Error(
          "Cannot chat with yourself"
        );
      }

      /**
       * CHECK EXISTING
       */

      let existingConversation =
        await Conversation.findOne(
          {
            conversationType:
              "INQUIRY",

            participants: {
              $all: [
                userId,
                workerId,
              ],
            },
          }
        );

      if (
        existingConversation
      ) {
        return existingConversation;
      }

      /**
       * CREATE
       */

      const conversation =
        await Conversation.create(
          {
            conversationType:
              "INQUIRY",

            jobId: null,

            participants: [
              userId,
              workerId,
            ],

            isClosed: false,
          }
        );

      return conversation;
    }

    /**
     * =========================================
     * JOB CHAT
     * =========================================
     */

    if (
      conversationType === "JOB"
    ) {

      if (!jobId) {
        throw new Error(
          "jobId is required"
        );
      }

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

      if (!job) {
        throw new Error(
          "Job not found"
        );
      }

      // ONLY ACCEPTED / ACTIVE

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

      const isClient =
        job.clientId.toString() ===
        userId.toString();

      const isWorker =
        job.workerId &&
        job.workerId.toString() ===
          userId.toString();

      if (
        !isClient &&
        !isWorker
      ) {
        throw new Error(
          "Not authorized"
        );
      }

      /**
       * EXISTING
       */

      let conversation =
        await Conversation.findOne(
          {
            jobId,
            conversationType:
              "JOB",
          }
        );

      if (conversation) {
        return conversation;
      }

      /**
       * CREATE
       */

      conversation =
        await Conversation.create(
          {
            jobId,

            conversationType:
              "JOB",

            participants: [
              job.clientId,
              job.workerId,
            ],

            isClosed: false,
          }
        );

      return conversation;
    }

    throw new Error(
      "Invalid conversation type"
    );
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

    const isParticipant =
      conversation.participants.some(
        (id) =>
          id.toString() ===
          senderId.toString()
      );

    if (!isParticipant) {
      throw new Error(
        "Not authorized"
      );
    }

    /**
     * CREATE MESSAGE
     */

    let message =
      await Message.create({
        conversationId,
        senderId,
        content,
      });

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
     * RECEIVER
     */

    const receiverId =
      conversation.participants.find(
        (id) =>
          id.toString() !==
          senderId.toString()
      );

    /**
     * NOTIFICATION
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

const getMyConversations =
  async (userId) => {

    const conversations =
      await Conversation.find({
        participants: userId,
      })
        .populate(
          "participants",
          "name role specialty"
        )
        .populate(
          "jobId"
        )
        .sort({
          updatedAt: -1,
        });

    return conversations;
  };
module.exports = {
  createConversation,
  sendMessage,
  getConversationMessages,
  getMyConversations
};