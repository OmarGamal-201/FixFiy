import React, { useEffect, useState } from 'react';
import './Worker.css';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import API from "../../services/api";

const WorkerPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await API.get("/profile/me");
      setUser(res.data.data);
    };
    fetchUser();
  }, []);

  if (!user) return <h2>Loading...</h2>;

  return (
    <div className="worker-profile-container">

      {/* HEADER */}
      <div className="profile-header-section">
        <div className="blue-cover"></div>

        <div className="profile-avatar-wrapper">
          <div className="avatar-circle">
            <span className="online-status"></span>
          </div>

          <div className="profile-name-info">
            <div>
              <h2>{user.name}</h2>

              <p style={{ color: "#64748b", marginTop: "5px" }}>
                {user.specialties?.[0]} • {user.experience_years} yrs exp
              </p>
            </div>

            <button
              className="edit-profile-btn"
              onClick={() => navigate('/edit-profile')}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="profile-content-grid">

        {/* Rating */}
        <div className="info-card">
          <h4>Reputation</h4>

          <div className="info-item">
            <strong>{user.technician_rate || 4.5}</strong>

            <div className="stars-row">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < (user.technician_rate || 4) ? "#ffc107" : "none"}
                  color="#ffc107"
                />
              ))}
            </div>
          </div>

          <div className="info-item">
            <span>Availability</span>
            <strong style={{ color: "#22c55e" }}>Available</strong>
          </div>
        </div>

        {/* Stats */}
        <div className="services-card">
          <h4>Work Stats</h4>

          <div className="stats-row">
            <div className="stat-box">
              <h2 className="stat-value">120</h2>
              <p className="stat-label">Completed</p>
            </div>

            <div className="stat-box">
              <h2 className="stat-value">5</h2>
              <p className="stat-label">Active</p>
            </div>

            <div className="stat-box">
              <h2 className="stat-value">3</h2>
              <p className="stat-label">Pending</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default WorkerPage;