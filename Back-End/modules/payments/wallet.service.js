const Wallet = require("./wallet.model");

/**
 * Get wallet by worker
 */
const getWalletByWorker = async (workerId) => {
  let wallet = await Wallet.findOne({ workerId });

  // auto-create wallet if not exists
  if (!wallet) {
    wallet = await Wallet.create({ workerId });
  }

  return wallet;
};

module.exports = {
  getWalletByWorker,
};
