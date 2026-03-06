const router = require("express").Router();
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");
const controller = require("./payment.controller");

router.use(protect);

// Client pays deposit
router.post(
  "/deposit",
  authorize("client"),
  controller.deposit
);

// Client pays final payment
router.post(
  "/final",
  authorize("client"),
  controller.final
);

module.exports = router;
