const Notification = require("./notification.model");

const createNotification = async (payload) => {
  return Notification.create(payload);
};

const getUserNotifications = async (userId) => {
  return Notification.find({ userId }).sort({ createdAt: -1 });
};

const markAsRead = async (userId, notificationId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
};

module.exports = { createNotification, getUserNotifications, markAsRead };
