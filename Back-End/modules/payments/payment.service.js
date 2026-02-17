const Payment = require("./payment.model");
const Job = require("../jobs/job.model");
const gateway = require("../../utils/paymentGateways");
const { addToWallet } = require("./wallet.service");
const { createNotification } =
  require("../notifications/notification.service");

/* ================= PAY DEPOSIT ================= */
const payDeposit = async (jobId, clientId) => {
  const job = await Job.findById(jobId);

  if (!job || job.paymentStatus !== "UNPAID") {
    throw new Error("Deposit not allowed");
  }

  const result = await gateway.charge({
    amount: job.depositAmount,
  });

  if (!result.success) throw new Error("Payment failed");

  const payment = await Payment.create({
    jobId,
    clientId,
    amount: job.depositAmount,
    type: "DEPOSIT",
    heldBy: "PLATFORM",
provider: (process.env.PAYMENT_PROVIDER || "MOCK").toUpperCase(),
    transactionId: result.transactionId,
    status: "PAID",
  });

  job.paymentStatus = "DEPOSIT_PAID";
  await job.save();

  await createNotification({
    userId: clientId,
    type: "PAYMENT_COMPLETED",
    title: "Deposit Paid",
    message: "Deposit payment successful",
    referenceId: payment._id,
  });

  return payment;
};

/* ================= PAY FINAL ================= */
const payFinal = async (jobId, clientId) => {
  const job = await Job.findById(jobId);

  if (!job || job.paymentStatus !== "DEPOSIT_PAID") {
    throw new Error("Final payment not allowed");
  }

  // ✅ حساب الأرباح صح (مش Virtual)
  const providerEarnings =
    job.total_price -
    (job.total_price * job.site_commission) / 100;

  const result = await gateway.charge({
    amount: providerEarnings,
  });

  if (!result.success) throw new Error("Payment failed");

  const payment = await Payment.create({
    jobId,
    clientId,
    workerId: job.workerId,
    amount: providerEarnings,
    type: "FINAL",
    heldBy: "WORKER",
    provider: (process.env.PAYMENT_PROVIDER || "MOCK").toUpperCase(),
    transactionId: result.transactionId,
    status: "PAID",
  });
job.paymentStatus = "PAID";
await job.save();

  // ✅ إضافة المبلغ لمحفظة العامل
  await addToWallet({
    workerId: job.workerId,
    amount: providerEarnings,
    referenceId: jobId,
    type: "EARNING",
  });

  await createNotification({
    userId: job.workerId,
    type: "PAYMENT_COMPLETED",
    title: "Payment Received",
    message: "Funds added to your wallet",
    referenceId: payment._id,
  });

  return payment;
};

module.exports = { payDeposit, payFinal };
