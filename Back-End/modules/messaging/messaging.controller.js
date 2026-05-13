const messagingService = require("./messaging.service");

/**
 * @desc Create conversation
 * @route POST /api/messages/conversations
 */
const createConversation = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      jobId,
      workerId,
      conversationType,
    } = req.body;

    // ================= VALIDATION =================

    if (
      !["INQUIRY", "JOB"].includes(
        conversationType
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "conversationType must be INQUIRY or JOB",
      });
    }

    // Inquiry chat
    if (
      conversationType === "INQUIRY" &&
      !workerId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "workerId is required for inquiry chat",
      });
    }

    // Job chat
    if (
      conversationType === "JOB" &&
      !jobId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "jobId is required for job chat",
      });
    }

    // ================= CREATE =================

    const conversation =
      await messagingService.createConversation({
        conversationType,
        jobId,
        workerId,
        userId: req.user.id,
      });

    return res.status(201).json({
      success: true,
      data: conversation,
    });

  } catch (err) {
    console.error(
      "Create Conversation Error:",
      err.message
    );

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * @desc Get messages
 * @route GET /api/messages/:conversationId
 */
const getMessages = async (
  req,
  res
) => {
  try {
    const messages =
      await messagingService.getConversationMessages(
        req.params.conversationId,
        req.user.id
      );

    return res.json({
      success: true,
      data: messages,
    });

  } catch (err) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * @desc Send message
 * @route POST /api/messages/:conversationId
 */
const sendMessage = async (
  req,
  res
) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Message content is required",
      });
    }

    const message =
      await messagingService.sendMessage(
        req.params.conversationId,
        req.user.id,
        content
      );

    return res.status(201).json({
      success: true,
      data: message,
    });

  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
const getMyConversations =
  async (req, res) => {

    try {

      const conversations =
        await messagingService.getMyConversations(
          req.user.id
        );

      res.json({
        success: true,
        data: conversations,
      });

    } catch (err) {

      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  };
module.exports = {
  createConversation,
  getMessages,
  sendMessage,
  getMyConversations
};