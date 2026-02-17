const service = require("./payment.service");

exports.deposit = async (req, res) => {
  try {
    const payment = await service.payDeposit(
      req.body.jobId,
      req.user.id
    );

    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

exports.final = async (req, res) => {
  try {
    const payment = await service.payFinal(
      req.body.jobId,
      req.user.id
    );

    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
