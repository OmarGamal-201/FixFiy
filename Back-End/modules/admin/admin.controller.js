const service = require("./admin.service");

exports.dashboard = async (req, res) =>
  res.json({ success: true, data: await service.getDashboardStats() });

exports.analytics = async (req, res) =>
  res.json({
    success: true,
    data: await service.getAnalytics(req.query.range),
  });

exports.getAllUsers = async (req, res) => {
  const result = await service.getAllUsers(req.query);
  res.json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  });
};

exports.suspendUser = async (req, res) =>
  res.json({
    success: true,
    data: await service.suspendUser(
      req.user.id,
      req.params.id
    ),
  });

exports.restoreUser = async (req, res) =>
  res.json({
    success: true,
    data: await service.restoreUser(
      req.user.id,
      req.params.id
    ),
  });

exports.verifyTechnician = async (req, res) =>
  res.json({
    success: true,
    data: await service.verifyTechnician(
      req.user.id,
      req.params.id
    ),
  });

exports.cancelJob = async (req, res) =>
  res.json({
    success: true,
    data: await service.cancelJobByAdmin(
      req.user.id,
      req.params.id
    ),
  });

exports.getSettings = async (req, res) =>
  res.json({
    success: true,
    data: await service.getSystemSettings(),
  });

exports.updateSettings = async (req, res) =>
  res.json({
    success: true,
    data: await service.updateSystemSettings(
      req.user.id,
      req.body
    ),
  });

exports.auditLogs = async (req, res) =>
  res.json({
    success: true,
    data: await service.getAuditLogs(),
  });
