const router = require("express").Router();
const controller = require("./review.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");

/* ===== Client ===== */
router.post(
  "/reviews",
  protect,
  authorize("client"),
  controller.createReview
);

/* ===== Public ===== */
router.get(
  "/reviews/worker/:workerId",
  controller.getWorkerReviews
);

/* ===== Admin ===== */
router.patch(
  "/admin/reviews/:id",
  protect,
  authorize("admin"),
  controller.adminUpdateReview
);

router.delete(
  "/admin/reviews/:id",
  protect,
  authorize("admin"),
  controller.adminDeleteReview
);

module.exports = router;
