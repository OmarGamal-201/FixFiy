import React from "react";
import { Mail, Phone, MapPin, Settings, LogOut, Search, Bell } from "lucide-react";
import "./client.css";

const ClientProfilePage = () => {
  const frequentlyServices = [
    { name: "Electricity", count: 15 },
    { name: "Plumber", count: 10 },
    { name: "Carpenter", count: 9 },
    { name: "Painter", count: 1 },
  ];

  return (
    <div className="client-profile-container">
     
      <div className="profile-header-section">
        <div className="blue-cover"></div>
        <div className="profile-avatar-wrapper">
          <div className="avatar-circle">
             <span className="online-status"></span>
          </div>
          <div className="profile-name-info">
            <h2>Client Name</h2>
            <button className="edit-profile-btn">Edit profile</button>
          </div>
        </div>
      </div>

   
      <div className="profile-content-grid">
        
        
        <div className="info-card">
          <h4>Info</h4>
          <div className="info-item">
            <Mail size={18} color="#475569" />
            <span>ClientName@example.com</span>
          </div>
          <div className="info-item">
            <Phone size={18} color="#475569" />
            <span>+12345678900</span>
          </div>
          <div className="info-item">
            <MapPin size={18} color="#ef4444" />
            <span>Lives in Regine, city, country</span>
          </div>
        </div>

    
        <div className="services-card">
          <h4>Frequently Services</h4>
          <ul className="services-list">
            {frequentlyServices.map((service, index) => (
              <li key={index} className="service-row">
                <span className="service-name">{service.name}</span>
                <span className="service-count">{service.count} Requests</span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default ClientProfilePage;