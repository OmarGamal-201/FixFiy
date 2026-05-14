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

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function WorkerProfile() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [worker, setWorker] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchWorker();
  }, []);

  const fetchWorker = async () => {

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
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="worker-profile-page">
        <h2>Worker not found</h2>
      </div>
    );
  }

  return (
    <div className="worker-profile-page">

      <div className="worker-profile-card">

        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="worker-header">

       
<img
  src={
    worker.profilePicture?.[0]?.url ||
    `https://ui-avatars.com/api/?name=${worker.name}`
  }
  alt={worker.name}
  className="worker-profile-image"
/>



          <div>

            <h1>
              {worker.name}
            </h1>

            <div className="worker-specialty-badge">
              <Briefcase size={15} />
              {worker.specialty}
            </div>

          </div>

        </div>

        <div className="worker-stats">

          <div className="stat-box">

            <Star
              size={18}
              fill="#f59e0b"
              color="#f59e0b"
            />

            <div>
              <span>Rating</span>

              <strong>
                {worker.technician_rate || 0}
              </strong>
            </div>
          </div>

          <div className="stat-box">

            <Clock size={18} />

            <div>
              <span>Experience</span>

              <strong>
                {worker.experience_years || 0} years
              </strong>
            </div>

          </div>

          <div className="stat-box">

            <MapPin size={18} />

            <div>
              <span>Location</span>

              <strong>
                {worker.address?.city}
              </strong>
            </div>

          </div>

        </div>

        <div className="worker-about">

          <h3>
            About
          </h3>

          <p>
            {worker.bio ||
              "Professional technician ready to help you."}
          </p>

        </div>

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
          workerName: worker.name,
        },
      }
    )
  }
>
  Send Message
</button>

        </div>

      </div>

    </div>
  );
}