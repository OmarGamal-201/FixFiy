const messagingService =
  require("../modules/messaging/messaging.service");

module.exports = (io, socket) => {

  /**
   * JOIN CONVERSATION
   */

  socket.on(
    "joinConversation",
    ({ conversationId }) => {

      if (!conversationId) return;

      socket.join(
        conversationId
      );

      socket.emit(
        "joinedConversation",
        {
          conversationId,
        }
      );
    }
  );

  /**
   * SEND MESSAGE
   */

  socket.on(
    "sendMessage",
    async ({
      conversationId,
      content,
    }) => {

      try {

        if (
          !conversationId ||
          !content
        ) {
          throw new Error(
            "conversationId & content required"
          );
        }

        const message =
          await messagingService.sendMessage(
            conversationId,
            socket.user.id,
            content
          );

        io.to(
          conversationId
        ).emit(
          "newMessage",
          message
        );

      } catch (err) {

        socket.emit(
          "errorMessage",
          err.message
        );
      }
    }
  );
};