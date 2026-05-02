

import React, { useState, useEffect, useCallback } from "react";
import { Search, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import API, {
  getMyNotifications,
  markNotificationRead,
  adminSearch,
  getUserProfile,
} from "../services/api";

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

const TopNavbar = ({ user }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await getUserProfile();
        setCurrentUser(res.data.data);
      } catch (err) {
        console.log("Error fetching user data:", err);
        setCurrentUser(user);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUserData();
  }, [user]);

  // FETCH NOTIFICATIONS Logic... (موجود كما هو في كودك)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getMyNotifications();
        setNotifications(res.data.data || []);
      } catch (err) { console.log(err); }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const getProfileImageUrl = (image) => {
    if (!image) return null;
    return image.startsWith("http") ? image : `${API.defaults.baseURL}${image}`;
  };

  const profileImageUrl = getProfileImageUrl(currentUser?.profileImage);

  return (
    <nav className="top-navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
      
      {/* SEARCH SECTION */}
      <div className="search-container">
        {/* كود البحث كما هو... */}
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          value={query}
          onChange={(e) => { setQuery(e.target.value); /* debouncedSearch logic */ }}
        />
      </div>

      <div className="user-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* NOTIFICATIONS */}
        <div className="user-actions">
        <div
          className="notification-wrapper"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell className="bell-icon" size={22} />

          {/*  unread indicator */}
          {notifications.some((n) => !n.read) && (
            <span className="notification-dot"></span>
          )}

          {showNotifications && (
            <div className="notifications-dropdown">

              <div className="dropdown-header">
                Notifications
              </div>

              <div className="dropdown-body">
                {notifications.length === 0 ? (
                  <p>No notifications</p>
                ) : (
               
                  notifications.map((notif) => (
                    <div
                    key={notif._id}
              className="notification-item"
                                onClick={() => handleRead(notif._id)}
                  style={{
              fontWeight: notif.isRead ? "normal" : "bold",
          cursor: "pointer",
                              }}
                    >
                <p>{notif.title}</p>
        <p style={{ fontSize: "12px", color: "#666" }}>
        
      {notif.message}
      </p>
      <span style={{ fontSize: "10px" }}>
           {new Date(notif.createdAt).toLocaleString()}
               </span>
                </div>
                ))
                )}
              </div>
              

            </div>
          )}
        </div>

        {/* USER PROFILE SECTION (Image + Name) */}
        <div className="user-info-wrapper">
          {loadingUser ? (
            <span>Loading...</span>
          ) : (
            <Link
              to={currentUser?.role === "worker" ? "/worker-profile" : "/client-profile"}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                textDecoration: 'none', 
                color: 'inherit' 
              }}
            >
              {/* الاسم بجانب الصورة */}
              <span className="user-name" style={{ fontWeight: '600', fontSize: '14px' }}>
                {currentUser?.name}
              </span>

              {/* دائرة الصورة أو الحرف الأول */}
              <div 
                className="user-avatar-mini"
                style={{
                  backgroundImage: profileImageUrl ? `url(${profileImageUrl})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundColor: profileImageUrl ? "transparent" : "#3b82f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  border: "1px solid #ddd",
                  flexShrink: 0,
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: "bold"
                }}
              >
                {!profileImageUrl && currentUser?.name?.charAt(0).toUpperCase()}
              </div>
            </Link>
          )}
        </div>
      </div>
      </div>
    </nav>
  );
};

export default TopNavbar;






