
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./client.css";

const ClientProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await API.get("/profile/me");
        setUser(userRes.data.data);
        const bookingRes = await API.get("/bookings/my");
        setBookings(bookingRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-state">Loading profile...</div>;

  //  حساب الإحصائيات
  const completed = bookings.filter(b => b.status === "completed").length;
  const pending = bookings.filter(b => b.status === "pending").length;
  const active = bookings.filter(b => b.status === "accepted").length;

  return (
    <div className="client-profile-container">
      {/* HEADER SECTION */}
      <div className="profile-header-section">
        <div className="header-background"></div>
        <div className="header-content">
          <div className="avatar-section">
            <div className="avatar-circle">
              <span className="online-indicator"></span>
            </div>
          </div>
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="profile-subtitle">{user.email}</p>
            <button className="edit-btn" onClick={() => navigate("/edit-profile")}>
              <span>✎</span> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <p className="stat-label">Total Bookings</p>
            <h3 className="stat-value">{bookings.length}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <p className="stat-label">Completed</p>
            <h3 className="stat-value">{completed}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <p className="stat-label">Active</p>
            <h3 className="stat-value">{active}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <p className="stat-label">Pending</p>
            <h3 className="stat-value">{pending}</h3>
          </div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="profile-content-grid">
        <div className="info-card">
          <h4>Personal Information</h4>
          <div className="info-item">
            <label>Name</label>
            <value>{user.name}</value>
          </div>
          <div className="info-item">
            <label>Email</label>
            <value>{user.email}</value>
          </div>
          <div className="info-item">
            <label>Phone</label>
            <value>{user.phone || "Not added"}</value>
          </div>
          <div className="info-item">
            <label>Address</label>
            <value>{user.address?.city}, {user.address?.governorate}</value>
          </div>
        </div>
        <div className="info-card">
          <h4>Activity Summary</h4>
          <div className="activity-item">
            <span>Total Bookings</span>
            <strong>{bookings.length}</strong>
          </div>
          <div className="activity-item">
            <span>Completed</span>
            <strong>{completed}</strong>
          </div>
          <div className="activity-item">
            <span>Active</span>
            <strong>{active}</strong>
          </div>
          <div className="activity-item">
            <span>Pending</span>
            <strong>{pending}</strong>
          </div>
        </div>

      </div>

      {/* BOOKINGS SECTION */}
      <div className="bookings-section">
        <div className="section-header">
          <h2>Recent Bookings</h2>
          <p className="section-subtitle">Manage and track your service requests</p>
        </div>

        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>No bookings yet</p>
            <button className="cta-btn" onClick={() => navigate("/booking")}>
              Create First Booking
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-item">
                <div className="booking-header">
                  <div className="booking-title">
                    <h5>{booking.service?.name || "Service Request"}</h5>
                    <span className={`status-badge status-${booking.status?.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="booking-worker">
                    👨‍🔧 {booking.worker?.name || "Unassigned"}
                  </p>
                </div>
                <div className="booking-actions">
                  {booking.status === "completed" && (
                    <button
                      className="btn-primary-sm"
                      onClick={() => navigate(`/review/${booking._id}`)}
                    >
                      ⭐ Add Review
                    </button>
                  )}
                  {booking.worker && (
                    <button
                      className="btn-secondary-sm"
                      onClick={() => navigate(`/worker/${booking.worker._id}`)}
                    >
                      👁️ View Worker
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProfilePage;