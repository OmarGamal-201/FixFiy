
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./client.css";

const ClientProfilePage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);

  //  تحميل البيانات
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await API.get("/profile/me");
        setUser(userRes.data.data);

        const bookingRes = await API.get("/bookings/my");
        setBookings(bookingRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  if (!user) return <h2>Loading...</h2>;

  //  حساب الإحصائيات
  const completed = bookings.filter(b => b.status === "completed").length;
  const pending = bookings.filter(b => b.status === "pending").length;
  const active = bookings.filter(b => b.status === "accepted").length;

  return (
    <div className="client-profile-container">

      {/*  HEADER */}
      <div className="profile-header-section">
        <div className="blue-cover"></div>

        <div className="profile-avatar-wrapper">
          <div className="avatar-circle">
            <span className="online-status"></span>
          </div>

          <div className="profile-name-info">
            <div>
              <h2>{user.name}</h2>

              {/* <p style={{ color: "#64748b", marginTop: "5px" }}>
                {user.address?.city}, {user.address?.governorate}
              </p> */}
            </div>

            <button
              className="edit-profile-btn"
              onClick={() => navigate("/edit-profile")}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/*  STATS */}
      <div className="profile-content-grid">
<div className="info-card2">
  <h4>My Info</h4>

  <div className="info-item">
    <span>Name</span>
    <strong>{user.name}</strong>
  </div>

  <div className="info-item">
    <span>Email</span>
    <strong>{user.email}</strong>
  </div>

  <div className="info-item">
    <span>Phone</span>
    <strong>{user.phone || "Not added"}</strong>
  </div>

  <div className="info-item">
    <span>Address</span>
    <strong>
      {user.address?.city}, {user.address?.governorate}
    </strong>
  </div>
</div>
        <div className="info-card">
          <h4>My Activity</h4>

          <div className="info-item">
            <span>Total Requests</span>
            <strong>{bookings.length}</strong>
          </div>

          <div className="info-item">
            <span>Completed</span>
            <strong>{completed}</strong>
          </div>

          <div className="info-item">
            <span>Active</span>
            <strong>{active}</strong>
          </div>

          <div className="info-item">
            <span>Pending</span>
            <strong>{pending}</strong>
          </div>
        </div>

        {/*  BOOKINGS */}
        <div className="services-card">
          <h4>My Bookings</h4>

          {bookings.length === 0 ? (
            <p>No bookings yet</p>
          ) : (
            bookings.map((booking) => (
              <div key={booking._id} className="booking-card">

                <div className="booking-info">
                  <h5>{booking.service?.name}</h5>
                  <p>
                    Worker: {booking.worker?.name || "Not assigned"}
                  </p>

                  <span className={`status ${booking.status}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="booking-actions">

                  {/*  زر Review */}
                  {booking.status === "completed" && (
                    <button
                      onClick={() => navigate(`/review/${booking._id}`)}
                      className="review-btn"
                    >
                      Add Review
                    </button>
                  )}

                  {/*  عرض العامل */}
                  {booking.worker && (
                    <button
                      onClick={() => navigate(`/worker/${booking.worker._id}`)}
                      className="view-btn"
                    >
                      View Worker
                    </button>
                  )}

                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default ClientProfilePage;