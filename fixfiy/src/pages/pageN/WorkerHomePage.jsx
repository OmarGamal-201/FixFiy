
import React from "react";
import { useState, useEffect, useMemo } from "react";
import { Star, CheckCircle, Clock, DollarSign } from "lucide-react";
import "./WorkerHomePage.css";
import API from "../../services/api";

function WorkerHomePage() {
  const [showAll, setShowAll] = useState(false);
  const [requests, setRequests] = useState([]);
  const [workerName, setWorkerName] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await API.get("/profile/me");
        const profileData = profileRes.data.data;
        setWorkerName(profileData.name || "Worker");
        setProfile(profileData);

        const requestsRes = await API.get("/jobs");
        setRequests(requestsRes.data.data || []);
      } catch (err) {
        console.log("Fetch error:", err);
      }
    };

    fetchData();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get("/jobs");
      setRequests(res.data.data || []);
    } catch (err) {
      console.log("Jobs fetch error:", err);
    }
  };

  const displayedRequests = showAll ? requests : requests.slice(0, 3);

  const stats = useMemo(() => {
    const completed = requests.filter((req) => req.status === "DONE").length;
    const active = requests.filter((req) => ["ACCEPTED", "ACTIVE"].includes(req.status)).length;

    return [
      {
        label: "Completed",
        value: completed,
        icon: <CheckCircle size={20} />,
        color: "#4caf50",
      },
      {
        label: "Active",
        value: active,
        icon: <Clock size={20} />,
        color: "#2196f3",
      },
      {
        label: "Rating",
        value: profile?.technician_rate ?? "0",
        icon: <Star size={20} />,
        color: "#ffc107",
      },
      {
        label: "Earnings",
        value: `${profile?.totalEarnings ?? 0} EGP`,
        icon: <DollarSign size={20} />,
        color: "#9c27b0",
      },
    ];
  }, [requests, profile]);

  const handleAccept = async (jobId) => {
    try {
      await API.patch(`/jobs/${jobId}/accept`);
      fetchRequests();
    } catch (err) {
      console.log("Accept request error:", err);
    }
  };

  const handleReject = async (jobId) => {
    try {
      await API.patch(`/jobs/${jobId}/reject`);
      fetchRequests();
    } catch (err) {
      console.log("Reject request error:", err);
    }
  };

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
                <th>Actions</th>
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
                        request.status === "DONE"
                          ? "complete"
                          : request.status === "CANCELED"
                          ? "rejected"
                          : "pending"
                      }
                    >
                      {request.status}
                    </span>
                  </td>
                  <td>
                    {request.status === "PENDING" ? (
                      <div className="request-actions">
                        <button
                          className="accept-button"
                          onClick={() => handleAccept(request._id)}
                        >
                          Accept
                        </button>
                        <button
                          className="reject-button"
                          onClick={() => handleReject(request._id)}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: "#555" }}>No action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="latest-review-card">
          <h4>Latest Review</h4>
          <p style={{ color: "#888", fontSize: "14px" }}>No reviews yet.</p>
        </div>

      </div>
    </div>
  );
}

export default WorkerHomePage;