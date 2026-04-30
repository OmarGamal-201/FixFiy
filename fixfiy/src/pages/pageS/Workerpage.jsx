

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Briefcase, CheckCircle, Clock, Settings } from "lucide-react";
import API from "../../services/api";
import "./Worker.css"; // We will use shared layout logic here

const WorkerPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/profile/me");
        setUser(res.data.data);
      } catch (err) {
        console.error("Error fetching worker profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) return <div className="loading-state">Loading worker profile...</div>;
  if (!user) return <div className="error-state">Profile not found</div>;

  const rating = user.technician_rate || 0;

  return (
    <div className="client-profile-container"> {/* Reusing container class for consistent padding */}
      
      {/* HEADER SECTION */}
      <div className="profile-header-section">
        <div className="header-background worker-bg"></div> {/* Custom blue/gradient for workers */}
        <div className="header-content">
          <div className="avatar-section">
            <div className="avatar-circle">
              <span className="online-indicator"></span>
            </div>
          </div>
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="profile-subtitle">
              {user.specialty || "Professional Technician"} • {user.experience_years || 0} Years Exp.
            </p>
            <div className="header-actions">
              <button className="edit-btn" onClick={() => navigate("/edit-profile")}>
                <Settings size={16} /> Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <p className="stat-label">Rating</p>
            <h3 className="stat-value">{rating.toFixed(1)}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#22c55e' }}><CheckCircle /></div>
          <div className="stat-content">
            <p className="stat-label">Completed</p>
            <h3 className="stat-value">{user.completedJobs || 0}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#3b82f6' }}><Briefcase /></div>
          <div className="stat-content">
            <p className="stat-label">Active</p>
            <h3 className="stat-value">{user.activeJobs || 0}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#f59e0b' }}><Clock /></div>
          <div className="stat-content">
            <p className="stat-label">Pending</p>
            <h3 className="stat-value">{user.pendingJobs || 0}</h3>
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="profile-content-grid">
        {/* PERSONAL INFO */}
        <div className="info-card">
          <h4>Professional Information</h4>
          <div className="info-item">
            <label>Full Name</label>
            <span className="info-value">{user.name}</span>
          </div>
          <div className="info-item">
            <label>Specialty</label>
            <span className="info-value">{user.specialty || "Not specified"}</span>
          </div>
          <div className="info-item">
            <label>Phone</label>
            <span className="info-value">{user.phone || "Not added"}</span>
          </div>
          <div className="info-item">
            <label>Location</label>
            <span className="info-value">{user.address?.city}, {user.address?.governorate}</span>
          </div>
        </div>

        {/* REPUTATION & STARS */}
        <div className="info-card">
          <h4>Reputation Details</h4>
          <div className="reputation-stars-box">
             <div className="big-rating">{rating.toFixed(1)}</div>
             <div className="stars-row">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    fill={i < Math.round(rating) ? "#ffc107" : "none"}
                    color="#ffc107"
                  />
                ))}
             </div>
             <p className="availability-text">
               Status: <strong style={{ color: "#22c55e" }}>Available for Hire</strong>
             </p>
          </div>
          
          <div className="info-item" style={{ marginTop: '20px' }}>
            <label>Member Since</label>
            <span className="info-value">2024</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerPage;