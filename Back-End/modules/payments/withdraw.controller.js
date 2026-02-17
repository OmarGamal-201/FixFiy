const service = require("./withdraw.service");

/* ===== Worker ===== */
exports.requestWithdraw = async (req, res) => {
  try {
    const data = await service.requestWithdraw(
      req.user.id,
      req.body.amount
    );
    res.status(201).json({ success: true, data });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

/* ===== Admin ===== */
exports.getRequests = async (req, res) => {
  const data = await service.listWithdrawRequests(req.query.status);
  res.json({ success: true, data });
};

exports.approve = async (req, res) => {
  const data = await service.approveWithdraw(
    req.params.id,
    req.user.id
  );
  res.json({ success: true, data });
};

exports.reject = async (req, res) => {
  const data = await service.rejectWithdraw(
    req.params.id,
    req.user.id,
    req.body.note
  );
  res.json({ success: true, data });
};
