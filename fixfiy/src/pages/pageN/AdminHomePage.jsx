import React, { useState, useEffect } from "react";
import "./AdminHomePage.css";
import API from "../../services/api";

function AdminHomePage() {

  const [stats, setStats] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [showAll, setShowAll] = useState(false);

  // ✅ تحميل الداتا من الباك
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await API.get("/admin/dashboard");

        const data = res.data.data;

        console.log("DASHBOARD:", data);

        // ✅ stats
        setStats([
          { label: "Clients", value: data.users.clients },
          { label: "Technicians", value: data.users.technicians },
          { label: "Total Jobs", value: data.jobs.total },
          { label: "Revenue", value: data.revenue + " EGP" },
        ]);

      } catch (err) {
        console.log(err);
      }
    };

    const fetchJobs = async () => {
      try {
        const res = await API.get("/jobs");
        setJobs(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchDashboard();
    fetchJobs();
  }, []);

  const displayedRequests = showAll ? jobs : jobs.slice(0, 5);

  return (
    <div className="page">
      <div className="content">

        {/* ✅ Stats */}
        <div className="cards">
          {stats.map((item, index) => (
            <div className="card" key={index}>
              <h2>{item.value}</h2>
              <p>{item.label}</p>
            </div>
          ))}
        </div>

        {/* ✅ Jobs Table */}
        <div className="table-box">
          <div className="table-header">
            <h3>Recent Jobs</h3>
            <span
              className="view"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show less" : "View all"}
            </span>
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Worker</th>
                <th>Service</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {displayedRequests.map((job) => (
                <tr key={job._id}>
                  <td>{job._id.slice(-5)}</td>
                  <td>{job.clientId?.name || "-"}</td>
                  <td>{job.workerId?.name || "Not Assigned"}</td>
                  <td>{job.serviceId?.name || "-"}</td>
                  <td>
                    <span className={job.status.toLowerCase()}>
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}

export default AdminHomePage;