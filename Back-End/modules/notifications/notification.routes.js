const router = require("express").Router();
const { protect } = require("../../middlewares/auth.middleware");
const ctrl = require("./notification.controller");

router.get("/notifications", protect, ctrl.getMyNotifications);
router.patch("/notifications/:id/read", protect, ctrl.markNotificationRead);

module.exports = router;
