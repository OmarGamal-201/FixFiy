

import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Users } from 'lucide-react';
import API from "../../services/api";
import './ClientManagementPage.css';

const ClientManagementPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showAll, setShowAll] = useState(false);

  const showNotification = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await API.get("/admin/users?role=client");
        setClients(res.data.data || []);
      } catch (err) {
        const errorMsg = err.response?.data?.message || "Failed to load clients";
        setError(errorMsg);
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const suspendUser = async (id) => {
    try {
      await API.patch(`/admin/users/${id}/suspend`);
      setClients(prev =>
        prev.map(c => c._id === id ? { ...c, status: "SUSPENDED" } : c)
      );
      showNotification("success", "Client suspended successfully");
    } catch (err) {
      showNotification("error", "Failed to suspend client");
    }
  };

  const restoreUser = async (id) => {
    try {
      await API.patch(`/admin/users/${id}/restore`);
      setClients(prev =>
        prev.map(c => c._id === id ? { ...c, status: "ACTIVE" } : c)
      );
      showNotification("success", "Client restored successfully");
    } catch (err) {
      showNotification("error", "Failed to restore client");
    }
  };

  const displayedClients = showAll ? clients : clients.slice(0, 5);

  if (loading) {
    return (
      <div className="management-page">
        <div className="loading-container">
          <div className="spinner-large"></div>
          <p>Loading clients...</p>
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
            <div className="header-icon">👥</div>
            <div className="header-info">
              <h1>Client Management</h1>
              <p>Manage and monitor all client accounts</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-box">
              <span className="stat-value">{clients.length}</span>
              <span className="stat-label">Total Clients</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{clients.filter(c => c.status === "ACTIVE").length}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{clients.filter(c => c.status === "SUSPENDED").length}</span>
              <span className="stat-label">Suspended</span>
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
        {clients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No Clients Found</h3>
            <p>There are currently no clients in the system</p>
          </div>
        ) : (
          <>
            {/* Table Card */}
            <div className="table-card">
              <div className="table-header">
                <h2>Client List</h2>
                <span className="record-count">{displayedClients.length} of {clients.length}</span>
              </div>
              <div className="table-wrapper">
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedClients.map((client) => (
                      <tr key={client._id}>
                        <td className="name-cell">
                          <div className="client-avatar">{client.name.charAt(0)}</div>
                          <span>{client.name}</span>
                        </td>
                        <td className="email-cell">{client.email}</td>
                        <td className="location-cell">
                          {client.address?.city ? `${client.address.city}, ${client.address.governorate}` : "N/A"}
                        </td>
                        <td>
                          <span className={`status-badge status-${client.status?.toLowerCase() || "active"}`}>
                            {client.status || "ACTIVE"}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {client.status === "SUSPENDED" ? (
                              <button
                                className="action-btn btn-restore"
                                onClick={() => restoreUser(client._id)}
                                title="Restore client"
                              >
                                ↻ Restore
                              </button>
                            ) : (
                              <button
                                className="action-btn btn-suspend"
                                onClick={() => suspendUser(client._id)}
                                title="Suspend client"
                              >
                                ⊘ Suspend
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
            {clients.length > 5 && (
              <div className="view-toggle-container">
                <button
                  className="toggle-btn"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Show Less" : "View All Clients"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClientManagementPage;