const messagingService = require("../modules/messaging/messaging.service");

module.exports = (io, socket) => {

  /**
   * Join conversation by JOB
   */
  socket.on("joinConversation", async ({ jobId }) => {
    try {
      if (!jobId) throw new Error("jobId is required");

      // 👈 create/get conversation (job-based)
      const conversation =
        await messagingService.createConversation(
          jobId,
          socket.user.id
        );

      socket.join(conversation._id.toString());

      socket.emit("joinedConversation", {
        conversationId: conversation._id,
      });
    } catch (err) {
      socket.emit("errorMessage", err.message);
    }
  });

  /**
   * Send message
   */
  socket.on("sendMessage", async ({ conversationId, content }) => {
    try {
      if (!conversationId || !content)
        throw new Error("conversationId & content required");

      const message = await messagingService.sendMessage(
        conversationId,
        socket.user.id,
        content
      );

      io.to(conversationId).emit("newMessage", message);
    } catch (err) {
      socket.emit("errorMessage", err.message);
    }
  });

};
