const Proposal = require("./proposal.model");

const Job = require("../jobs/job.model");

const { User } =
  require("../users/user.model");

const {
  createNotification,
} = require("../notifications/notification.service");

const {
  emitNotification,
} = require("../../utils/emitNotification");

class ProposalService {

  /* ================= SEND PROPOSAL ================= */

  async sendProposal({
    jobId,
    technicianId,
    message,
    estimatedDuration,
  }) {

    // ================= GET JOB =================

    const job =
      await Job.findById(jobId)
        .populate("serviceId");

    if (!job)
      throw new Error(
        "Job not found"
      );

    if (
      job.bookingType !==
      "OPEN"
    ) {

      throw new Error(
        "Proposals can only be sent for OPEN jobs"
      );
    }

    if (
      job.status !==
      "PENDING"
    ) {

      throw new Error(
        "Can only send proposals for pending jobs"
      );
    }

    // ================= TECHNICIAN =================

    const technician =
      await User.findOne({

        _id: technicianId,

        role: "technician",
      });

    if (!technician)
      throw new Error(
        "Technician not found"
      );

    // ================= DUPLICATE CHECK =================

    const existingProposal =
      await Proposal.findOne({

        jobId,

        technicianId,

        status: {
          $ne: "WITHDRAWN",
        },
      });

    if (existingProposal) {

      throw new Error(
        "You already submitted a proposal for this job"
      );
    }

    // ================= FIXED SERVICE PRICE =================

    const fixedPrice =
      job.serviceId
        ?.base_price || 0;

    // ================= CREATE PROPOSAL =================

    const proposal =
      await Proposal.create({

        jobId,

        technicianId,

        message,

        // السعر ثابت من الخدمة
        proposedPrice:
          fixedPrice,

        estimatedDuration,

        status: "PENDING",

        statusHistory: [
          {
            status: "PENDING",
          },
        ],
      });

    // ================= NOTIFICATION =================

    await createNotification({

      userId: job.clientId,

      type: "NEW_PROPOSAL",

      title:
        "New Proposal",

      message:
        `${technician.name} sent a proposal`,

      referenceId:
        proposal._id,
    });

    emitNotification(
      job.clientId,
      {
        type: "NEW_PROPOSAL",

        title:
          "New Proposal",

        message:
          `${technician.name} sent a proposal`,
      }
    );

    return proposal.populate(
      "technicianId",
      "name email technician_rate"
    );
  }

  /* ================= GET OPEN JOBS ================= */

  async getOpenJobs({
    limit = 50,
    skip = 0,
    serviceId,
    location,
  }) {

    const filter = {

      bookingType: "OPEN",

      status: "PENDING",
    };

    // ================= FILTER SERVICE =================

    if (serviceId) {

      filter.serviceId =
        serviceId;
    }

    // ================= GET JOBS =================

    const openJobs =
      await Job.find(filter)

        .populate(
          "clientId",
          "name"
        )

        .populate(
          "serviceId",
          "name category base_price"
        )

        .sort({
          createdAt: -1,
        })

        .skip(skip)

        .limit(limit);

    return openJobs;
  }

  /* ================= GET JOB PROPOSALS ================= */

  async getJobProposals(
    jobId
  ) {

    const job =
      await Job.findById(
        jobId
      );

    if (!job)
      throw new Error(
        "Job not found"
      );

    return Proposal.find({

      jobId,

      status: {
        $ne: "WITHDRAWN",
      },
    })

      .populate(
        "technicianId",
        "name email technician_rate totalJobs totalEarnings"
      )

      .sort({
        createdAt: -1,
      });
  }

  /* ================= GET TECHNICIAN PROPOSALS ================= */

  async getTechnicianProposals(
    technicianId,
    filter = {}
  ) {

    return Proposal.find({

      technicianId,

      ...filter,
    })

      .populate(
        "jobId",
        "title description total_price status bookingType"
      )

      .populate({
        path: "jobId",

        populate: {

          path: "serviceId",

          select:
            "name base_price category",
        },
      })

      .populate({
        path: "jobId",

        populate: {

          path: "clientId",

          select:
            "name email",
        },
      })

      .sort({
        createdAt: -1,
      });
  }

  /* ================= ACCEPT PROPOSAL ================= */

  async acceptProposal(
    proposalId,
    clientId
  ) {

    const proposal =
      await Proposal.findById(
        proposalId
      );

    if (!proposal)
      throw new Error(
        "Proposal not found"
      );

    const job =
      await Job.findById(
        proposal.jobId
      );

    if (!job)
      throw new Error(
        "Job not found"
      );

    if (
      job.clientId.toString() !==
      clientId.toString()
    ) {

      throw new Error(
        "Not authorized"
      );
    }

    // ================= ACCEPT PROPOSAL =================

    proposal.status =
      "ACCEPTED";

    proposal.acceptedAt =
      new Date();

    proposal.acceptedByClientAt =
      new Date();

    proposal.statusHistory.push({

      status: "ACCEPTED",

      changedAt:
        new Date(),
    });

    await proposal.save();

    // ================= UPDATE JOB =================

    job.workerId =
      proposal.technicianId;

    job.acceptedProposalId =
      proposalId;

    // السعر ثابت
    job.total_price =
      proposal.proposedPrice;

    const DEPOSIT_PERCENT = 20;

    job.depositAmount = +(
      (job.total_price *
        DEPOSIT_PERCENT) /
      100
    ).toFixed(2);

    job.paymentStatus =
      "UNPAID";

    await job.save();

    // ================= REJECT OTHER PROPOSALS =================

    await Proposal.updateMany(

      {
        jobId: job._id,

        _id: {
          $ne: proposalId,
        },

        status: "PENDING",
      },

      {
        status: "REJECTED",
      }
    );

    // ================= NOTIFY TECHNICIAN =================

    await createNotification({

      userId:
        proposal.technicianId,

      type:
        "PROPOSAL_ACCEPTED",

      title:
        "Proposal Accepted",

      message:
        "Your proposal has been accepted",

      referenceId:
        proposal._id,
    });

    emitNotification(
      proposal.technicianId,
      {
        type:
          "PROPOSAL_ACCEPTED",

        title:
          "Proposal Accepted",

        message:
          "Client accepted your proposal",
      }
    );

    return proposal.populate(
      "technicianId",
      "name email"
    );
  }

  /* ================= REJECT PROPOSAL ================= */

  async rejectProposal(
    proposalId,
    clientId,
    reason
  ) {

    const proposal =
      await Proposal.findById(
        proposalId
      );

    if (!proposal)
      throw new Error(
        "Proposal not found"
      );

    const job =
      await Job.findById(
        proposal.jobId
      );

    if (!job)
      throw new Error(
        "Job not found"
      );

    if (
      job.clientId.toString() !==
      clientId.toString()
    ) {

      throw new Error(
        "Not authorized"
      );
    }

    proposal.status =
      "REJECTED";

    proposal.rejectionReason =
      reason || "";

    proposal.statusHistory.push({

      status: "REJECTED",

      changedAt:
        new Date(),

      reason,
    });

    await proposal.save();

    return proposal;
  }

  /* ================= WITHDRAW ================= */

  async withdrawProposal(
    proposalId,
    technicianId
  ) {

    const proposal =
      await Proposal.findById(
        proposalId
      );

    if (!proposal)
      throw new Error(
        "Proposal not found"
      );

    if (
      proposal.technicianId.toString() !==
      technicianId.toString()
    ) {

      throw new Error(
        "Not authorized"
      );
    }

    if (
      proposal.status !==
      "PENDING"
    ) {

      throw new Error(
        "Only pending proposals can be withdrawn"
      );
    }

    proposal.status =
      "WITHDRAWN";

    proposal.statusHistory.push({

      status:
        "WITHDRAWN",

      changedAt:
        new Date(),
    });

    await proposal.save();

    return proposal;
  }

  /* ================= GET SINGLE PROPOSAL ================= */

  async getProposal(
    proposalId
  ) {

    const proposal =
      await Proposal.findById(
        proposalId
      )

        .populate(
          "technicianId",
          "name email technician_rate"
        )

        .populate(
          "jobId"
        );

    if (!proposal)
      throw new Error(
        "Proposal not found"
      );

    return proposal;
  }
}

module.exports =
  new ProposalService();