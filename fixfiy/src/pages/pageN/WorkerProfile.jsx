import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Star,
  MapPin,
  Briefcase,
  Clock,
  ArrowLeft,
} from "lucide-react";

import API from "../../services/api";

import "./WorkerProfile.css";

export default function WorkerProfile() {

  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [worker, setWorker] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    fetchWorker();

  }, []);

  const fetchWorker =
    async () => {

      try {

        const res =
          await API.get(
            `/profile/${id}`
          );

        setWorker(
          res.data.data
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  if (loading) {

    return (
      <div className="worker-profile-page">
        <h2>
          Loading...
        </h2>
      </div>
    );
  }

  if (!worker) {

    return (
      <div className="worker-profile-page">
        <h2>
          Worker not found
        </h2>
      </div>
    );
  }

  return (

    <div className="worker-profile-page">

      <div className="worker-profile-card">

        {/* BACK */}

        <button
          className="back-btn"
          onClick={() =>
            navigate(-1)
          }
        >

          <ArrowLeft size={18} />
          Back

        </button>

        {/* HEADER */}

        <div className="worker-header">

          <img
            src={
              worker.profilePicture?.[0]
                ?.url ||
              `https://ui-avatars.com/api/?name=${worker.name}`
            }
            alt={
              worker.name
            }
            className="worker-profile-image"
          />

          <div>

            <h1>
              {worker.name}
            </h1>

            <div className="worker-specialty-badge">

              <Briefcase size={15} />

              {
                worker.specialty
              }

            </div>

          </div>

        </div>

        {/* STATS */}

        <div className="worker-stats">

          {/* RATING */}

          <div className="stat-box">

            <Star
              size={18}
              fill="#f59e0b"
              color="#f59e0b"
            />

            <div>

              <span>
                Rating
              </span>

              <div>

                <strong>

                  {
                    worker.technician_rate || 0
                  }

                </strong>

                <small
                  style={{
                    display:
                      "block",

                    color:
                      "#6b7280",
                  }}
                >

                  {
                    worker.ratingCount || 0
                  } reviews

                </small>

              </div>

            </div>

          </div>

          {/* EXPERIENCE */}

          <div className="stat-box">

            <Clock size={18} />

            <div>

              <span>
                Experience
              </span>

              <strong>

                {
                  worker.experience_years || 0
                } years

              </strong>

            </div>

          </div>

          {/* LOCATION */}

          <div className="stat-box">

            <MapPin size={18} />

            <div>

              <span>
                Location
              </span>

              <strong>

                {
                  worker.address?.city
                }

              </strong>

            </div>

          </div>

        </div>

        {/* ABOUT */}

        <div className="worker-about">

          <h3>
            About
          </h3>

          <p>

            {worker.bio ||
              "Professional technician ready to help you."}

          </p>

        </div>


        {/* ACTIONS */}

        <div className="worker-actions">

          <button
            className="book-btn"
            onClick={() =>
              navigate(
                `/booking?workerId=${worker._id}`
              )
            }
          >

            Book Now

          </button>

          <button
            className="message-btn"
            onClick={() =>
              navigate(
                `/chat?workerId=${worker._id}&type=INQUIRY`,
                {
                  state: {
                    workerName:
                      worker.name,

                    workerId:
                      worker._id,

                    role:
                      "technician",
                  },
                }
              )
            }
          >

            Send Message

          </button>

          <button
            className="reviews-btn"
            onClick={() =>
              navigate(
                `/worker/${worker._id}/reviews`
              )
            }
          >

            See Reviews

          </button>

        </div>

      </div>

    </div>
  );
}