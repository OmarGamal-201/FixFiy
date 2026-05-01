
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import API from "../../services/api";
import "./serviceworkers.css";

const ServiceWorkersPage = () => {
  const { serviceId } = useParams(); 
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serviceId) return;

    const controller = new AbortController(); 
    const fetchWorkers = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/workers?service=${serviceId}`, {
          signal: controller.signal,
        });
        setWorkers(res.data);
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.log("Error fetching workers:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();

    return () => controller.abort(); 
  }, [serviceId]);

  if (loading) return <h2>Loading workers...</h2>;

  const handleBook = (technician) => {
    navigate(`/booking?workerId=${technician._id}`, {
      state: { workerName: technician.name },
    });
  };

  const handleContact = (technician) => {
    navigate(`/chat?workerId=${technician._id}`, {
      state: { workerName: technician.name },
    });
  };

  return (
    <div className="workers-gallery-container">
      <h2 className="service-title">{serviceId || "Our Workers"}</h2>

      {workers.length === 0 ? (
        <p>No workers found for this service.</p>
      ) : (
        <div className="workers-grid">
          {workers.map((technician) => (
            <div key={technician._id} className="worker-card">

              <div className="worker-avatar">
                <div className="placeholder-img"></div>
              </div>

              <div className="worker-info">
                <h4
                  className="worker-name-link"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/worker-profile/${technician._id}`)}
                >
                  {technician.name}
                </h4>
                <p className="worker-job">{technician.specialty}</p>

                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < (technician.rating || 0) ? "#FFD700" : "none"}
                      color={i < (technician.rating || 0) ? "#FFD700" : "#cbd5e1"}
                    />
                  ))}
                  <span className="rating-num">{technician.rating || 0}</span>
                </div>
              </div>

              <div className="worker-actions">
                <button
                  className="view-profile-btn"
                  onClick={() => handleBook(technician)}
                >
                  Book
                </button>
                <button
                  className="contact-btn"
                  onClick={() => handleContact(technician)}
                >
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