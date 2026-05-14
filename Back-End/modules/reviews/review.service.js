const mongoose = require("mongoose");

const Review = require("./review.model");

const Job = require("../jobs/job.model");

const {
  Technician,
} = require("../users/user.model");
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

class ReviewService {

  /* =========================
     CREATE REVIEW (CLIENT)
  ========================== */

  async createReview({
    jobId,
    clientId,
    rating,
    comment,
  }) {

    if (
      !mongoose.Types.ObjectId.isValid(
        jobId
      )
    ) {
      throw new Error(
        "Invalid jobId"
      );
    }

    const job =
      await Job.findById(
        jobId
      );

    if (!job) {
      throw new Error(
        "Job not found"
      );
    }

    // ONLY JOB OWNER

    if (
      !job.clientId.equals(
        clientId
      )
    ) {
      throw new Error(
        "Not authorized to review this job"
      );
    }

    // JOB MUST BE DONE

    if (
      job.status !== "DONE"
    ) {
      throw new Error(
        "Job must be completed before review"
      );
    }

    // JOB MUST HAVE WORKER

    if (!job.workerId) {
      throw new Error(
        "Job has no assigned worker"
      );
    }

    // PREVENT DUPLICATE

    const exists =
      await Review.findOne({
        jobId,
      });

    if (exists) {
      throw new Error(
        "Review already submitted"
      );
    }

    // CREATE REVIEW

    const review =
      await Review.create({
        jobId,
        clientId,
        workerId:
          job.workerId,
        rating,
        comment,
      });

    // LINK REVIEW TO JOB

    await Job.findByIdAndUpdate(
      jobId,
      {
        reviewId:
          review._id,
      }
    );

    // UPDATE WORKER RATING

    await this.recalculateWorkerRating(
      job.workerId
    );

    // NOTIFICATION

    await createNotification({
      userId:
        job.workerId,

      type:
        "NEW_REVIEW",

      title:
        "New Review",

      message:
        "You received a new review",

      referenceId:
        review._id,
    });

    emitNotification(
      job.workerId,
      {
        type:
          "NEW_REVIEW",

        title:
          "New Review",

        message:
          "Check your profile",
      }
    );

    return review;
  }

  /* =========================
     GET WORKER REVIEWS
  ========================== */

  async getWorkerReviews(
    workerId
  ) {

    if (
      !mongoose.Types.ObjectId.isValid(
        workerId
      )
    ) {
      throw new Error(
        "Invalid workerId"
      );
    }

    return Review.find({
      workerId,
    })

      .populate(
        "clientId",
        "name profilePicture"
      )

      .sort({
        createdAt: -1,
      });
  }

  /* =========================
     ADMIN GET ALL REVIEWS
  ========================== */

  async adminGetAllReviews() {

    return Review.find()

      .populate(
        "clientId",
        "name profilePicture"
      )

      .populate(
        "workerId",
        "name profilePicture"
      )

      .sort({
        createdAt: -1,
      });
  }

  /* =========================
     ADMIN UPDATE REVIEW
  ========================== */

  async adminUpdateReview(
    reviewId,
    updates
  ) {

    if (
      !mongoose.Types.ObjectId.isValid(
        reviewId
      )
    ) {
      throw new Error(
        "Invalid reviewId"
      );
    }

    const review =
      await Review.findById(
        reviewId
      );

    if (!review) {
      throw new Error(
        "Review not found"
      );
    }

    // LIMIT EDIT TIME

    const HOURS_LIMIT =
      48;

    const diffHours =
      (Date.now() -
        review.createdAt) /
      (1000 * 60 * 60);

    if (
      diffHours >
      HOURS_LIMIT
    ) {
      throw new Error(
        "Review can no longer be edited"
      );
    }

    // UPDATE RATING

    if (
      updates.rating !==
      undefined
    ) {

      if (
        updates.rating < 1 ||
        updates.rating > 5
      ) {
        throw new Error(
          "Rating must be between 1 and 5"
        );
      }

      review.rating =
        updates.rating;
    }

    // UPDATE COMMENT

    if (
      updates.comment !==
      undefined
    ) {
      review.comment =
        updates.comment;
    }

    await review.save();

    // RECALCULATE

    await this.recalculateWorkerRating(
      review.workerId
    );

    return review;
  }

  /* =========================
     ADMIN DELETE REVIEW
  ========================== */

  async adminDeleteReview(
    reviewId
  ) {

    if (
      !mongoose.Types.ObjectId.isValid(
        reviewId
      )
    ) {
      throw new Error(
        "Invalid reviewId"
      );
    }

    const review =
      await Review.findById(
        reviewId
      );

    if (!review) {
      throw new Error(
        "Review not found"
      );
    }

    const workerId =
      review.workerId;

    const jobId =
      review.jobId;

    // DELETE REVIEW

    await review.deleteOne();

    // REMOVE FROM JOB

    await Job.findByIdAndUpdate(
      jobId,
      {
        $unset: {
          reviewId: "",
        },
      }
    );

    // UPDATE WORKER RATING

    await this.recalculateWorkerRating(
      workerId
    );

    return {
      message:
        "Review deleted successfully",
    };
  }

  /* =========================
     RECALCULATE WORKER RATING
  ========================== */

  async recalculateWorkerRating(
    workerId
  ) {

    const reviews =
      await Review.find({
        workerId,
      });

    const avg =
      reviews.length === 0
        ? 0
        : reviews.reduce(
            (sum, r) =>
              sum + r.rating,
            0
          ) /
          reviews.length;

    await Technician.findByIdAndUpdate(
      workerId,
      {
        technician_rate:
          Number(
            avg.toFixed(1)
          ),

        ratingCount:
          reviews.length,
      }
    );
  }
}

module.exports =
  new ReviewService();