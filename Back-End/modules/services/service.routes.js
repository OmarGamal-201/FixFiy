const router = require("express").Router();
const controller = require("./service.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");

/* ===== CLIENT ===== */
router.get("/", controller.getAllServices);
router.get("/:id", controller.getService);
router.get("/search", controller.search);
router.get("/autocomplete", controller.autocomplete);

/* ===== ADMIN ===== */
router.post(
  "/",
  protect,
  authorize("admin"),
  controller.addService
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  controller.updateService
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  controller.deleteService
);

module.exports = router;
