
import React, { useState, useEffect } from "react";
import "./AdminHomePage.css";

function AdminHomePage() {
  const [stats, setStats] = useState([
    { label: "New Workers", value: 20 },
    { label: "New Clients", value: 20 },
    { label: "Requests", value: "5K" },
    { label: "Active Jobs", value: 15 },
  ]);

  const [showAll, setShowAll] = useState(false);

  const allRequests = [
    { id: 2234, client: "Ahmed", worker: "Samy", service: "Plumbing", status: "complete" },
    { id: 2235, client: "Omer", worker: "Samir", service: "Painting", status: "pending" },
    { id: 2236, client: "Mahmoud", worker: "Mahmoud", service: "Painting", status: "complete" },
    { id: 2237, client: "Ali", worker: "Hassan", service: "Cleaning", status: "pending" },
    { id: 2238, client: "Zaid", worker: "Mostafa", service: "Electricity", status: "complete" },
  ];

  const displayedRequests = showAll ? allRequests : allRequests.slice(0, 3);

  return (
    <div className="page">
      <div className="content">
        <div className="cards">
          {stats.map((item, index) => (
            <div className="card" key={index}>
              <h2>{item.value}</h2>
              <p>{item.label}</p>
            </div>
          ))}
        </div>

        <div className="table-box">
          <div className="table-header">
            <h3>Recent Requests</h3>
            <span 
              className="view" 
              onClick={() => setShowAll(!showAll)}
              style={{ cursor: 'pointer', color: '#1976d2', fontWeight: 'bold' }}
            >
              {showAll ? "Show less" : "View all"}
            </span>
          </div>

          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Client Name</th>
                <th>Worker Name</th>
                <th>Service</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{request.client}</td>
                  <td>{request.worker}</td>
                  <td>{request.service}</td>
                  <td>
                    <span className={request.status === "complete" ? "complete" : "pending"}>
                      {request.status}
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