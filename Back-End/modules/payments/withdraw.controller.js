const service =
  require("./withdraw.service");

/* ================= Worker ================= */

exports.requestWithdraw =
  async (req, res) => {

    try {

      const amount =
        Number(
          req.body.amount
        );

      if (
        !amount ||
        amount <= 0
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid amount",
        });
      }

      const data =
        await service.requestWithdraw(
          req.user.id,
          amount
        );

      res.status(201).json({
        success: true,
        data,
      });

    } catch (e) {

      res.status(400).json({
        success: false,

        message:
          e.message,
      });
    }
  };

/* ================= Admin ================= */

exports.getRequests =
  async (req, res) => {

    try {

      const data =
        await service.listWithdrawRequests(
          req.query.status
        );

      res.json({
        success: true,
        data,
      });

    } catch (e) {

      res.status(400).json({
        success: false,

        message:
          e.message,
      });
    }
  };

exports.approve =
  async (req, res) => {

    try {

      const data =
        await service.approveWithdraw(
          req.params.id,
          req.user.id
        );

      res.json({
        success: true,
        data,
      });

    } catch (e) {

      res.status(400).json({
        success: false,

        message:
          e.message,
      });
    }
  };

exports.reject =
  async (req, res) => {

    try {

      const data =
        await service.rejectWithdraw(
          req.params.id,
          req.user.id,
          req.body.note
        );

      res.json({
        success: true,
        data,
      });

    } catch (e) {

      res.status(400).json({
        success: false,

        message:
          e.message,
      });
    }
  };