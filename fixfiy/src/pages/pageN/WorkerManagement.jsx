
import React, { useState, useEffect } from 'react';
import { CheckCircle, ShieldAlert, Trash2, UserCheck } from 'lucide-react';
import API from "../../services/api";
import './WorkerManagement.css'; // Ensure this matches the Client style patterns

const WorkerManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showAll, setShowAll] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);

  const showNotification = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/admin/users?role=technician");
      setWorkers(res.data.data || []);
    } catch (err) {
      setError("Unable to load workers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const verifyWorker = async (id) => {
    try {
      setVerifyingId(id);
      const res = await API.patch(`/admin/workers/${id}/verify`);
      const verifiedWorker = res.data.data;

      setWorkers((prev) =>
        prev.map((worker) =>
          worker._id === id
            ? { ...worker, isVerified: verifiedWorker?.isVerified ?? true }
            : worker
        )
      );
      showNotification("success", "Worker verified successfully");
    } catch (err) {
      showNotification("error", err.response?.data?.message || "Verification failed");
    } finally {
      setVerifyingId(null);
    }
  };

  const displayedWorkers = showAll ? workers : workers.slice(0, 5);

  if (loading) {
    return (
      <div className="management-page">
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading workers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="management-page">
      <div className="management-content">
        {/* Header Section */}
        <div className="management-header">
          <div className="header-top">
            <div className="header-icon">🛠️</div>
            <div className="header-info">
              <h1>Worker Management</h1>
              <p>Verify and manage professional technicians</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-box">
              <span className="stat-value">{workers.length}</span>
              <span className="stat-label">Total Workers</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{workers.filter(w => w.isVerified).length}</span>
              <span className="stat-label">Verified</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{workers.filter(w => !w.isVerified).length}</span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
        </div>

        {/* Notification Message */}
        {message.text && (
          <div className={`notification notification-${message.type}`}>
            <span className="notification-icon">{message.type === "success" ? "✓" : "⚠"}</span>
            <p>{message.text}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}

        {/* Empty State */}
        {workers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👷</div>
            <h3>No Workers Found</h3>
            <p>There are currently no technicians in the system</p>
          </div>
        ) : (
          <>
            {/* Table Card */}
            <div className="table-card">
              <div className="table-header">
                <h2>Technician List</h2>
                <span className="record-count">{displayedWorkers.length} of {workers.length}</span>
              </div>
              <div className="table-wrapper">
                <table className="clients-table"> {/* Using same class for consistent CSS */}
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Service</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedWorkers.map((worker) => (
                      <tr key={worker._id}>
                        <td className="name-cell">
                          <div className="client-avatar worker-avatar">{worker.name.charAt(0)}</div>
                          <div>
                            <div className="name-text">{worker.name}</div>
                            <div className="email-subtext">{worker.email}</div>
                          </div>
                        </td>
                        <td className="service-cell">
                           <span className="specialty-tag">{worker.specialties || "General"}</span>
                        </td>
                        <td className="location-cell">
                          {worker.address?.city ? `${worker.address.city}, ${worker.address.governorate}` : "N/A"}
                        </td>
                        <td>
                          <span className={`status-badge ${worker.isVerified ? "status-active" : "status-pending"}`}>
                            {worker.isVerified ? "VERIFIED" : "PENDING"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {!worker.isVerified ? (
                              <button
                                className="action-btn btn-restore" // Reusing green color
                                onClick={() => verifyWorker(worker._id)}
                                disabled={verifyingId === worker._id}
                              >
                                {verifyingId === worker._id ? "..." : "✓ Verify"}
                              </button>
                            ) : (
                              <button
                                className="action-btn btn-suspend" // Reusing red color
                                onClick={() => {/* handle delete logic */}}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Show More/Less Toggle */}
            {workers.length > 5 && (
              <div className="view-toggle-container">
                <button
                  className="toggle-btn"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Show Less" : "View All Workers"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WorkerManagement;