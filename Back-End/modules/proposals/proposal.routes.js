const router = require("express").Router();
const controller = require("./proposal.controller");
const { protect } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");

/* ========= OPEN JOBS BROWSING ========= */
router.get(
  "/open-jobs",
  protect,
  authorize("technician"),
  controller.getOpenJobs
);

/* ========= TECHNICIAN: SEND & MANAGE PROPOSALS ========= */
router.post(
  "/",
  protect,
  authorize("technician"),
  controller.sendProposal
);

router.get(
  "/my",
  protect,
  authorize("technician"),
  controller.getTechnicianProposals
);

router.patch(
  "/:id/withdraw",
  protect,
  authorize("technician"),
  controller.withdrawProposal
);

/* ========= CLIENT: VIEW & RESPOND TO PROPOSALS ========= */
router.get(
  "/job/:jobId",
  protect,
  authorize("client"),
  controller.getJobProposals
);

router.patch(
  "/:id/accept",
  protect,
  authorize("client"),
  controller.acceptProposal
);

router.patch(
  "/:id/reject",
  protect,
  authorize("client"),
  controller.rejectProposal
);

/* ========= SHARED ========= */
router.get(
  "/:id",
  protect,
  controller.getProposal
);

module.exports = router;
