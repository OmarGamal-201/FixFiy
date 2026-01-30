const service = require("./admin.service");

module.exports = {
  dashboard: async (req, res) =>
    res.json({ success: true, data: await service.getDashboardStats() }),

  analytics: async (req, res) =>
    res.json({
      success: true,
      data: await service.getAnalytics(req.query.range),
    }),

  suspendUser: async (req, res) =>
    res.json({
      success: true,
      data: await service.suspendUser(req.user.id, req.params.id),
    }),

  restoreUser: async (req, res) =>
    res.json({
      success: true,
      data: await service.restoreUser(req.user.id, req.params.id),
    }),

  verifyTechnician: async (req, res) =>
    res.json({
      success: true,
      data: await service.verifyTechnician(req.user.id, req.params.id),
    }),

  cancelJob: async (req, res) =>
    res.json({
      success: true,
      data: await service.cancelJobByAdmin(req.user.id, req.params.id),
    }),

  getSettings: async (req, res) =>
    res.json({ success: true, data: await service.getSystemSettings() }),

  updateSettings: async (req, res) =>
    res.json({
      success: true,
      data: await service.updateSystemSettings(req.user.id, req.body),
    }),

  auditLogs: async (req, res) =>
    res.json({
      success: true,
      data: await service.getAuditLogs(),
    }),

    getAllUsers: async (req, res) => {
  try {
    const result = await service.getAllUsers(req.query);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
},

};
