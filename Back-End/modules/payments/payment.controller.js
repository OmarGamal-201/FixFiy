const service = require("./payment.service");

exports.deposit = async (req, res) => {
  const payment = await service.payDeposit(req.body.jobId, req.user.id);
  res.json({ success: true, data: payment });
};

exports.final = async (req, res) => {
  const payment = await service.payFinal(req.body.jobId, req.user.id);
  res.json({ success: true, data: payment });
};
