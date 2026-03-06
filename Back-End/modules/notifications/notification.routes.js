const router = require("express").Router();
const { protect } = require("../../middlewares/auth.middleware");
const ctrl = require("./notification.controller");

router.get("/", protect, ctrl.getMyNotifications);
router.patch("/:id/read", protect, ctrl.markNotificationRead);

module.exports = router;
