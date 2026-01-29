const { Server } = require("socket.io");
const socketAuth = require("./auth.socket");
const messagingSocket = require("./messaging.socket");

//  ربط socket بالـ notification helper
const { setSocketInstance } = require("../utils/emitNotification");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  // نخزّن io عشان نستخدمه في emitNotification
  setSocketInstance(io);

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("🟢 New socket connection");
    console.log("User:", socket.user);

    //  user room للإشعارات
    socket.join(socket.user.id.toString());

    // Messaging
    messagingSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.user?.id);
    });
  });
};

module.exports = initSocket;
