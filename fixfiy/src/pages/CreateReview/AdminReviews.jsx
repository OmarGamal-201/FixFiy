import React, {
  useEffect,
  useState,
} from "react";

import {
  Star,
  Trash2,
} from "lucide-react";

import API from "../../services/api";

import "./AdminReviews.css";

const AdminReviews = () => {

  const [reviews, setReviews] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchReviews();

  }, []);

  const fetchReviews =
    async () => {

      try {

        const res =
          await API.get(
            "/reviews/admin/reviews"
          );

        setReviews(
          res.data.data || []
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  const handleDelete =
    async (id) => {

      const confirmDelete =
        window.confirm(
          "Delete this review?"
        );

      if (!confirmDelete)
        return;

      try {

        await API.delete(
          `/reviews/admin/reviews/${id}`
        );

        setReviews(
          (prev) =>
            prev.filter(
              (r) =>
                r._id !== id
            )
        );

      } catch (err) {

        console.log(err);

        alert(
          err.response?.data
            ?.message
        );
      }
    };

  if (loading) {

    return (
      <div className="admin-reviews-page">

        Loading...

      </div>
    );
  }

  return (

    <div className="admin-reviews-page">

      <div className="admin-reviews-container">

        {/* HEADER */}

        <div className="admin-reviews-header">

          <h1>
            Reviews Management
          </h1>

          <p>
            Manage all platform reviews
          </p>

        </div>

        {/* REVIEWS */}

        <div className="admin-reviews-list">

          {reviews.length === 0 ? (

            <div className="empty-reviews">

              No reviews found

            </div>

          ) : (

            reviews.map(
              (review) => (

                <div
                  key={
                    review._id
                  }
                  className="admin-review-card"
                >

                  {/* TOP */}

                  <div className="admin-review-top">

                    {/* CLIENT */}

                    <div className="admin-review-user">

                      <img
                        src={
                          review.clientId
                            ?.profilePicture?.[0]
                            ?.url ||

                          `https://ui-avatars.com/api/?name=${review.clientId?.name}`
                        }
                        alt=""
                      />

                      <div>

                        <h4>

                          {
                            review.clientId
                              ?.name
                          }

                        </h4>

                        <span>

                          Client

                        </span>

                      </div>

                    </div>

                    {/* WORKER */}

                    <div className="admin-review-user">

                      <img
                        src={
                          review.workerId
                            ?.profilePicture?.[0]
                            ?.url ||

                          `https://ui-avatars.com/api/?name=${review.workerId?.name}`
                        }
                        alt=""
                      />

                      <div>

                        <h4>

                          {
                            review.workerId
                              ?.name
                          }

                        </h4>

                        <span>

                          Worker

                        </span>

                      </div>

                    </div>

                  </div>

                  {/* STARS */}

                  <div className="admin-stars">

                    {[1,2,3,4,5].map(
                      (star) => (

                        <Star
                          key={star}
                          size={17}
                          fill={
                            star <=
                            review.rating
                              ? "#f59e0b"
                              : "none"
                          }
                          color="#f59e0b"
                        />
                      )
                    )}

                  </div>

                  {/* COMMENT */}

                  <p className="admin-review-comment">

                    {review.comment}

                  </p>

                  {/* FOOTER */}

                  <div className="admin-review-footer">

                    <small>

                      {new Date(
                        review.createdAt
                      ).toLocaleDateString()}

                    </small>

                    <button
                      onClick={() =>
                        handleDelete(
                          review._id
                        )
                      }
                    >

                      <Trash2 size={16} />

                      Delete

                    </button>

                  </div>

                </div>
              )
            )
          )}

        </div>

      </div>

    </div>
  );
};

export default AdminReviews;