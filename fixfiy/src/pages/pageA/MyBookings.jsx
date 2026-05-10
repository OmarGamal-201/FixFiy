
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Loader2,
  AlertCircle,
  Calendar,
  CreditCard,
  Star,
  XCircle,
} from "lucide-react";
import API from "../../services/api";
import "./MyBookings.css";

const MyBookings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // قراءة الـ role
  const userRole = (
    localStorage.getItem("role") ||
    localStorage.getItem("userRole")
  )?.toLowerCase();

  useEffect(() => {
    if (userRole !== "client") {
      navigate("/");
      return;
    }

    fetchJobs();
  }, [userRole, navigate]);

  // =========================
  // Fetch Jobs
  // =========================
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await API.get("/jobs");

      const fetchedJobs = res.data.data || res.data;
      setJobs(Array.isArray(fetchedJobs) ? fetchedJobs : []);
    } catch (err) {
      console.error("Fetch Error:", err.response?.data);
      setError(
        err.response?.data?.message ||
          "Failed to load bookings. Please try again."
      );
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Cancel Booking
  // =========================
  const handleCancel = async (jobId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      await API.patch(`/jobs/${jobId}/cancel`, {
        reason: "Client canceled from MyBookings",
      });

      alert("Booking canceled successfully.");
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
    }
  };

  // =========================
  // Chat Navigation
  // =========================
  const handleChat = (jobId, workerId) => {
    navigate(`/chat?jobId=${jobId}&receiverId=${workerId}`);
  };

  // =========================
  // Payment Navigation
  // =========================
  const handleDepositPayment = (jobId) => {
    navigate(`/payments?jobId=${jobId}`);
  };

  const handleFinalPayment = (jobId) => {
    navigate(`/payments?jobId=${jobId}`);
  };

  // =========================
  // Status Styling
  // =========================
  const getStatusClass = (status) => {
    switch (status) {
      case "PENDING":
        return "pending";
      case "ACCEPTED":
        return "accepted";
      case "ACTIVE":
        return "active";
      case "DONE":
        return "done";
      case "CANCELED":
        return "canceled";
      case "REJECTED":
        return "rejected";
      default:
        return "";
    }
  };

  if (userRole !== "client") return null;

  return (
    <div className="bookings-container">
      <div className="my-bookings-container">
        {/* ================= HEADER ================= */}
        <div className="bookings-header">
          <h2>My Bookings</h2>
          <p>View and manage all your service requests</p>
        </div>

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="loading-state">
            <Loader2 className="spinner" />
            <p>Fetching your bookings...</p>
          </div>
        )}

        {/* ================= ERROR ================= */}
        {error && (
          <div className="error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ================= EMPTY STATE ================= */}
        {!loading && jobs.length === 0 && !error && (
          <div className="empty-state">
            <Calendar size={48} />
            <h3>No Bookings Found</h3>
            <p>You haven't booked any services yet.</p>
            <button
              onClick={() => navigate("/services")}
              className="book-now-btn"
            >
              Book a Service
            </button>
          </div>
        )}

        {/* ================= BOOKINGS CARDS ================= */}
        {!loading && !error && jobs.length > 0 && (
          <div className="bookings-cards">
            {jobs.map((job) => (
              <div key={job._id} className="booking-card">
                {/* Title */}
                <div className="booking-card-header">
                  <h3>{job.title}</h3>
                  <span
                    className={`status-badge ${getStatusClass(job.status)}`}
                  >
                    {job.status}
                  </span>
                </div>

                {/* Details */}
                <div className="booking-details">
                  <p>
                    <strong>Service:</strong>{" "}
                    {job.serviceId?.name || "Service not available"}
                  </p>

                  <p>
                    <strong>Technician:</strong>{" "}
                    {job.workerId?.name || "Searching for technician..."}
                  </p>

                  <p>
                    <strong>Total Price:</strong> {job.total_price} EGP
                  </p>

                  <p>
                    <strong>Payment Status:</strong>{" "}
                    {job.paymentStatus || "UNPAID"}
                  </p>
                </div>

                {/* ================= ACTION BUTTONS ================= */}
                <div className="booking-actions">
                  {/* Deposit Payment */}
                  {job.paymentStatus === "UNPAID" && (
                    <button
                      className="pay-btn"
                      onClick={() => handleDepositPayment(job._id)}
                    >
                      <CreditCard size={16} />
                      Pay Deposit
                    </button>
                  )}

                  {/* Final Payment */}
                  {job.status === "DONE" &&
                    job.paymentStatus === "DEPOSIT_PAID" && (
                      <button
                        className="pay-final-btn"
                        onClick={() => handleFinalPayment(job._id)}
                      >
                        <CreditCard size={16} />
                        Pay Remaining Amount
                      </button>
                    )}

                  {/* Review */}
                  {job.status === "DONE" &&
                    job.paymentStatus === "PAID" &&
                    !job.reviewId && (
                      <button
                        className="review-btn"
                        onClick={() => navigate(`/rate/${job._id}`)}
                      >
                        <Star size={16} />
                        Review Service
                      </button>
                    )}

                  {/* Cancel */}
                  {job.status === "PENDING" && (
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancel(job._id)}
                    >
                      <XCircle size={16} />
                      Cancel Booking
                    </button>
                  )}

                  {/* Chat */}
                  {(job.status === "ACCEPTED" ||
                    job.status === "ACTIVE") &&
                    job.workerId?._id && (
                      <button
                        className="chat-btn"
                        onClick={() =>
                          handleChat(job._id, job.workerId._id)
                        }
                      >
                        <MessageSquare size={16} />
                        Chat with Technician
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

export default MyBookings;