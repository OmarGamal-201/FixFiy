import React from "react";

import {
  Star,
} from "lucide-react";

import "./ReviewCard.css";

const ReviewCard = ({
  review,
}) => {

  const client =
    review.clientId;

  return (

    <div className="review-card">

      {/* TOP */}

      <div className="review-top">

        <div className="review-user">

          <img
            src={
              client?.profilePicture?.[0]
                ?.url ||

              `https://ui-avatars.com/api/?name=${client?.name}`
            }
            alt={
              client?.name
            }
            className="review-avatar"
          />

          <div>

            <h4>
              {
                client?.name
              }
            </h4>

            <span>

              {new Date(
                review.createdAt
              ).toLocaleDateString()}

            </span>

          </div>

        </div>

        {/* STARS */}

        <div className="review-stars">

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

      </div>

      {/* COMMENT */}

      <p className="review-comment">

        {review.comment}

      </p>

    </div>
  );
};

export default ReviewCard;