const WithdrawRequest =
  require("./withdrawRequest.model");

const {
  withdrawFromWallet,
  getWalletByWorker,
} = require("./wallet.service");

const {
  createNotification,
} = require(
  "../notifications/notification.service"
);

const {
  emitNotification,
} = require(
  "../../utils/emitNotification"
);

/* ================= Worker Request ================= */

const requestWithdraw =
  async (
    workerId,
    amount
  ) => {

    if (amount <= 0) {
      throw new Error(
        "Invalid amount"
      );
    }

    // wallet
    const wallet =
      await getWalletByWorker(
        workerId
      );

    // pending requests
    const pending =
      await WithdrawRequest.aggregate(
        [
          {
            $match: {
              workerId:
                wallet.workerId,
              status:
                "PENDING",
            },
          },

          {
            $group: {
              _id: null,

              total: {
                $sum:
                  "$amount",
              },
            },
          },
        ]
      );

    const pendingAmount =
      pending[0]?.total || 0;

    const availableBalance =
      wallet.balance -
      pendingAmount;

    if (
      amount >
      availableBalance
    ) {
      throw new Error(
        "Insufficient available balance"
      );
    }

    return WithdrawRequest.create(
      {
        workerId,
        amount,
      }
    );
  };

/* ================= Admin Approve ================= */

const approveWithdraw =
  async (
    requestId,
    adminId
  ) => {

    const request =
      await WithdrawRequest.findById(
        requestId
      );

    if (
      !request ||
      request.status !==
        "PENDING"
    ) {
      throw new Error(
        "Invalid request"
      );
    }

    await withdrawFromWallet(
      {
        workerId:
          request.workerId,

        amount:
          request.amount,

        referenceId:
          request._id,
      }
    );

    request.status =
      "APPROVED";

    request.processedBy =
      adminId;

    request.processedAt =
      new Date();

    await request.save();

    await createNotification({
      userId:
        request.workerId,

      type:
        "PAYMENT_COMPLETED",

      title:
        "Withdraw Approved",

      message:
        "Your withdraw request was approved",

      referenceId:
        request._id,
    });

    emitNotification(
      request.workerId,
      {
        type:
          "WITHDRAW_APPROVED",

        title:
          "Withdraw Approved",

        message:
          "Funds are on the way",
      }
    );

    return request;
  };

/* ================= Admin Reject ================= */

const rejectWithdraw =
  async (
    requestId,
    adminId,
    note
  ) => {

    const request =
      await WithdrawRequest.findById(
        requestId
      );

    if (
      !request ||
      request.status !==
        "PENDING"
    ) {
      throw new Error(
        "Invalid request"
      );
    }

    request.status =
      "REJECTED";

    request.processedBy =
      adminId;

    request.processedAt =
      new Date();

    request.note = note;

    await request.save();

    await createNotification({
      userId:
        request.workerId,

      type:
        "ADMIN_ALERT",

      title:
        "Withdraw Rejected",

      message:
        note ||
        "Withdraw request rejected",

      referenceId:
        request._id,
    });

    emitNotification(
      request.workerId,
      {
        type:
          "WITHDRAW_REJECTED",

        title:
          "Withdraw Rejected",

        message:
          note ||
          "Contact support",
      }
    );

    return request;
  };
/* ================= Admin List ================= */

const listWithdrawRequests = async (status) => {

  const query = {};

  if (status) {
    query.status = status;
  }

  const requests =
    await WithdrawRequest.find(query)

      .populate(
        "workerId",
        "name email profilePicture"
      )

      .populate(
        "processedBy",
        "name"
      )

      .sort({
        createdAt: -1,
      });

  return requests;
};
module.exports = {
  requestWithdraw,
  approveWithdraw,
  rejectWithdraw,
  listWithdrawRequests,
};