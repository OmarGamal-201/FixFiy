const mongoose = require("mongoose");
const Conversation = require("./conversation.model");
const Message = require("./message.model");
const Job = require("../jobs/job.model");
const {
  createNotification,
} = require("../notifications/notification.service");
const { emitNotification } = require("../../utils/emitNotification");

/**
 * Create conversation for a job (Client ↔ Technician)
 */
const createConversation = async (jobId, userId) => {
  if (!jobId) throw new Error("jobId is required");
  if (!userId) throw new Error("userId is required");

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new Error("Invalid jobId");
  }

  const job = await Job.findById(jobId);
  if (!job) throw new Error("Job not found");

  if (!["ACCEPTED", "IN_PROGRESS"].includes(job.status)) {
    throw new Error("Conversation not allowed for this job");
  }

  const userIdStr = userId.toString();

  const isClient = job.clientId.toString() === userIdStr;
  const isWorker =
    job.workerId && job.workerId.toString() === userIdStr;

  if (!isClient && !isWorker) {
    throw new Error("Not authorized");
  }

  let conversation = await Conversation.findOne({ jobId });
  if (conversation) return conversation;

  conversation = await Conversation.create({
    jobId,
    participants: [job.clientId, job.workerId],
    isClosed: false,
  });

  return conversation;
};

/**
 * Send message + create notification + emit realtime
 */
const sendMessage = async (conversationId, senderId, content) => {
  if (!conversationId) throw new Error("conversationId is required");
  if (!senderId) throw new Error("senderId is required");
  if (!content || !content.trim())
    throw new Error("content is required");

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new Error("Invalid conversationId");
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error("Conversation not found");
  if (conversation.isClosed) throw new Error("Conversation closed");

  const senderIdStr = senderId.toString();

  const isParticipant = conversation.participants.some(
    (id) => id.toString() === senderIdStr
  );

  if (!isParticipant) throw new Error("Not authorized");

  // 1️⃣ Save message
  const message = await Message.create({
    conversationId,
    senderId,
    content,
  });

  // 2️⃣ Update conversation
  conversation.lastMessage = content;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  // 3️⃣ Determine receiver
  const receiverId = conversation.participants.find(
    (id) => id.toString() !== senderIdStr
  );

  if (!receiverId) throw new Error("Receiver not found");

  // 4️⃣ Create notification in DB
  await createNotification({
    userId: receiverId,
    type: "NEW_MESSAGE",
    title: "New Message",
    message: "You have a new message",
    referenceId: conversation._id,
  });

  // 5️⃣ Emit realtime notification 🔔
  emitNotification(receiverId, {
    type: "NEW_MESSAGE",
    title: "New Message",
    message: "You have a new message",
    conversationId: conversation._id,
  });

  return message;
};

/**
 * Get all messages in a conversation
 */
const getConversationMessages = async (conversationId, userId) => {
  if (!conversationId) throw new Error("conversationId is required");
  if (!userId) throw new Error("userId is required");

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new Error("Invalid conversationId");
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error("Conversation not found");

  const isParticipant = conversation.participants.some(
    (id) => id.toString() === userId.toString()
  );

  if (!isParticipant) throw new Error("Not authorized");

  return Message.find({ conversationId }).sort({ createdAt: 1 });
};

module.exports = {
  createConversation,
  sendMessage,
  getConversationMessages,
};
