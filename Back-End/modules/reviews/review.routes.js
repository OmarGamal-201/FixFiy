const router = require("express").Router();
const controller = require("./review.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");

/* CLIENT */
router.post(
  "/",
  protect,
  authorize("client"),
  controller.createReview
);

/* PUBLIC */
router.get(
  "/worker/:workerId",
  controller.getWorkerReviews
);

/* ADMIN */
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
