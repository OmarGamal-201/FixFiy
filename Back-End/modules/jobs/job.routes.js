const router = require("express").Router();
const controller = require("./job.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");

/* ======================
   CLIENT
====================== */

router.post(
  "/jobs",
  protect,
  authorize("client"),
  controller.createJob
);

router.patch(
  "/jobs/:id/cancel",
  protect,
  controller.cancelJob
);

/* ======================
   TECHNICIAN
====================== */

router.patch(
  "/jobs/:id/accept",
  protect,
  authorize("technician"),
  controller.acceptJob
);

router.patch(
  "/jobs/:id/start",
  protect,
  authorize("technician"),
  controller.startJob
);

router.patch(
  "/jobs/:id/complete",
  protect,
  authorize("technician"),
  controller.completeJob
);

/* ======================
   SHARED
====================== */

router.get(
  "/jobs/:id",
  protect,
  controller.getJobById
);

router.get(
  "/jobs",
  protect,
  controller.getAllJobs
);

/* ======================
   ADMIN
====================== */

router.patch(
  "/jobs/:id/status",
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
