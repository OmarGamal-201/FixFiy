const { Server } = require("socket.io");
const socketAuth = require("./auth.socket");
const messagingSocket = require("./messaging.socket");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use(socketAuth);

io.on("connection", (socket) => {
  console.log(" New socket connection");
  console.log("User:", socket.user);

  messagingSocket(io, socket);

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.user?.id);
  });
});

};

module.exports = initSocket;
