const walletService =
  require("./wallet.service");

/**
 * Get wallet
 */
const getMyWallet =
  async (req, res) => {

    try {

      const wallet =
        await walletService.getWalletByWorker(
          req.user.id
        );

      res.status(200).json({
        success: true,
        data: wallet,
      });

    } catch (err) {

      res.status(400).json({
        success: false,
        message:
          err.message,
      });
    }
  };

/**
 * Get transactions
 */
const getTransactions =
  async (req, res) => {

    try {

      const data =
        await walletService.getWalletTransactions(
          req.user.id
        );

      res.status(200).json({
        success: true,
        data,
      });

    } catch (err) {

      res.status(400).json({
        success: false,
        message:
          err.message,
      });
    }
  };

module.exports = {
  getMyWallet,
  getTransactions,
};