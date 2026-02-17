const walletService = require("./wallet.service");

/**
 * @desc    Get logged-in worker wallet
 * @route   GET /api/wallet
 * @access  Technician
 */
const getMyWallet = async (req, res) => {
  try {
    const wallet = await walletService.getWalletByWorker(req.user.id);

    res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getMyWallet,
};
