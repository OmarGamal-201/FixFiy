const router = require("express").Router();
const controller = require("./technicianService.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");

/* =========================
   TECHNICIAN
========================= */

router.post(
  "/technician/services",
  protect,
  authorize("technician"),
  controller.addTechnicianService
);

router.get(
  "/technician/services",
  protect,
  authorize("technician"),
  controller.getMyServices
);

router.patch(
  "/technician/services/:id",
  protect,
  authorize("technician"),
  controller.updateTechnicianService
);

router.delete(
  "/technician/services/:id",
  protect,
  authorize("technician"),
  controller.deleteTechnicianService
);

/* =========================
   CLIENT – MATCHING
========================= */

router.get(
  "/services/:serviceId/technicians",
  protect,
  controller.getTechniciansForService
);

module.exports = router;
