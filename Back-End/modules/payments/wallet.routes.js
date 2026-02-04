const router = require("express").Router();
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");
const walletController = require("./wallet.controller");

// Worker wallet
router.get(
  "/wallet",
  protect,
  authorize("technician"),
  walletController.getMyWallet
);

module.exports = router;
