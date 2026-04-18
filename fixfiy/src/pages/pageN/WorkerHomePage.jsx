
import React from "react";
import { useState, useEffect } from "react";
import { Star, CheckCircle, Clock, DollarSign } from "lucide-react";
import "./WorkerHomePage.css";
import API from "../../services/api";

function WorkerHomePage() {
  const [showAll, setShowAll] = useState(false);
  const [stats, setStats] = useState([]);
  const [requests, setRequests] = useState([]);
  const [latestReview, setLatestReview] = useState(null);
  const [workerName, setWorkerName] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get("/worker/dashboard");
        const data = res.data.data;

        console.log("WORKER DASHBOARD:", data);

        setWorkerName(data.name || "Worker");

        setStats([
          {
            label: "Completed",
            value: data.jobs?.completed ?? "0",
            icon: <CheckCircle size={20} />,
            color: "#4caf50",
          },
          {
            label: "Active",
            value: data.jobs?.active ?? "0",
            icon: <Clock size={20} />,
            color: "#2196f3",
          },
          {
            label: "Rating",
            value: data.rating ?? "0",
            icon: <Star size={20} />,
            color: "#ffc107",
          },
          {
            label: "Earnings",
            value: `${data.earnings ?? "0"} EGP`,
            icon: <DollarSign size={20} />,
            color: "#9c27b0",
          },
        ]);

        if (data.latestReview) {
          setLatestReview(data.latestReview);
        }
      } catch (err) {
        console.log("Dashboard fetch error:", err);
      }
    };

    const fetchRequests = async () => {
      try {
        const res = await API.get("/worker/jobs");
        setRequests(res.data.data);
      } catch (err) {
        console.log("Jobs fetch error:", err);
      }
    };

    fetchDashboard();
    fetchRequests();
  }, []);

  const displayedRequests = showAll ? requests : requests.slice(0, 3);

  return (
    <div className="worker-home-container">

      <div className="welcome-banner">
        <div className="welcome-text">
          <h3>Hello, {workerName}!</h3>
          <p>Are you ready for new requests?</p>
        </div>
        <div className="welcome-img"></div>
      </div>

      <div className="worker-stats-grid">
        {stats.map((stat, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-icon" style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-lower-section">

        <div className="requests-table-container">
          <div className="section-header">
            <h4>Recent Requests</h4>
            <span
              className="view"
              onClick={() => setShowAll(!showAll)}
              style={{ cursor: "pointer", color: "#1976d2", fontWeight: "bold" }}
            >
              {showAll ? "Show less" : "View all"}
            </span>
          </div>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Client</th>
                <th>Service</th>
                <th>Location</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedRequests.map((request) => (
                <tr key={request._id}>
                  <td>{request._id.slice(-5)}</td>
                  <td>{request.clientId?.name || "-"}</td>
                  <td>{request.serviceId?.name || "-"}</td>
                  <td>{request.location || "-"}</td>
                  <td>
                    {request.createdAt
                      ? new Date(request.createdAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    <span
                      className={
                        request.status === "completed" ? "complete" : "pending"
                      }
                    >
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="latest-review-card">
          <h4>Latest Review</h4>
          {latestReview ? (
            <div className="review-content">
              <div className="review-user">
                <div className="user-avatar-small"></div>
                <div>
                  <p className="user-name">
                    {latestReview.clientId?.name || "Client"}
                  </p>
                  <div className="user-rating">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < latestReview.rating ? "#ffc107" : "none"}
                        color="#ffc107"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="review-text">"{latestReview.comment}"</p>
            </div>
          ) : (
            <p style={{ color: "#888", fontSize: "14px" }}>No reviews yet.</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default WorkerHomePage;