
import React, { useState, useEffect, useMemo } from "react";
import {
  Star,
  CheckCircle,
  Clock,
  DollarSign,
  Bell,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import "./WorkerHomePage.css";
import API from "../../services/api";

function WorkerHomePage() {
  const [requests, setRequests] = useState([]);
  const [workerName, setWorkerName] = useState("");
  const [profile, setProfile] = useState(null);
  const [updating, setUpdating] = useState(false);

// =============================
// ADD TO WorkerHomePage.jsx
// =============================

// New state
const [latestReview, setLatestReview] = useState(null);

// Fetch latest worker reviews
const fetchLatestReview = async () => {
  try {
    const profileRes = await API.get("/profile/me");
    const workerId = profileRes.data.data._id;

    const reviewRes = await API.get(`/reviews/worker/${workerId}`);
    const reviews = reviewRes.data.data || [];

    if (reviews.length > 0) {
      setLatestReview(reviews[0]); // newest review
    }
  } catch (err) {
    console.log("Review fetch error:", err);
  }
};

  const fetchRequests = async () => {
    try {
      setUpdating(true);
      const res = await API.get("/jobs");
      setRequests(res.data.data || []);
    } catch (err) {
      console.log("Jobs fetch error:", err);
    } finally {
      setUpdating(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await API.get("/profile/me");
      const data = res.data.data;
      setWorkerName(data.name || "Worker");
      setProfile(data);
    } catch (err) {
      console.log("Profile fetch error:", err);
    }
  };

 useEffect(() => {
  const initializeData = async () => {
    await fetchProfile();
    await fetchRequests();
    await fetchLatestReview();
  };

  initializeData();

  const interval = setInterval(() => {
    fetchRequests();
    fetchLatestReview();
  }, 4000);

  return () => clearInterval(interval);
}, []);


  const stats = useMemo(() => {
    const completed = requests.filter((req) => req.status === "DONE").length;
    const active = requests.filter((req) =>
      ["ACCEPTED", "ACTIVE"].includes(req.status)
    ).length;
    const pending = requests.filter((req) => req.status === "PENDING").length;

    return [
      {
        label: "Completed Jobs",
        value: completed,
        icon: <CheckCircle size={22} />,
        color: "#22c55e",
      },
      {
        label: "Active Jobs",
        value: active,
        icon: <Clock size={22} />,
        color: "#3b82f6",
      },
      {
        label: "Pending Requests",
        value: pending,
        icon: <Briefcase size={22} />,
        color: "#f97316",
      },
      {
        label: "Rating",
        value: profile?.technician_rate ?? "0",
        icon: <Star size={22} />,
        color: "#facc15",
      },
      {
        label: "Earnings",
        value: `${profile?.totalEarnings ?? 0} EGP`,
        icon: <DollarSign size={22} />,
        color: "#a855f7",
      },
    ];
  }, [requests, profile]);

  const recentPending = requests.filter(
    (req) => req.status === "PENDING"
  ).slice(0, 4);

  return (
    <div className="worker-dashboard">
      {/* Hero Section */}
      <section className="hero-section">
        {/* <div>
          <span className="dashboard-tag">Professional Dashboard</span>
          <h1>Welcome back, {workerName} 👋</h1>
          <p>
            Track your performance, manage client requests, and grow your
            business efficiently.
          </p>
        </div> */}
        <div className="hero-content">
  <span className="dashboard-badge-modern">
    ✨ Elite Worker Panel
  </span>

  <h1 className="hero-title">
    Hello, <span>{workerName}</span> 🚀
  </h1>

  <p className="hero-subtitle">
    Stay ahead with smarter job management, track your earnings,
    and build a stronger professional reputation.
  </p>
{/* 
  <div className="hero-actions">
    <button className="hero-primary-btn">
      View Requests
    </button>

    <button className="hero-secondary-btn">
      My Performance
    </button>
  </div> */}
</div>

        {/* <div className="hero-side-card">
          <Bell size={22} />
          <span>{recentPending.length} New Requests</span>
        </div> */}
      </section>

      {/* Stats */}
      <section className="stats-grid">
        {stats.map((stat, index) => (
          <div className="dashboard-stat-card" key={index}>
            <div
              className="dashboard-stat-icon"
              style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div>
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Main Content */}
      <section className="dashboard-content-grid">
        {/* Requests Feed */}
        <div className="dashboard-panel large-panel">
          <div className="panel-header">
            <h3>Recent Client Requests</h3>
            {updating && <span className="live-badge">Updating...</span>}
          </div>

          <div className="request-feed">
            {recentPending.length > 0 ? (
              recentPending.map((request) => (
                <div className="request-feed-card" key={request._id}>
                  <div className="request-feed-top">
                    <div>
                      <h4>
                        {request.serviceId?.name ||
                          request.title ||
                          "Unknown Service"}
                      </h4>
                      <span>{request.clientId?.name || "Unknown Client"}</span>
                    </div>
                    <span className="pending-chip">PENDING</span>
                  </div>

                  <p>
                    {request.location
                      ? typeof request.location === "object"
                        ? "Client shared live location"
                        : request.location
                      : request.clientId?.address || "No location provided"}
                  </p>

                  <small>
                    {request.createdAt
                      ? new Date(request.createdAt).toLocaleDateString()
                      : "No date"}
                  </small>
                </div>
              ))
            ) : (
              <p className="empty-state">No pending requests currently.</p>
            )}
          </div>
        </div>

        {/* Side Insights */}
        {/* <div className="dashboard-side-column">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Performance</h3>
              <TrendingUp size={20} />
            </div>
            <div className="performance-box">
              <p>Keep accepting requests quickly to improve visibility.</p>
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
              <span>Growth Progress</span>
            </div>
          </div> */}

          <div className="latest-review-card">
  <h4>Latest Review</h4>

  {latestReview ? (
    <div className="review-content">
      <div className="review-header">
        <img
          src={
            latestReview.clientId?.profilePicture ||
            "/default-avatar.png"
          }
          alt="client"
          className="review-avatar"
        />

        <div>
          <h5>{latestReview.clientId?.name || "Client"}</h5>

          <div className="review-stars">
            {[...Array(latestReview.rating)].map((_, i) => (
              <Star
                key={i}
                size={16}
                fill="#facc15"
                color="#facc15"
              />
            ))}
          </div>
        </div>
      </div>

      <p className="review-comment">
        “{latestReview.comment || "No comment provided."}”
      </p>

      <small>
        {new Date(
          latestReview.createdAt
        ).toLocaleDateString()}
      </small>
    </div>
  ) : (
    <p style={{ color: "#64748b" }}>
      No reviews yet.
    </p>
  )}
</div>
        {/* </div> */}
      </section>
    </div>
  );
}

export default WorkerHomePage;

