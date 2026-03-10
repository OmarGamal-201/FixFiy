import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Link } from 'react-router-dom'; 
import { useState } from 'react';
const TopNavbar = ({ user }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = [
    { id: 1, text: " ", time: "" },
    { id: 2, text:"", time: "" }
  ];
  return (
    <nav className="top-navbar">
      <div className="search-container">
        <Search className="search-icon" size={18} />
        <input type="text" placeholder="Search" className="search-input" />
      </div>
      <div className="user-actions">
        <div className="notification-wrapper" onClick={() => setShowNotifications(!showNotifications)}>
  <Bell className="bell-icon" size={22} />
  <span className="notification-dot"></span>
  {showNotifications && (
    <div className="notifications-dropdown">
      <div className="dropdown-header">Notifications</div>
      <div className="dropdown-body">
        {notifications.map((notif) => (
          <div key={notif.id} className="notification-item">
            <p>{notif.text}</p>
            <span>{notif.time}</span>
          </div>
        ))}
      </div>
    </div>
  )}
</div>
        
        <div className="user-info">
          <Link to="/profile" className="user-name-link" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="user-name">{user?.name || ""}</span> 
          </Link>
          <div className="user-avatar-mini"></div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;