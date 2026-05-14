const router =
  require("express").Router();

const {
  protect,
} = require(
  "../../middlewares/auth.middleware"
);

const {
  authorize,
} = require(
  "../../middlewares/role.middleware"
);

const walletController =
  require("./wallet.controller");

/* ================= Wallet ================= */

router.get(
  "/",
  protect,
  authorize("technician"),
  walletController.getMyWallet
);

/* ================= Transactions ================= */

router.get(
  "/transactions",
  protect,
  authorize("technician"),
  walletController.getTransactions
);

module.exports =
  router;