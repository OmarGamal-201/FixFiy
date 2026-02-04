const router = require("express").Router();
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");
const controller = require("./payment.controller");

router.use(protect);

router.post("/payments/deposit", authorize("client"), controller.deposit);
router.post("/payments/final", authorize("client"), controller.final);

module.exports = router;
