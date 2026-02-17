const service = require("./notification.service");

const getMyNotifications = async (req, res) => {
  const data = await service.getUserNotifications(req.user.id);
  res.json({ success: true, data });
};

const markNotificationRead = async (req, res) => {
  await service.markAsRead(req.user.id, req.params.id);
  res.json({ success: true });
};

module.exports = { getMyNotifications, markNotificationRead };
