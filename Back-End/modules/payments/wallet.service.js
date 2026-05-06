const Wallet = require("./wallet.model");

/**
 * Get or create wallet for worker
 */
const getWalletByWorker = async (workerId, options = {}) => {
  const { session } = options;
  
  let wallet = await Wallet.findOne({ workerId });

  if (!wallet) {
    wallet = await Wallet.create([{ workerId }], { session });
    wallet = Array.isArray(wallet) ? wallet[0] : wallet;
  }

  return wallet;
};

/**
 * Add to wallet with MongoDB session support
 * Supports: EARNING, REFUND, BONUS, etc.
 */
const addToWallet = async (
  {
    workerId,
    amount,
    referenceId,
    referenceType = "JOB",
    type = "EARNING",
  },
  options = {}
) => {
  if (!workerId || !amount) {
    throw new Error("workerId and amount are required");
  }

  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }

  const { session } = options;

  const wallet = await getWalletByWorker(workerId, { session });

  wallet.balance += amount;

  wallet.transactions.push({
    type,
    amount,
    referenceId,
    referenceType,
  });

  await wallet.save({ session });
  return wallet;
};

/**
 * Withdraw from wallet with MongoDB session support
 */
const withdrawFromWallet = async (
  {
    workerId,
    amount,
    referenceId,
  },
  options = {}
) => {
  if (!workerId || !amount) {
    throw new Error("workerId and amount are required");
  }

  if (amount <= 0) {
    throw new Error("Amount must be positive");
  }

  const { session } = options;

  const wallet = await getWalletByWorker(workerId, { session });

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

  await wallet.save({ session });
  return wallet;
};

/**
 * Get wallet balance
 */
const getWalletBalance = async (workerId) => {
  const wallet = await Wallet.findOne({ workerId });
  return wallet?.balance || 0;
};

/**
 * Get wallet transactions
 */
const getWalletTransactions = async (workerId, limit = 50) => {
  const wallet = await Wallet.findOne({ workerId }).select("transactions balance");
  
  if (!wallet) {
    return { transactions: [], balance: 0 };
  }

  return {
    transactions: wallet.transactions.slice(-limit),
    balance: wallet.balance,
  };
};

module.exports = {
  getWalletByWorker,
  addToWallet,
  withdrawFromWallet,
  getWalletBalance,
  getWalletTransactions,
};
