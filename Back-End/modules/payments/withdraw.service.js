const WithdrawRequest = require("./withdrawRequest.model");
const Wallet = require("./wallet.model");
const { createNotification } =
  require("../notifications/notification.service");
const { emitNotification } =
  require("../../utils/emitNotification");

/* ================= Worker Request ================= */
const requestWithdraw = async (workerId, amount) => {
  const wallet = await Wallet.findOne({ workerId });
  if (!wallet) throw new Error("Wallet not found");

  if (wallet.balance < amount)
    throw new Error("Insufficient balance");

  const request = await WithdrawRequest.create({
    workerId,
    amount,
  });

  return request;
};

/* ================= Admin Approve ================= */
const approveWithdraw = async (requestId, adminId) => {
  const request = await WithdrawRequest.findById(requestId);
  if (!request || request.status !== "PENDING")
    throw new Error("Invalid request");

  const wallet = await Wallet.findOne({ workerId: request.workerId });
  if (!wallet || wallet.balance < request.amount)
    throw new Error("Insufficient wallet balance");

  wallet.balance -= request.amount;
  wallet.transactions.push({
    type: "WITHDRAW",
    amount: request.amount,
    referenceId: request._id,
  });

  await wallet.save();

  request.status = "APPROVED";
  request.processedBy = adminId;
  request.processedAt = new Date();
  await request.save();

  // 🔔 Notify worker
  await createNotification({
    userId: request.workerId,
    type: "PAYMENT_COMPLETED",
    title: "Withdraw Approved",
    message: "Your withdraw request was approved",
    referenceId: request._id,
  });

  emitNotification(request.workerId, {
    type: "WITHDRAW_APPROVED",
    title: "Withdraw Approved",
    message: "Funds are on the way",
  });

  return request;
};

/* ================= Admin Reject ================= */
const rejectWithdraw = async (requestId, adminId, note) => {
  const request = await WithdrawRequest.findById(requestId);
  if (!request || request.status !== "PENDING")
    throw new Error("Invalid request");

  request.status = "REJECTED";
  request.processedBy = adminId;
  request.processedAt = new Date();
  request.note = note;
  await request.save();

  await createNotification({
    userId: request.workerId,
    type: "ADMIN_ALERT",
    title: "Withdraw Rejected",
    message: note || "Withdraw request rejected",
    referenceId: request._id,
  });

  emitNotification(request.workerId, {
    type: "WITHDRAW_REJECTED",
    title: "Withdraw Rejected",
    message: note || "Contact support",
  });

  return request;
};

/* ================= Admin List ================= */
const listWithdrawRequests = async (status) => {
  const filter = status ? { status } : {};
  return WithdrawRequest.find(filter)
    .populate("workerId", "name email")
    .sort({ createdAt: -1 });
};

module.exports = {
  requestWithdraw,
  approveWithdraw,
  rejectWithdraw,
  listWithdrawRequests,
};
