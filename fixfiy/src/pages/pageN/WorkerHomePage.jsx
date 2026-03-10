
import React from "react";
import { useState } from "react";
import { Search, Star, CheckCircle, Clock, DollarSign} from "lucide-react";
import "./WorkerHomePage.css";

function WorkerHomePage() {
  const [showAll, setShowAll] = useState(false);
  const stats = [
    { label: "Completed", value: "10", icon: <CheckCircle size={20} />, color: "#4caf50" },
    { label: "Active", value: "3", icon: <Clock size={20} />, color: "#2196f3" },
    { label: "Rating", value: "4.5", icon: <Star size={20} />, color: "#ffc107" },
    { label: "Earnings", value: "$230", icon: <DollarSign size={20} />, color: "#9c27b0" },
  ];
  const allRequests = [
    { id: 2234, client: "Ahmed", service: "Plumbing", status: "complete",location:"Qena",date:"" },
    { id: 2235, client: "Omer",service: "Painting", status: "pending",location:"Qena",date:""  },
    { id: 2236, client: "Mahmoud", service: "Painting", status: "complete",location:"Qena" ,date:"" },
    { id: 2237, client: "Ali",service: "Cleaning", status: "pending",location:"Qena",date:""  },
    { id: 2238, client: "Zaid",  service: "Electricity", status: "complete",location:"Qena" ,date:"" },
  ];
  const displayedRequests = showAll ? allRequests : allRequests.slice(0, 3);
  return (
    <div className="worker-home-container">
     
      <div className="welcome-banner">
        <div className="welcome-text">
          <h3>Hello, Worker Name !</h3>
          <p>Are you ready to new requests?</p>
         
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
              style={{ cursor: 'pointer', color: '#1976d2', fontWeight: 'bold' }}
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
                <tr key={request.id}>
                  <td>{request.id}</td>
                  <td>{request.client}</td>
                  <td>{request.service}</td>
                  <td>{request.location}</td>
                  <td>{request.date}</td>
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

      
        <div className="latest-review-card">
          <h4>Latest Review</h4>
          <div className="review-content">
            <div className="review-user">
              <div className="user-avatar-small"></div>
              <div>
                <p className="user-name">Client Name</p>
                <div className="user-rating">{[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#ffc107" color="#ffc107" />
                  ))}</div>
              </div>
            </div>
            <p className="review-text">"Great job done in time, very professional and polite worker. Highly recommended!"</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkerHomePage;