let ioInstance = null;

const setSocketInstance = (io) => {
  ioInstance = io;
};

const emitNotification = (userId, payload) => {
  if (!ioInstance) {
    console.warn("Socket.io instance not set");
    return;
  }

  ioInstance.to(userId.toString()).emit("notification", payload);
};

module.exports = {
  setSocketInstance,
  emitNotification,
};
