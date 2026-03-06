const Job = require("./job.model");
const { User } = require("../users/user.model");
const serviceService = require("../services/service.service");
const { createNotification } =
  require("../notifications/notification.service");
const { emitNotification } =
  require("../../utils/emitNotification");

let GLOBAL_COMMISSION_RATE = 10;
const DEPOSIT_PERCENT = 20;

class JobService {
  /* ================= CREATE JOB ================= */
  async createJob({
    title,
    description,
    serviceId,
    clientId,
  }) {
    // ✅ validate service & get base price
    const service =
      await serviceService.validateServiceForJob(serviceId);

    const total_price = service.base_price;

    const depositAmount = +(
      (total_price * DEPOSIT_PERCENT) / 100
    ).toFixed(2);

    return Job.create({
      title,
      description,
      serviceId,
      clientId,
      total_price,
      depositAmount,
      site_commission: GLOBAL_COMMISSION_RATE,
      status: "PENDING",
      paymentStatus: "UNPAID",
      statusHistory: [{ status: "PENDING" }],
    });
  }

  /* ================= ACCEPT JOB ================= */
  async acceptJob(jobId, workerId) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error("Job not found");

    if (job.workerId)
      throw new Error("Job already accepted");

    if (job.paymentStatus !== "DEPOSIT_PAID")
      throw new Error("Deposit not paid");

    job.workerId = workerId;
    job.status = "ACCEPTED";
    job.statusHistory.push({ status: "ACCEPTED" });
    await job.save();

    // ✅ increment service booking count
    await serviceService.incrementBookingCount(job.serviceId);

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

  /* ================= START JOB ================= */
  async startJob(jobId) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error("Job not found");

    if (job.status !== "ACCEPTED")
      throw new Error("Job must be accepted first");

    job.status = "ACTIVE";
    job.statusHistory.push({ status: "ACTIVE" });
    await job.save();

    return job;
  }

  /* ================= COMPLETE JOB ================= */
  async completeJob(jobId) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error("Job not found");

    if (job.status !== "ACTIVE")
      throw new Error("Job must be active");

    job.status = "DONE";
    job.paymentStatus === "DEPOSIT_PAID"

job.statusHistory.push({ status: "DONE" });
await job.save();


    // ✅ update technician earnings
    const earnings =
      job.total_price -
      (job.total_price * job.site_commission) / 100;

    await User.findByIdAndUpdate(job.workerId, {
      $inc: { totalEarnings: earnings },
    });

    return job;
  }

  /* ================= CANCEL JOB ================= */
  async cancelJob(jobId, { canceledBy, reason }) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error("Job not found");

    job.status = "CANCELED";
    job.canceledBy = canceledBy;
    job.cancelReason = reason;
    job.statusHistory.push({ status: "CANCELED" });
    await job.save();

    return job;
  }

  /* ================= GET JOB ================= */
  async getJob(jobId) {
    const job = await Job.findById(jobId)
      .populate("clientId", "name email")
      .populate("workerId", "name email")
      .populate("serviceId", "name base_price category")
      .populate("reviewId");

    if (!job) throw new Error("Job not found");
    return job;
  }

  async getAllJobs() {
    return Job.find()
      .populate("serviceId", "name category")
      .sort({ createdAt: -1 });
  }

  /* ================= ADMIN ================= */
  async updateStatus(jobId, status) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error("Job not found");

    job.status = status;
    job.statusHistory.push({ status });
    await job.save();

    return job;
  }

  getCommissionRate() {
    return { rate: GLOBAL_COMMISSION_RATE };
  }

  updateCommissionRate(rate) {
    const oldRate = GLOBAL_COMMISSION_RATE;
    GLOBAL_COMMISSION_RATE = rate;
    return { oldRate, newRate: rate };
  }

  async getCommissionStats() {
    const jobs = await Job.find({ status: "DONE" });

    const totalRevenue = jobs.reduce(
      (sum, job) =>
        sum +
        (job.total_price * job.site_commission) / 100,
      0
    );

    return {
      completedJobs: jobs.length,
      totalRevenue,
    };
  }
}

module.exports = new JobService();
