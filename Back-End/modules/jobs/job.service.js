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
    workerId,
  }) {
    // ✅ validate service & get base price
    const service =
      await serviceService.validateServiceForJob(serviceId);

    const total_price = service.base_price;

    const depositAmount = +(
      (total_price * DEPOSIT_PERCENT) / 100
    ).toFixed(2);

    if (workerId) {
      const requestedWorker = await User.findOne({
        _id: workerId,
        role: "technician",
      });

      if (!requestedWorker) {
        throw new Error("Assigned worker not found or invalid");
      }
    }

    const job = await Job.create({
      title,
      description,
      serviceId,
      clientId,
      workerId: workerId || undefined,
      total_price,
      depositAmount,
      site_commission: GLOBAL_COMMISSION_RATE,
      status: "PENDING",
      paymentStatus: "UNPAID",
      statusHistory: [{ status: "PENDING" }],
    });

    const admins = await User.find({ role: "admin" }).select("_id");
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin._id,
          type: "ADMIN_ALERT",
          title: "New booking request",
          message: `${job.title} was created by a client`,
          referenceId: job._id,
        })
      )
    );

    admins.forEach((admin) => {
      emitNotification(admin._id, {
        type: "ADMIN_ALERT",
        title: "New booking request",
        message: `${job.title} was created by a client`,
      });
    });

    if (workerId) {
      await createNotification({
        userId: workerId,
        type: "JOB_CREATED",
        title: "New booking assigned",
        message: "A client booked you for a job",
        referenceId: job._id,
      });

      emitNotification(workerId, {
        type: "JOB_CREATED",
        title: "New booking assigned",
        message: "A client booked you for a job",
      });
    }

    return job;
  }

  /* ================= ACCEPT JOB ================= */
  async acceptJob(jobId, workerId) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error("Job not found");

    if (job.workerId && job.workerId.toString() !== workerId)
      throw new Error("Job already assigned to another technician");

    if (job.status !== "PENDING")
      throw new Error("Job must be pending to accept");

    if (job.paymentStatus !== "DEPOSIT_PAID")
      throw new Error("Deposit not paid");

    if (!job.workerId) {
      job.workerId = workerId;
    }

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

  /* ================= REJECT JOB ================= */
  async rejectJob(jobId, workerId) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error("Job not found");

    if (!job.workerId || job.workerId.toString() !== workerId)
      throw new Error("You can only reject jobs assigned to you");

    if (job.status !== "PENDING")
      throw new Error("Only pending jobs can be rejected");

    job.status = "CANCELED";
    job.canceledBy = "TECHNICIAN";
    job.cancelReason = "Rejected by technician";
    job.statusHistory.push({ status: "CANCELED" });
    await job.save();

    await createNotification({
      userId: job.clientId,
      type: "JOB_REJECTED",
      title: "Job Rejected",
      message: "The technician rejected your booking request",
      referenceId: job._id,
    });

    emitNotification(job.clientId, {
      type: "JOB_REJECTED",
      title: "Job Rejected",
      message: "Your booking request was rejected",
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

  async getAllJobs(user) {
    const filter =
      user.role === "technician"
        ? { workerId: user.id }
        : { clientId: user.id };

    return Job.find(filter)
      .populate("serviceId", "name base_price")
      .populate("workerId", "name")
      .populate("clientId", "name")
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
