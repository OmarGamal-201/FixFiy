import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./client.css";

const ClientProfilePage = () => {
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
    <div className="client-profile-container">

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
                {user.address?.city}, {user.address?.governorate}
              </p>
            </div>

            <button
              className="edit-profile-btn"
              onClick={() => navigate("/edit-profile")}
            >
              Edit profile
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="profile-content-grid">

        {/* Activity Card */}
        <div className="info-card">
          <h4>Activity</h4>

          <div className="info-item">
            <span>Requests Made</span>
            <strong>24</strong>
          </div>

          <div className="info-item">
            <span>Completed Jobs</span>
            <strong>18</strong>
          </div>

          <div className="info-item">
            <span>Favorite Services</span>
            <strong>Electricity</strong>
          </div>
        </div>

        {/* Services */}
        <div className="services-card">
          <h4>Frequently Used Services</h4>

          <div className="stats-row">
            <div className="stat-box">
              <h2 className="stat-value">15</h2>
              <p className="stat-label">Electricity</p>
            </div>

            <div className="stat-box">
              <h2 className="stat-value">10</h2>
              <p className="stat-label">Plumbing</p>
            </div>

            <div className="stat-box">
              <h2 className="stat-value">6</h2>
              <p className="stat-label">Cleaning</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ClientProfilePage;