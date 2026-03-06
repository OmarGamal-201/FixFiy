
import React from 'react';
import './Worker.css';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Paintbrush, Star } from 'lucide-react';

const WorkerPage = ({ userData }) => {
  const navigate = useNavigate();

  const defaultUser = {
    name: "",
    role: "",
    email: "",
    phone: "",
    location: "R",
    job: "",
    experience: "",
    rating: 4,
    stats: [
      { label: "Completed requests", value: "" },
      { label: "Active requests", value: "" },
      { label: "Waiting requests", value: "" }
    ]
  };

  const user = userData || defaultUser;

  return (
    <div className="worker-profile-container">

      {/* ===== HEADER ===== */}
      <div className="profile-header-section">
        <div className="blue-cover"></div>

        <div className="profile-avatar-wrapper">
          {/* Avatar */}
          <div className="avatar-circle">
            {user.role !== 'admin' && <span className="online-status"></span>}
          </div>

          {/* Name + Edit Button */}
          <div className="profile-name-info">
            <h2>{user.name}</h2>
            <button
              className="edit-profile-btn"
              onClick={() => navigate('/edit-profile')}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* ===== CONTENT GRID ===== */}
      <div className="profile-content-grid">

        {/* LEFT: Info Card */}
        <div className="info-card">
          <h4>Info</h4>

          <div className="info-item">
            <Mail size={18} />
            <span>{user.email}</span>
          </div>

          <div className="info-item">
            <Phone size={18} />
            <span>{user.phone}</span>
          </div>

          <div className="info-item">
            <MapPin size={18} />
            <span>{user.location}</span>
          </div>

          <div className="info-item">
            <Paintbrush size={18} />
            <span>{user.job || "Service Provider"}</span>
          </div>

          <div className="info-item">
            <span>{user.experience || "Available for hire"}</span>
          </div>

          <div className="info-item">
            <span className="rating-num">{user.rating || 5}</span>
            <div className="stars-row">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < (user.rating || 5) ? "#ffc107" : "none"}
                  color={i < (user.rating || 5) ? "#ffc107" : "#ccc"}
                />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Stats Card */}
        <div className="services-card">
          <h4>Quick Stats</h4>
          <div className="stats-row">
            {(user.stats || defaultUser.stats).map((stat, index) => (
              <div key={index} className="stat-box">
                <h2 className="stat-value">{stat.value}</h2>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default WorkerPage;