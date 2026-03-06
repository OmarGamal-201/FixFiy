const router = require("express").Router();
const controller = require("./admin.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");

router.use(protect, authorize("admin"));

router.get("/dashboard", controller.dashboard);
router.get("/analytics", controller.analytics);

router.get("/users", controller.getAllUsers);
router.patch("/users/:id/suspend", controller.suspendUser);
router.patch("/users/:id/restore", controller.restoreUser);
router.patch("/workers/:id/verify", controller.verifyTechnician);

router.patch("/jobs/:id/cancel", controller.cancelJob);

router.get("/settings", controller.getSettings);
router.patch("/settings", controller.updateSettings);

router.get("/audit-logs", controller.auditLogs);

module.exports = router;
