const messagingService = require("../modules/messaging/messaging.service");

module.exports = (io, socket) => {

  // Join conversation room
  socket.on("joinConversation", async ({ conversationId }) => {
    socket.join(conversationId);
  });

  // Send message
  socket.on("sendMessage", async ({ conversationId, content }) => {
    try {
      const message = await messagingService.sendMessage(
        conversationId,
        socket.user.id,
        content
      );

      // Emit to all participants in room
      io.to(conversationId).emit("newMessage", message);

    } catch (error) {
      socket.emit("errorMessage", error.message);
    }
  });

};
