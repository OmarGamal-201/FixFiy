// import React, { useState, useEffect } from "react";
// import { Search, Bell } from "lucide-react";
// import { Link } from "react-router-dom";


// const TopNavbar = ({ user }) => {
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [query, setQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);

//   //  Fetch notifications
//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const res = await API.get("/notifications");
//         setNotifications(res.data.data || []);
//       } catch (err) {
//         console.log(err);
//       }
//     };

//     fetchNotifications();

//     // optional: refresh every 10 sec
//     const interval = setInterval(fetchNotifications, 10000);

//     return () => clearInterval(interval);
//   }, []);

//   //  Search function
//   const handleSearch = async (value) => {
//     setQuery(value);

//     if (value.trim() === "") {
//       setSearchResults([]);
//       return;
//     }

//     try {
//       const res = await API.get(`/admin/search?q=${value}`);
//       setSearchResults(res.data.data || []);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   return (
//     <nav className="top-navbar">

//       {/* SEARCH */}
//       <div className="search-container">
//         <Search className="search-icon" size={18} />

//         <input
//           type="text"
//           placeholder="Search workers, clients, services..."
//           className="search-input"
//           value={query}
//           onChange={(e) => handleSearch(e.target.value)}
//         />

//         {/* search dropdown */}
//         {searchResults.length > 0 && (
//           <div className="search-dropdown">
//             {searchResults.map((item) => (
//               <div key={item._id} className="search-item">
//                 {item.name}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/*  NOTIFICATIONS */}
//       <div className="user-actions">

//         <div
//           className="notification-wrapper"
//           onClick={() => setShowNotifications(!showNotifications)}
//         >
//           <Bell className="bell-icon" size={22} />

//           {notifications.length > 0 && (
//             <span className="notification-dot"></span>
//           )}

//           {showNotifications && (
//             <div className="notifications-dropdown">

//               <div className="dropdown-header">
//                 Notifications
//               </div>

//               <div className="dropdown-body">
//                 {notifications.length === 0 ? (
//                   <p>No notifications</p>
//                 ) : (
//                   notifications.map((notif) => (
//                     <div key={notif._id} className="notification-item">
//                       <p>{notif.text}</p>
//                       <span>{notif.time || "now"}</span>
//                     </div>
//                   ))
//                 )}
//               </div>

//             </div>
//           )}
//         </div>

//         {/*  USER INFO */}
//         <div className="user-info">

//           {/*  admin بدون profile */}
//           {user?.role !== "admin" ? (
//             <Link
//               to="/profile"
//               className="user-name-link"
//               style={{ textDecoration: "none", color: "inherit" }}
//             >
//               <span className="user-name">{user?.name}</span>
//             </Link>
//           ) : (
//             <span className="user-name">{user?.name}</span>
//           )}

//           <div className="user-avatar-mini"></div>
//         </div>

//       </div>
//     </nav>
//   );
// };

// export default TopNavbar;

import React, { useState, useEffect } from "react";
import { Search, Bell } from "lucide-react";
import { Link } from "react-router-dom";
//import API from "../../services/api";
import {
  getMyNotifications,
  markNotificationRead,
  adminSearch,
} from "../services/api";

const TopNavbar = ({ user }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // ======================
  // FETCH NOTIFICATIONS
  // ======================
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getMyNotifications();
        setNotifications(res.data.data || []);
      } catch (err) {
        console.log(err);
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // ======================
  // MARK AS READ
  // ======================
  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  // ======================
  // SEARCH
  // ======================
  const handleSearch = async (value) => {
    setQuery(value);

    if (value.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      const res = await adminSearch(value);
      setSearchResults(res.data.data || []);
    } catch (err) {
      console.log(err);
    }console.log(res.data);
  };

  return (
    <nav className="top-navbar">

      {/* SEARCH */}
      <div className="search-container">
        <Search className="search-icon" size={18} />

        <input
          type="text"
          placeholder="Search workers, clients, services..."
          className="search-input"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />

        {searchResults.length > 0 && (
          <div className="search-dropdown">
            {searchResults.map((item) => (
              <div key={item._id} className="search-item">
                {item.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NOTIFICATIONS */}
      <div className="user-actions">
        <div
          className="notification-wrapper"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell className="bell-icon" size={22} />

          {/* 🔴 unread indicator */}
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
                  // notifications.map((notif) => (
                  //   <div
                  //     key={notif._id}
                  //     className="notification-item"
                  //     onClick={() => handleRead(notif._id)}
                  //     style={{
                  //       fontWeight: notif.read ? "normal" : "bold",
                  //       cursor: "pointer",
                  //     }}
                  //   >
                  //     <p>{notif.text}</p>
                  //     <span>{notif.time || "now"}</span>
                  //   </div>
                  // ))
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

        {/* USER */}
        <div className="user-info">
          {user?.role !== "admin" ? (
            <Link
              to="/profile"
              className="user-name-link"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <span className="user-name">{user?.name}</span>
            </Link>
          ) : (
            <span className="user-name">{user?.name}</span>
          )}

          <div className="user-avatar-mini"></div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;