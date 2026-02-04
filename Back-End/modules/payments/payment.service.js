const Payment = require("./payment.model");
const Job = require("../jobs/job.model");
const gateway = require("../../utils/paymentGateways");
const { addToWallet } = require("./wallet.service");
const { createNotification } =
  require("../notifications/notification.service");

const payDeposit = async (jobId, clientId) => {
  const job = await Job.findById(jobId);

  if (!job || job.paymentStatus !== "UNPAID")
    throw new Error("Deposit not allowed");

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
    provider: process.env.PAYMENT_PROVIDER || "MOCK",
    transactionId: result.transactionId,
  });

  job.paymentStatus = "DEPOSIT_PAID";
  await job.save();

  await createNotification({
    userId: clientId,
    type: "PAYMENT_COMPLETED",
    title: "Deposit Paid",
    message: "Deposit payment successful",
  });

  return payment;
};

const payFinal = async (jobId, clientId) => {
  const job = await Job.findById(jobId);
  if (!job || job.paymentStatus !== "DEPOSIT_PAID")
  throw new Error("Final payment not allowed");


  const result = await gateway.charge({
    amount: job.provider_earnings,

  });

  if (!result.success) throw new Error("Payment failed");

  const payment = await Payment.create({
    jobId,
    clientId,
    workerId: job.workerId,
    amount: job.final_amount,
    type: "FINAL",
    heldBy: "WORKER",
    provider: process.env.PAYMENT_PROVIDER || "MOCK",
    transactionId: result.transactionId,
  });

  await addToWallet({
    workerId: job.workerId,
    amount: job.provider_earnings,
    referenceId: jobId,
    type: "EARN",
  });

  job.status = "DONE";
job.paymentStatus = "PAID";
await job.save();
  await job.save();

  await createNotification({
    userId: job.workerId,
    type: "PAYMENT_COMPLETED",
    title: "Payment Received",
    message: "Funds added to your wallet",
  });

  return payment;
};

module.exports = { payDeposit, payFinal };
