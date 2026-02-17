const { User } = require("../users/user.model");
const Job = require("../jobs/job.model");
const Payment = require("../payments/payment.model");
const AuditLog = require("./auditLog.model");
const SystemSettings = require("./systemSettings.model");
const jobService = require("../jobs/job.service");
const { createNotification } =
  require("../notifications/notification.service");
const { emitNotification } =
  require("../../utils/emitNotification");

/* ================= DASHBOARD ================= */
const getDashboardStats = async () => {
  const users = {
    total: await User.countDocuments(),
    clients: await User.countDocuments({ role: "client" }),
    technicians: await User.countDocuments({ role: "technician" }),
    unverifiedTechnicians: await User.countDocuments({
      role: "technician",
      isVerified: false,
    }),
  };

  const jobs = {
    total: await Job.countDocuments(),
    byStatus: await Job.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  };

  // ✅ revenue من Jobs المكتملة
  const completedJobs = await Job.find({ status: "DONE" });
  const revenue = completedJobs.reduce(
    (sum, job) =>
      sum +
      (job.total_price * job.site_commission) / 100,
    0
  );

  return { users, jobs, revenue };
};

/* ================= ANALYTICS ================= */
const getAnalytics = async (range = "daily") => {
  const format = range === "monthly" ? "%Y-%m" : "%Y-%m-%d";

  const users = await User.aggregate([
    {
      $group: {
        _id: {
          date: { $dateToString: { format, date: "$createdAt" } },
          role: "$role",
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.date": 1 } },
  ]);

  const jobs = await Job.aggregate([
    {
      $group: {
        _id: {
          date: { $dateToString: { format, date: "$createdAt" } },
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.date": 1 } },
  ]);

  return { users, jobs };
};

/* ================= USERS ================= */
const suspendUser = async (adminId, userId) => {
  if (adminId.toString() === userId.toString())
    throw new Error("Admin cannot suspend himself");

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.status = "SUSPENDED";
  await user.save();

  await createNotification({
    userId,
    type: "ACCOUNT_SUSPENDED",
    title: "Account Suspended",
    message: "Your account was suspended by admin",
  });

  emitNotification(userId, {
    type: "ACCOUNT_SUSPENDED",
    title: "Account Suspended",
  });

  await AuditLog.create({
    adminId,
    action: "USER_SUSPENDED",
    targetType: "USER",
    targetId: userId,
  });

  return user;
};

const restoreUser = async (adminId, userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.status = "ACTIVE";
  await user.save();

  await AuditLog.create({
    adminId,
    action: "USER_RESTORED",
    targetType: "USER",
    targetId: userId,
  });

  return user;
};

const verifyTechnician = async (adminId, techId) => {
  const tech = await User.findById(techId);
  if (!tech || tech.role !== "technician")
    throw new Error("Technician not found");

  tech.isVerified = true;
  await tech.save();

  await AuditLog.create({
    adminId,
    action: "TECHNICIAN_VERIFIED",
    targetType: "USER",
    targetId: techId,
  });

  return tech;
};

/* ================= JOBS ================= */
const cancelJobByAdmin = async (adminId, jobId) => {
  // ✅ استخدم JobService (مش direct update)
  const job = await jobService.cancelJob(jobId, {
    canceledBy: "ADMIN",
    reason: "Cancelled by admin",
  });

  await AuditLog.create({
    adminId,
    action: "JOB_CANCELED",
    targetType: "JOB",
    targetId: jobId,
  });

  return job;
};

/* ================= SETTINGS ================= */
const getSystemSettings = async () =>
  await SystemSettings.getSettings();

const updateSystemSettings = async (adminId, updates) => {
  const settings = await SystemSettings.getSettings();
  Object.assign(settings, updates);
  settings.updatedBy = adminId;
  await settings.save();

  // ✅ تحديث العمولة في JobService
  if (updates.platformCommissionPercent !== undefined) {
    jobService.updateCommissionRate(
      updates.platformCommissionPercent
    );
  }

  await AuditLog.create({
    adminId,
    action: "SETTINGS_UPDATED",
    targetType: "SETTINGS",
    targetId: settings._id,
  });

  return settings;
};

/* ================= AUDIT LOGS ================= */
const getAuditLogs = async () =>
  AuditLog.find()
    .populate("adminId", "name email")
    .sort({ createdAt: -1 });

/* ================= USERS LIST ================= */
const getAllUsers = async (query = {}) => {
  const { role, status, page = 1, limit = 20 } = query;
  const filter = {};
  if (role) filter.role = role;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;

  const users = await User.find(filter)
    .select("-password -resetPasswordToken -resetPasswordExpire")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await User.countDocuments(filter);

  return {
    data: users,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    },
  };
};

module.exports = {
  getDashboardStats,
  getAnalytics,
  suspendUser,
  restoreUser,
  verifyTechnician,
  cancelJobByAdmin,
  getSystemSettings,
  updateSystemSettings,
  getAuditLogs,
  getAllUsers,
};
