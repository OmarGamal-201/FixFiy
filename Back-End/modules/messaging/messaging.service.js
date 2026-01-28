const mongoose = require("mongoose");
const Conversation = require("./conversation.model");
const Message = require("./message.model");
const Job = require("../jobs/job.model");

const createConversation = async (jobId, userId) => {
  if (!jobId) throw new Error("jobId is required");
  if (!userId) throw new Error("userId is required");

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new Error("Invalid jobId");
  }

  // ✅ DEFINE job هنا بوضوح
  const job = await Job.findById(jobId);

  if (!job) {
    throw new Error("Job not found");
  }

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

const sendMessage = async (conversationId, senderId, content) => {
  if (!conversationId) throw new Error("conversationId is required");
  if (!senderId) throw new Error("senderId is required");
  if (!content) throw new Error("content is required");

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new Error("Conversation not found");

  if (conversation.isClosed) throw new Error("Conversation closed");

  const isParticipant = conversation.participants.some(
    (id) => id.toString() === senderId.toString()
  );

  if (!isParticipant) throw new Error("Not authorized");

  const message = await Message.create({
    conversationId,
    senderId,
    content,
  });

  conversation.lastMessage = content;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  return message;
};

const getConversationMessages = async (conversationId, userId) => {
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
