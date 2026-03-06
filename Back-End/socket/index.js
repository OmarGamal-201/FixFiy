const { Server } = require("socket.io");
const socketAuth = require("./auth.socket");
const messagingSocket = require("./messaging.socket");
const { setSocketInstance } = require("../utils/emitNotification");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: "*" },
  });

  setSocketInstance(io);

  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.user.id);

    // 👈 room خاص بكل user للإشعارات
    socket.join(socket.user.id);

    messagingSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("🔴 Disconnected:", socket.user.id);
    });
  });
};

module.exports = initSocket;
