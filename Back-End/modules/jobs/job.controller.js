const jobService = require("./job.service");

/* ========= CLIENT ========= */

exports.createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      serviceId,
      workerId,
      bookingType = "DIRECT",
      total_price
    } = req.body;

    // Validate required fields
    if (!title || !description || !serviceId) {
      throw new Error("Missing required fields: title, description, serviceId");
    }

    // Validate booking type
    if (!["DIRECT", "OPEN"].includes(bookingType)) {
      throw new Error("bookingType must be either DIRECT or OPEN");
    }

    // DIRECT booking requires workerId
    if (bookingType === "DIRECT" && !workerId) {
      throw new Error("workerId is required for DIRECT bookings");
    }

    // OPEN booking must not have workerId
    if (bookingType === "OPEN" && workerId) {
      throw new Error("workerId must not be provided for OPEN bookings");
    }

    const job = await jobService.createJob({
      title,
      description,
      serviceId,
      clientId: req.user.id,
      workerId: bookingType === "DIRECT" ? workerId : null,
      bookingType,
      total_price
    });

    res.status(201).json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.cancelJob = async (req, res) => {
  try {
    const job = await jobService.cancelJob(req.params.id, {
      canceledBy: "CLIENT",
      reason: req.body.reason,
    });
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ========= TECHNICIAN ========= */

exports.acceptJob = async (req, res) => {
  try {
    const job = await jobService.acceptJob(
      req.params.id,
      req.user.id
    );
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.startJob = async (req, res) => {
  try {
    const job = await jobService.startJob(req.params.id);
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.completeJob = async (req, res) => {
  try {
    const job = await jobService.completeJob(req.params.id);
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ========= SHARED ========= */

exports.getJobById = async (req, res) => {
  try {
    const job = await jobService.getJob(req.params.id);
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await jobService.getAllJobs(req.user);

    res.json({ success: true, data: jobs });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


exports.rejectJob = async (req, res) => {
  try {
    const job = await jobService.rejectJob(req.params.id, req.user.id);
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ========= ADMIN ========= */

exports.updateStatus = async (req, res) => {
  try {
    const job = await jobService.updateStatus(
      req.params.id,
      req.body.status
    );
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getCommissionRate = async (req, res) => {
  res.json({
    success: true,
    data: jobService.getCommissionRate(),
  });
};

exports.updateCommissionRate = async (req, res) => {
  try {
    const result = jobService.updateCommissionRate(req.body.rate);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getCommissionStats = async (req, res) => {
  try {
    const stats = await jobService.getCommissionStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
