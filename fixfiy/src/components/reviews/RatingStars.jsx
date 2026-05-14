import React from "react";
import { Star } from "lucide-react";

const RatingStars = ({
  rating = 0,
  size = 18,
}) => {

  return (

    <div className="d-flex gap-1">

      {[1, 2, 3, 4, 5].map(
        (star) => (

          <Star
            key={star}
            size={size}
            fill={
              star <= rating
                ? "#FFC107"
                : "none"
            }
            color="#FFC107"
          />
        )
      )}

    </div>
  );
};

export default RatingStars;