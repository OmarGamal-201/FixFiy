const Job = require("./job.model");
const { createNotification } =
  require("../notifications/notification.service");
const { emitNotification } =
  require("../../utils/emitNotification");

let GLOBAL_COMMISSION_RATE = 10;
const DEPOSIT_PERCENT = 20;

class JobService {

  async createJob({ title, description, total_price, clientId }) {
    const depositAmount = +(
      total_price * DEPOSIT_PERCENT / 100
    ).toFixed(2);

    return Job.create({
      title,
      description,
      total_price,
      clientId,
      depositAmount,
      site_commission: GLOBAL_COMMISSION_RATE,
      status: "PENDING",
      paymentStatus: "UNPAID",
    });
  }

  async acceptJob(jobId, workerId) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error("Job not found");
    if (job.paymentStatus !== "DEPOSIT_PAID")
      throw new Error("Deposit not paid");

    job.workerId = workerId;
    job.status = "ACCEPTED";
    await job.save();

    await createNotification({
      userId: job.clientId,
      type: "JOB_ACCEPTED",
      title: "Job Accepted",
      message: "A technician accepted your job",
      referenceId: job._id,
    });

    emitNotification(job.clientId, {
      type: "JOB_ACCEPTED",
      title: "Job Accepted",
      message: "Technician assigned",
    });

    return job;
  }

  async startJob(jobId) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error("Job not found");

    job.status = "ACTIVE";
    await job.save();
    return job;
  }

  async completeJob(jobId) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error("Job not found");

    job.status = "DONE";
    job.paymentStatus = "PAID";
    await job.save();
    return job;
  }

  async cancelJob(jobId, canceledBy) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error("Job not found");

    job.status = "CANCELED";
    await job.save();
    return job;
  }

  async getJob(jobId) {
    const job = await Job.findById(jobId)
      .populate("clientId workerId", "name email");
    if (!job) throw new Error("Job not found");
    return job;
  }

  async getAllJobs() {
    return Job.find().sort({ createdAt: -1 });
  }

  async updateStatus(jobId, status) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error("Job not found");

    const oldStatus = job.status;
    job.status = status;
    await job.save();

    return {
      message: "Status updated",
      job,
      statusChange: { from: oldStatus, to: status },
    };
  }

  getCommissionRate() {
    return { rate: GLOBAL_COMMISSION_RATE };
  }

  updateCommissionRate(rate) {
    const oldRate = GLOBAL_COMMISSION_RATE;
    GLOBAL_COMMISSION_RATE = rate;

    return {
      oldRate,
      newRate: rate,
    };
  }

  async getCommissionStats() {
    const jobs = await Job.find({ status: "DONE" });

    const totalRevenue = jobs.reduce(
      (sum, job) =>
        sum + (job.total_price * job.site_commission / 100),
      0
    );

    return {
      completedJobs: jobs.length,
      totalRevenue,
    };
  }
}

module.exports = new JobService();
