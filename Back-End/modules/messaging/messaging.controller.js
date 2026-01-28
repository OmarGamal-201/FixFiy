const messagingService = require("./messaging.service");

/**
 * @desc    Create new conversation (job-based)
 * @route   POST /api/conversations
 * @access  Protected
 */
const createConversation = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not authenticated",
      });
    }

    console.log("REQ BODY:", req.body);
    console.log("REQ BODY jobId:", req.body.jobId);

    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "jobId is required",
      });
    }

    const userId = req.user.id;
    console.log("USER ID:", userId);

    const conversation = await messagingService.createConversation(
      jobId,
      userId
    );

    return res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (err) {
    console.error("Create Conversation Error:", err.message);

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


/**
 * @desc    Get messages of a conversation
 * @route   GET /api/messages/:conversationId
 * @access  Protected (participant only)
 */
const getMessages = async (req, res) => {
  try {
    // ✅ Auth validation
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: user not authenticated",
      });
    }

    const { conversationId } = req.params;

    // ✅ Param validation
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "conversationId is required",
      });
    }

    const messages = await messagingService.getConversationMessages(
      conversationId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (err) {
    console.error("Get Messages Error:", err.message);

    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createConversation,
  getMessages,
};
