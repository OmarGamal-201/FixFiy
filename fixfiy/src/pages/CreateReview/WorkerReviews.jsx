import React, {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import {
  Star,
  ArrowLeft,
} from "lucide-react";

import API from "../../services/api";

import ReviewCard from "../../components/reviews/ReviewCard";

import "./WorkerReviews.css";

const WorkerReviews = () => {

  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [worker, setWorker] =
    useState(null);

  const [reviews, setReviews] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchData();

  }, []);

  const fetchData =
    async () => {

      try {

        // WORKER

        const workerRes =
          await API.get(
            `/profile/${id}`
          );

        setWorker(
          workerRes.data.data
        );

        // REVIEWS

        const reviewsRes =
          await API.get(
            `/reviews/worker/${id}`
          );

        setReviews(
          reviewsRes.data.data
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  if (loading) {

    return (
      <div className="worker-reviews-page">

        Loading...

      </div>
    );
  }

  return (

    <div className="worker-reviews-page">

      <div className="reviews-container">

        {/* BACK */}

        <button
          className="reviews-back-btn"
          onClick={() =>
            navigate(-1)
          }
        >

          <ArrowLeft size={18} />

          Back

        </button>

        {/* TOP BAR */}

        <div className="reviews-topbar">

          <div className="reviews-worker-info">

            <img
              src={
                worker?.profilePicture?.[0]
                  ?.url ||

                `https://ui-avatars.com/api/?name=${worker?.name}`
              }
              alt=""
              className="reviews-worker-avatar"
            />

            <div>

              <h2>
                {worker?.name}
              </h2>

              <div className="reviews-rating-row">

                <Star
                  size={16}
                  fill="#f59e0b"
                  color="#f59e0b"
                />

                <span>

                  {
                    worker?.technician_rate || 0
                  }

                </span>

                <small>

                  (
                  {
                    worker?.ratingCount || 0
                  } reviews
                  )

                </small>

              </div>

            </div>

          </div>

        </div>

        {/* REVIEWS */}

        <div className="reviews-list">

          {reviews.length === 0 ? (

            <div className="no-reviews-card">

              No reviews yet

            </div>

          ) : (

            reviews.map(
              (review) => (

                <ReviewCard
                  key={
                    review._id
                  }
                  review={review}
                />
              )
            )
          )}

        </div>

      </div>

    </div>
  );
};

export default WorkerReviews;