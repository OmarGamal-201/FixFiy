const proposalService = require("./proposal.service");
const {
  validateSendProposal,
  validateAcceptProposal,
  validateRejectProposal,
} = require("./proposal.validation");

/* ========= TECHNICIAN ========= */

/**
 * POST /proposals
 * Technician sends a proposal for an open job
 */
exports.sendProposal = async (req, res) => {
  try {
   const {
  jobId,
  message,
  estimatedDuration,
} = req.body;
    // Validate input
  const validation = validateSendProposal({
  jobId,
  message,
  estimatedDuration,
});

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const proposal = await proposalService.sendProposal({
      jobId,
      technicianId: req.user.id,
      message,
    
      estimatedDuration,
    });

    res.status(201).json({ success: true, data: proposal });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * GET /proposals/my
 * Get technician's proposals
 */
exports.getTechnicianProposals = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const proposals = await proposalService.getTechnicianProposals(
      req.user.id,
      filter
    );

    res.json({ success: true, data: proposals });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /proposals/:id/withdraw
 * Technician withdraws their proposal
 */
exports.withdrawProposal = async (req, res) => {
  try {
    const proposal = await proposalService.withdrawProposal(
      req.params.id,
      req.user.id
    );

    res.json({ success: true, data: proposal });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ========= CLIENT ========= */

/**
 * GET /proposals/job/:jobId
 * Client views all proposals for their job
 */
exports.getJobProposals = async (req, res) => {
  try {
    const proposals = await proposalService.getJobProposals(req.params.jobId);

    // Verify client owns the job
    const Job = require("../jobs/job.model");
    const job = await Job.findById(req.params.jobId);

    if (!job || job.clientId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view proposals for this job",
      });
    }

    res.json({ success: true, data: proposals });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /proposals/:id/accept
 * Client accepts a proposal
 */
exports.acceptProposal = async (req, res) => {
  try {
    const validation = validateAcceptProposal({ proposalId: req.params.id });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const proposal = await proposalService.acceptProposal(
      req.params.id,
      req.user.id
    );

    res.json({ success: true, data: proposal });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * PATCH /proposals/:id/reject
 * Client rejects a proposal
 */
exports.rejectProposal = async (req, res) => {
  try {
    const { reason } = req.body;

    const validation = validateRejectProposal({ proposalId: req.params.id });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const proposal = await proposalService.rejectProposal(
      req.params.id,
      req.user.id,
      reason
    );

    res.json({ success: true, data: proposal });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * GET /proposals/:id
 * Get proposal details
 */
exports.getProposal = async (req, res) => {
  try {
    const proposal = await proposalService.getProposal(req.params.id);

    res.json({ success: true, data: proposal });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

/* ========= OPEN JOBS (Browse) ========= */

/**
 * GET /proposals/open-jobs
 * Technicians browse open jobs available for proposals
 */
exports.getOpenJobs = async (req, res) => {
  try {
    const { limit = 50, skip = 0, serviceId, location } = req.query;

    const openJobs = await proposalService.getOpenJobs({
      limit: parseInt(limit),
      skip: parseInt(skip),
      serviceId,
      location,
    });

    res.json({ success: true, data: openJobs });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
