


import React, { useState, useEffect } from "react";
import { Briefcase, Users, HardHat, TrendingUp, ChevronRight, Layout } from "lucide-react";
import API from "../../services/api";
import "./AdminHomePage.css";

function AdminHomePage() {
  const [stats, setStats] = useState({
    clients: 0,
    technicians: 0,
    totalJobs: 0,
    revenue: 0
  });
  const [jobs, setJobs] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashRes, jobsRes] = await Promise.all([
          API.get("/admin/dashboard"),
          API.get("/jobs")
        ]);

        const dashData = dashRes.data.data;
        setStats({
          clients: dashData.users.clients,
          technicians: dashData.users.technicians,
          totalJobs: dashData.jobs.total,
          revenue: dashData.revenue
        });

        setJobs(jobsRes.data.data || []);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayedRequests = showAll ? jobs : jobs.slice(0, 5);

  if (loading) {
    return (
      <div className="management-page">
        <div className="loading-container"><div className="spinner-large"></div></div>
      </div>
    );
  }

  return (
    <div className="management-page">
      <div className="management-content">
        
        {/* Header Section - Matching Worker Management Design */}
        <div className="management-header">
          <div className="header-top">
            <div className="header-icon">📊</div>
            <div className="header-info">
              <h1>Admin Dashboard</h1>
              <p>Overview of system performance and recent activities</p>
            </div>
          </div>
          
          <div className="header-stats">
            <div className="stat-box">
              <div className="stat-icon-small blue"><Users size={16} /></div>
              <span className="stat-value">{stats.clients}</span>
              <span className="stat-label">Clients</span>
            </div>
            <div className="stat-box">
              <div className="stat-icon-small orange"><HardHat size={16} /></div>
              <span className="stat-value">{stats.technicians}</span>
              <span className="stat-label">Technicians</span>
            </div>
            <div className="stat-box">
              <div className="stat-icon-small green"><Briefcase size={16} /></div>
              <span className="stat-value">{stats.totalJobs}</span>
              <span className="stat-label">Total Jobs</span>
            </div>
            <div className="stat-box">
              <div className="stat-icon-small purple"><TrendingUp size={16} /></div>
              <span className="stat-value">{stats.revenue.toLocaleString()} EGP</span>
              <span className="stat-label">Revenue</span>
            </div>
          </div>
        </div>

        {/* Main Content: Recent Jobs Table */}
        <div className="table-card">
          <div className="table-header">
            <div className="table-title">
              <h2>Recent Service Requests</h2>
              <span className="record-count">Showing {displayedRequests.length} latest jobs</span>
            </div>
            <button 
              className="toggle-btn-secondary" 
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Recent" : "View All"}
            </button>
          </div>

          <div className="table-wrapper">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>Client</th>
                  <th>Technician</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedRequests.map((job) => (
                  <tr key={job._id}>
                    <td className="id-cell">#{job._id.slice(-6).toUpperCase()}</td>
                    <td className="name-cell">
                        <div className="name-text">{job.clientId?.name || "Guest"}</div>
                        <div className="email-subtext">Client</div>
                    </td>
                    <td>
                      <div className="worker-info-cell">
                        <span className={job.workerId ? "worker-name" : "unassigned"}>
                          {job.workerId?.name || "Pending Assignment"}
                        </span>
                      </div>
                    </td>
                    <td>
                        <span className="specialty-tag">
                            {job.serviceId?.name || "Standard Service"}
                        </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${job.status.toLowerCase()}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>
                        <button className="action-btn btn-edit">
                            <ChevronRight size={14} /> Details
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {jobs.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No Jobs Found</h3>
            <p>There are no active or past service requests in the system.</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminHomePage;