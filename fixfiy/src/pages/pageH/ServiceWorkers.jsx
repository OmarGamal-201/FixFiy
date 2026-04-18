


import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import API from "../../services/api";
import "./serviceworkers.css";

const ServiceWorkersPage = () => {
  const { serviceName } = useParams();
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  //  Fetch workers from backend
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setLoading(true);

        const res = await API.get(
          `/workers?service=${serviceName}`
        );

        setWorkers(res.data);
      } catch (error) {
        console.log("Error fetching workers:", error);
      } finally {
        setLoading(false);
      }
    };

    if (serviceName) {
      fetchWorkers();
    }
  }, [serviceName]);

  //  Loading state
  if (loading) {
    return <h2>Loading workers...</h2>;
  }

  return (
    <div className="workers-gallery-container">
      <h2 className="service-title">
        {serviceName || "Our Workers"}
      </h2>

      {workers.length === 0 ? (
        <p>No workers found for this service.</p>
      ) : (
        <div className="workers-grid">
          {workers.map((worker) => (
            <div key={worker._id} className="worker-card">

              {/*  Avatar */}
              <div className="worker-avatar">
                <div className="placeholder-img"></div>
              </div>

              {/*  Info */}
              <div className="worker-info">
                <h4>{worker.name}</h4>
                <p className="worker-job">{worker.service}</p>

                {/*  Rating */}
                <div className="rating-stars">
                  {[...Array(worker.rating || 0)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill="#FFD700"
                      color="#FFD700"
                    />
                  ))}
                  <span className="rating-num">
                    {worker.rating || 0}
                  </span>
                </div>
              </div>

              {/*  Actions */}
              <div className="worker-actions">
                <button
                  className="view-profile-btn"
                  onClick={() =>
                    navigate(`/worker/${worker._id}`)
                  }
                >
                  View Profile
                </button>

                <button className="contact-btn">
                  Contact
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceWorkersPage;