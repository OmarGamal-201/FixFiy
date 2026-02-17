const Wallet = require("./wallet.model");

/* ================= GET / CREATE WALLET ================= */
const getWalletByWorker = async (workerId) => {
  let wallet = await Wallet.findOne({ workerId });

  if (!wallet) {
    wallet = await Wallet.create({ workerId });
  }

  return wallet;
};

/* ================= ADD TO WALLET (EARNING / REFUND) ================= */
const addToWallet = async ({
  workerId,
  amount,
  referenceId,
  referenceType = "JOB",
  type = "EARNING",
}) => {
  if (!workerId || !amount) {
    throw new Error("workerId and amount are required");
  }

  const wallet = await getWalletByWorker(workerId);

  wallet.balance += amount;

  wallet.transactions.push({
    type,
    amount,
    referenceId,
    referenceType,
  });

  await wallet.save();
  return wallet;
};

/* ================= WITHDRAW FROM WALLET ================= */
const withdrawFromWallet = async ({
  workerId,
  amount,
  referenceId,
}) => {
  if (!workerId || !amount) {
    throw new Error("workerId and amount are required");
  }

  const wallet = await getWalletByWorker(workerId);

  if (wallet.balance < amount) {
    throw new Error("Insufficient balance");
  }

  wallet.balance -= amount;

  wallet.transactions.push({
    type: "WITHDRAW",
    amount,
    referenceId,
    referenceType: "WITHDRAW",
  });

  await wallet.save();
  return wallet;
};

module.exports = {
  getWalletByWorker,
  addToWallet,
  withdrawFromWallet,
};
