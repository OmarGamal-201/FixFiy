const router = require("express").Router();
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");
const controller = require("./withdraw.controller");

router.use(protect);

// Worker
router.post(
  "/request",
  authorize("technician"),
  controller.requestWithdraw
);

// Admin
router.get(
  "/admin/withdraws",
  authorize("admin"),
  controller.getRequests
);

router.patch(
  "/admin/withdraws/:id/approve",
  authorize("admin"),
  controller.approve
);

router.patch(
  "/admin/withdraws/:id/reject",
  authorize("admin"),
  controller.reject
);

module.exports = router;
