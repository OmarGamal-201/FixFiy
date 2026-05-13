
import React from "react";
import { useState, useEffect, useMemo } from "react";
import { Star, CheckCircle, Clock, DollarSign } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "./WorkerHomePage.css";
import API from "../../services/api";

function WorkerHomePage() {
  const [showAll, setShowAll] = useState(false);
  const [requests, setRequests] = useState([]);
  const [workerName, setWorkerName] = useState("");
  const [profile, setProfile] = useState(null);
  const [updating, setUpdating] = useState(false);
  const location = useLocation();
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const profileRes = await API.get("/profile/me");
  //       const profileData = profileRes.data.data;
  //       setWorkerName(profileData.name || "Worker");
  //       setProfile(profileData);

  //       const requestsRes = await API.get("/jobs");
  //       setRequests(requestsRes.data.data || []);
  //     } catch (err) {
  //       console.log("Fetch error:", err);
  //     }
  //   };

  //   fetchData();
  // }, []);


  useEffect(() => {
  // const fetchRequests = async () => {
  //   try {
  //     const res = await API.get("/jobs");
  //     setRequests(res.data.data || []);
  //   } catch (err) {
  //     console.log("Jobs fetch error:", err);
  //   }
  // };
  const fetchRequests = async () => {
  try {
    setUpdating(true);
    const res = await API.get("/jobs");
    setRequests(res.data.data || []);
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
      console.log("Profile error:", err);
    }
  };

  // أول تحميل
  fetchProfile();
  fetchRequests();

  // 🔥 polling كل 4 ثواني
  const interval = setInterval(() => {
    fetchRequests();
  }, 4000);

  // cleanup
  return () => clearInterval(interval);
}, []);

  // const fetchRequests = async () => {
  //   try {
  //     const res = await API.get("/jobs");
  //     setRequests(res.data.data || []);
  //   } catch (err) {
  //     console.log("Jobs fetch error:", err);
  //   }
  // };

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

  // const handleAccept = async (jobId) => {
  //   try {
  //     await API.patch(`/jobs/${jobId}/accept`);
  //     fetchRequests();
  //   } catch (err) {
  //     console.log("Accept request error:", err);
  //   }
  // };

  const handleAccept = async (request) => {
    // التأكد من أن العميل دفع العربون أولاً
    if (request.paymentStatus !== "DEPOSIT_PAID") {
      alert("⚠️ لا يمكنك قبول الطلب بعد.. يجب على العميل دفع العربون أولاً.");
      return;
    }

    try {
      await API.patch(`/jobs/${request._id}/accept`);
      // تحديث القائمة فوراً بعد القبول
      fetchRequests();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "حدث خطأ أثناء قبول الطلب";
      alert(errorMsg);
      console.log("Accept request error:", err);
    }
  };

  const handleReject = async (request) => {
    try {
      await API.patch(`/jobs/${request._id}/reject`);
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
            {updating && <p style={{ color: "gray" }}>Updating requests...</p>}
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
                  <td>{request.serviceId?.name || request.title || "Unknown Service"}</td>
                  <td>{request.location ? (
    /* لو العميل بعت إحداثيات (Object) */
    typeof request.location === 'object' && request.location.lat ? (
      <a 
        href={`https://www.google.com/maps?q=${request.location.lat},${request.location.lng}`} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ color: "#1976d2", fontWeight: "bold" }}
      >
        📍 لوكيشن العميل
      </a>
    ) : (
      /* لو العميل كاتب عنوان نصي */
      <span>{request.location}</span>
    )
  ) : (
    /* fallback في حال عدم وجود لوكيشن في الطلب، نجيبه من ملف العميل */
    <span>{request.clientId?.address || "غير محدد"}</span>
  )}</td>
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
                        {/* <button
                          className="accept-button"
                          onClick={() => handleAccept(request._id)}
                        >
                          Accept
                        </button> */}
                        <button
  className="accept-button"
  onClick={() => handleAccept(request)}
  // الزرار هيكون مطفي (Disabled) لو الدفع متمش
  disabled={request.paymentStatus !== "DEPOSIT_PAID"}
  style={{
    backgroundColor: request.paymentStatus !== "DEPOSIT_PAID" ? "#ccc" : "#4caf50",
    cursor: request.paymentStatus !== "DEPOSIT_PAID" ? "not-allowed" : "pointer",
    opacity: request.paymentStatus !== "DEPOSIT_PAID" ? 0.7 : 1
  }}
>
  {request.paymentStatus !== "DEPOSIT_PAID" ? "Waiting Deposit" : "Accept"}
</button>
                        <button
                          className="reject-button" style={{ backgroundColor: "#f44336" }}
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