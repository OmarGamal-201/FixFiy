const mongoose = require("mongoose");
const Review = require("./review.model");
const Job = require("../jobs/job.model");
const User = require("../users/user.model");
const { createNotification } =
  require("../notifications/notification.service");
const { emitNotification } =
  require("../../utils/emitNotification");

class ReviewService {
  /* =========================
     CREATE REVIEW (CLIENT)
  ========================== */
  async createReview({ jobId, clientId, rating, comment }) {
    if (!mongoose.Types.ObjectId.isValid(jobId))
      throw new Error("Invalid jobId");

    const job = await Job.findById(jobId);
    if (!job) throw new Error("Job not found");

    if (!job.clientId.equals(clientId))
      throw new Error("Not authorized to review this job");

    if (job.status !== "DONE")
      throw new Error("Job must be completed before review");

    const exists = await Review.findOne({ jobId });
    if (exists) throw new Error("Review already submitted");

    const review = await Review.create({
      jobId,
      clientId,
      workerId: job.workerId,
      rating,
      comment,
    });

    await this.recalculateWorkerRating(job.workerId);

    await createNotification({
      userId: job.workerId,
      type: "NEW_REVIEW",
      title: "New Review",
      message: "You received a new review",
      referenceId: review._id,
    });

    emitNotification(job.workerId, {
      type: "NEW_REVIEW",
      title: "New Review",
      message: "Check your profile",
    });

    return review;
  }

  /* =========================
     GET WORKER REVIEWS
  ========================== */
  async getWorkerReviews(workerId) {
    return Review.find({ workerId })
      .populate("clientId", "name")
      .sort({ createdAt: -1 });
  }

  /* =========================
     ADMIN – UPDATE REVIEW
  ========================== */
  async adminUpdateReview(reviewId, updates) {
    if (!mongoose.Types.ObjectId.isValid(reviewId))
      throw new Error("Invalid reviewId");

    const review = await Review.findById(reviewId);
    if (!review) throw new Error("Review not found");

    if (updates.rating !== undefined) {
      if (updates.rating < 1 || updates.rating > 5)
        throw new Error("Rating must be between 1 and 5");
      review.rating = updates.rating;
    }

    if (updates.comment !== undefined) {
      review.comment = updates.comment;
    }

    await review.save();
    await this.recalculateWorkerRating(review.workerId);

    return review;
  }

  /* =========================
     ADMIN – DELETE REVIEW
  ========================== */
  async adminDeleteReview(reviewId) {
    if (!mongoose.Types.ObjectId.isValid(reviewId))
      throw new Error("Invalid reviewId");

    const review = await Review.findById(reviewId);
    if (!review) throw new Error("Review not found");

    const workerId = review.workerId;
    await review.deleteOne();

    await this.recalculateWorkerRating(workerId);

    return { message: "Review deleted successfully" };
  }

  /* =========================
     RECALCULATE RATING
  ========================== */
  async recalculateWorkerRating(workerId) {
    const reviews = await Review.find({ workerId });

    const avg =
      reviews.length === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) /
          reviews.length;

    await User.findByIdAndUpdate(workerId, {
      technician_rate: avg.toFixed(1),
    });
  }
}

module.exports = new ReviewService();
