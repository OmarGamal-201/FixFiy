const reviewService = require("./review.service");

/* CLIENT */
exports.createReview = async (req, res) => {
  try {
    const review = await reviewService.createReview({
      jobId: req.body.jobId,
      clientId: req.user.id,
      rating: req.body.rating,
      comment: req.body.comment,
    });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* PUBLIC */
exports.getWorkerReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getWorkerReviews(
      req.params.workerId
    );
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ADMIN */
exports.adminUpdateReview = async (req, res) => {
  try {
    const review = await reviewService.adminUpdateReview(
      req.params.id,
      req.body
    );
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.adminDeleteReview = async (req, res) => {
  try {
    const result = await reviewService.adminDeleteReview(
      req.params.id
    );
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
