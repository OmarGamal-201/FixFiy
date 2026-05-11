import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Star,
  ArrowLeft,
  Send,
} from "lucide-react";

import API from "../../services/api";
import "./CreateReview.css";

const CreateReview = () => {

  const navigate = useNavigate();

  const { jobId } = useParams();

  const [rating, setRating] = useState(0);

  const [hovered, setHovered] = useState(0);

  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!rating) {
      return alert("Please select rating");
    }

    try {

      setLoading(true);

      await API.post("/reviews", {
        jobId,
        rating,
        comment,
      });

      alert("Review submitted successfully");

      navigate("/my-bookings");

    } catch (err) {

      console.log(err);

      alert(
        err.response?.data?.message ||
        "Failed to submit review"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="review-page">

      <div className="review-card">

        {/* HEADER */}

        <div className="review-header">

          <button
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h2>Write Review</h2>
            <p>
              Share your experience with the technician
            </p>
          </div>

        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit}>

          {/* STARS */}

          <div className="rating-section">

            <h3>Your Rating</h3>

            <div className="stars-container">

              {[1, 2, 3, 4, 5].map((star) => (

                <Star
                  key={star}
                  size={38}
                  className={
                    star <= (hovered || rating)
                      ? "star active"
                      : "star"
                  }
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  fill={
                    star <= (hovered || rating)
                      ? "#facc15"
                      : "transparent"
                  }
                />

              ))}

            </div>

            <span className="rating-text">

              {rating === 1 && "Very Bad"}
              {rating === 2 && "Bad"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}

            </span>

          </div>

          {/* COMMENT */}

          <div className="comment-section">

            <label>
              Comment
            </label>

            <textarea
              value={comment}
              onChange={(e) =>
                setComment(e.target.value)
              }
              placeholder="Tell us about your experience..."
              rows={6}
            />

          </div>

          {/* BUTTON */}

          <button
            type="submit"
            className="submit-review-btn"
            disabled={loading}
          >

            <Send size={18} />

            {
              loading
                ? "Submitting..."
                : "Submit Review"
            }

          </button>

        </form>

      </div>
    </div>
  );
};

export default CreateReview;