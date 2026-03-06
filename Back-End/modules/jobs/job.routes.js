const router = require("express").Router();
const controller = require("./job.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");

/* ========= CLIENT ========= */
router.post(
  "/",
  protect,
  authorize("client"),
  controller.createJob
);

router.patch(
  "/:id/cancel",
  protect,
  authorize("client"),
  controller.cancelJob
);

/* ========= TECHNICIAN ========= */
router.patch(
  "/:id/accept",
  protect,
  authorize("technician"),
  controller.acceptJob
);

router.patch(
  "/:id/start",
  protect,
  authorize("technician"),
  controller.startJob
);

router.patch(
  "/:id/complete",
  protect,
  authorize("technician"),
  controller.completeJob
);

/* ========= SHARED ========= */
router.get("/:id", protect, controller.getJobById);
router.get("/", protect, controller.getAllJobs);

/* ========= ADMIN ========= */
router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  controller.updateStatus
);

router.get(
  "/admin/commission-rate",
  protect,
  authorize("admin"),
  controller.getCommissionRate
);

router.put(
  "/admin/commission-rate",
  protect,
  authorize("admin"),
  controller.updateCommissionRate
);

router.get(
  "/admin/commission-stats",
  protect,
  authorize("admin"),
  controller.getCommissionStats
);

module.exports = router;
