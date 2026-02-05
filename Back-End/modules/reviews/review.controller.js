const reviewService = require("./review.service");

/* =========================
   CREATE REVIEW (CLIENT)
========================= */
exports.createReview = async (req, res) => {
  try {
    const { jobId, rating, comment } = req.body;

    if (!jobId || !rating) {
      return res.status(400).json({
        success: false,
        message: "jobId and rating are required",
      });
    }

    const review = await reviewService.createReview({
      jobId,
      clientId: req.user.id,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================
   GET WORKER REVIEWS
========================= */
exports.getWorkerReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getWorkerReviews(
      req.params.workerId
    );

    res.json({
      success: true,
      data: reviews,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================
   ADMIN – UPDATE REVIEW
========================= */
exports.adminUpdateReview = async (req, res) => {
  try {
    const review = await reviewService.adminUpdateReview(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: review,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/* =========================
   ADMIN – DELETE REVIEW
========================= */
exports.adminDeleteReview = async (req, res) => {
  try {
    const result = await reviewService.adminDeleteReview(
      req.params.id
    );

    res.json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
