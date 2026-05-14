

// import React, { useState, useEffect, useCallback } from "react";
// import { Search, Bell } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import API, {
//   getMyNotifications,
//   markNotificationRead,
//   adminSearch,
//   getUserProfile,
// } from "../services/api";

// const debounce = (func, delay) => {
//   let timeoutId;
//   return (...args) => {
//     clearTimeout(timeoutId);
//     timeoutId = setTimeout(() => func.apply(null, args), delay);
//   };
// };

// const TopNavbar = ({ user }) => {
//   const navigate = useNavigate();
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [query, setQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [searchError, setSearchError] = useState("");
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loadingUser, setLoadingUser] = useState(true);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const res = await getUserProfile();
//         setCurrentUser(res.data.data);
//       } catch (err) {
//         console.log("Error fetching user data:", err);
//         setCurrentUser(user);
//       } finally {
//         setLoadingUser(false);
//       }
//     };
//     fetchUserData();
//   }, [user]);

//   // FETCH NOTIFICATIONS Logic... (موجود كما هو في كودك)
//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const res = await getMyNotifications();
//         setNotifications(res.data.data || []);
//       } catch (err) { console.log(err); }
//     };
//     fetchNotifications();
//     const interval = setInterval(fetchNotifications, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   const getProfileImageUrl = (image) => {
//     if (!image) return null;
//     return image.startsWith("http") ? image : `${API.defaults.baseURL}${image}`;
//   };

//   const profileImageUrl = getProfileImageUrl(currentUser?.profileImage);

//   return (
//     <nav className="top-navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
      
//       {/* SEARCH SECTION */}
//       <div className="search-container">
//         {/* كود البحث كما هو... */}
//         <Search className="search-icon" size={18} />
//         <input
//           type="text"
//           placeholder="Search..."
//           className="search-input"
//           value={query}
//           onChange={(e) => { setQuery(e.target.value); /* debouncedSearch logic */ }}
//         />
//       </div>

//       <div className="user-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
//         {/* NOTIFICATIONS */}
//         <div className="user-actions">
//         <div
//           className="notification-wrapper"
//           onClick={() => setShowNotifications(!showNotifications)}
//         >
//           <Bell className="bell-icon" size={22} />

//           {/*  unread indicator */}
//           {notifications.some((n) => !n.read) && (
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
//                     <div
//                     key={notif._id}
//               className="notification-item"
//                                 onClick={() => handleRead(notif._id)}
//                   style={{
//               fontWeight: notif.isRead ? "normal" : "bold",
//           cursor: "pointer",
//                               }}
//                     >
//                 <p>{notif.title}</p>
//         <p style={{ fontSize: "12px", color: "#666" }}>
        
//       {notif.message}
//       </p>
//       <span style={{ fontSize: "10px" }}>
//            {new Date(notif.createdAt).toLocaleString()}
//                </span>
//                 </div>
//                 ))
//                 )}
//               </div>
              

//             </div>
//           )}
//         </div>

//         {/* USER PROFILE SECTION (Image + Name) */}
//         <div className="user-info-wrapper">
//           {loadingUser ? (
//             <span>Loading...</span>
//           ) : (
//             <Link
//               to={currentUser?.role === "technician" ? "/worker-profile" : "/client-profile"}
//               style={{ 
//                 display: 'flex', 
//                 alignItems: 'center', 
//                 gap: '12px', 
//                 textDecoration: 'none', 
//                 color: 'inherit' 
//               }}
//             >
//               {/* الاسم بجانب الصورة */}
//               <span className="user-name" style={{ fontWeight: '600', fontSize: '14px' }}>
//                 {currentUser?.name}
//               </span>

//               {/* دائرة الصورة أو الحرف الأول */}
//               <div 
//                 className="user-avatar-mini"
//                 style={{
//                   backgroundImage: profileImageUrl ? `url(${profileImageUrl})` : "none",
//                   backgroundSize: "cover",
//                   backgroundPosition: "center",
//                   backgroundColor: profileImageUrl ? "transparent" : "#3b82f6",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   borderRadius: "50%",
//                   width: "40px",
//                   height: "40px",
//                   border: "1px solid #ddd",
//                   flexShrink: 0,
//                   color: "#fff",
//                   fontSize: "15px",
//                   fontWeight: "bold"
//                 }}
//               >
//                 {!profileImageUrl && currentUser?.name?.charAt(0).toUpperCase()}
//               </div>
//             </Link>
//           )}
//         </div>
//       </div>
//       </div>
//     </nav>
//   );
// };

// export default TopNavbar;
















import React, { useState, useEffect, useCallback } from "react";
import { Search, Bell } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import API, {
  getMyNotifications,
  markNotificationRead,
  adminSearch,
  getUserProfile,
} from "../services/api";

const TopNavbar = ({ user }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [query, setQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
const [allData, setAllData] = useState([]); // البيانات الكاملة من السيرفر
const [filteredResults, setFilteredResults] = useState([]); // النتائج المفلترة اللي هتظهر
  
// --- 1. دالة جلب البيانات (عزلناها عشان نعرف نناديها أكتر من مرة) ---
  const fetchUserData = async () => {
    try {
      const res = await getUserProfile();
      // ملاحظة: اتأكدي إن الـ Backend بيرجع الصورة في profilePicture أو profileImage
      setCurrentUser(res.data.data || res.data);
    } catch (err) {
      console.log("Error fetching user data:", err);
      setCurrentUser(user);
    } finally {
      setLoadingUser(false);
    }
  };
useEffect(() => {
  if (query.trim() === "") {
    setFilteredResults([]);
  } else {
    // هنا بنعمل فلتر على البيانات اللي معانا فعلاً
    const results = allData.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.specialty?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredResults(results);
  }
}, [query, allData]);
const handleSearchSubmit = () => {
  if (query.trim() !== "") {
    // لو فيه نتائج مفلترة، ممكن نبرمج البرنامج يروح لأول نتيجة فوراً
    if (filteredResults.length > 1) {
       const firstResult = filteredResults[0];
       navigate(firstResult.role === 'technician' ? `/worker/${firstResult._id}` : `/client-profile`);
       setQuery(""); // تصفية البحث
    } else {
       // أو ممكن توديه لصفحة بحث مخصصة لو حابة
       console.log("Searching for:", query);
    }
  }
};
  useEffect(() => {
    fetchUserData();

    // --- 2. ADDED: الاستماع لحدث تحديث البروفايل ---
    const handleProfileUpdate = () => {
      fetchUserData(); // لما الصفحة التانية تبعت إشارة، الـ Navbar يحدث نفسه
    };

    window.addEventListener("profileUpdate", handleProfileUpdate);
    
    // تنظيف الـ Listener عند إغلاق الكومبوننت
    return () => {
      window.removeEventListener("profileUpdate", handleProfileUpdate);
    };
  }, [user]);

  // --- باقي الـ useEffect الخاص بالـ Notifications كما هو ---
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

  // --- 3. تصحيح دالة الصورة عشان تتماشى مع الـ Backend ---
  const getProfileImageUrl = (userData) => {
    // الـ Backend بيبعت profilePicture كـ Array
    const imgObj = userData?.profilePicture?.[0] || userData?.profileImage;
    const path = imgObj?.url || imgObj; // لو أوبجيكت خد الـ url لو سترينج خده هو
    
    if (!path) return null;
    return path.startsWith("http") ? path : `${API.defaults.baseURL}/${path}`;
  };

  const profileImageUrl = getProfileImageUrl(currentUser);

  return (
    <nav className="top-navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
      
      {/* SEARCH SECTION */}
      {/* <div className="search-container">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div> */}
{/* SEARCH SECTION */}
<div className="search-container">
  {/* أضفنا form هنا وهندلنا الـ onSubmit */}
  <form 
    onSubmit={(e) => {
      e.preventDefault(); // منع الصفحة من التحميل
      handleSearchSubmit(); // دالة تنفيذ البحث
    }} 
    style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '8px', padding: '2px 10px' }}
  >
    <input
      type="text"
      placeholder="Search..."
      className="search-input"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      style={{ border: 'none', background: 'transparent', outline: 'none', padding: '8px' }}
    />
    
    {/* الزرار اللي طلبتيه - هو نفسه أيقونة البحث بس قابلة للضغط */}
    {/* <button 
      type="submit" 
      style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
    >
      <Search className="search-icon" size={18} color="#3b82f6" />
    </button> */}
  </form>

  {/* قائمة النتائج (map) اللي عملناها قبل كده بتفضل زي ما هي تحت الـ form */}
</div>

      <div className="user-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* NOTIFICATIONS */}
        <div 
          className="notification-wrapper"
          onClick={() => setShowNotifications(!showNotifications)}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <Bell className="bell-icon" size={22} />
          {notifications.some((n) => !n.read) && (
            <span className="notification-dot" style={{ position: 'absolute', top: 0, right: 0, background: 'red', borderRadius: '50%', width: '8px', height: '8px' }}></span>
          )}

          {showNotifications && (
            <div className="notifications-dropdown" style={{ position: 'absolute', right: 0, top: '30px', background: 'white', border: '1px solid #ddd', zIndex: 100, width: '250px' }}>
               <div className="dropdown-header" style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Notifications</div>
               <div className="dropdown-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? <p style={{ padding: '10px' }}>No notifications</p> : 
                    notifications.map(notif => (
                      <div key={notif._id} className="notification-item" style={{ padding: '10px', borderBottom: '1px solid #f9f9f9' }}>
                        <p style={{ margin: 0, fontSize: '13px' }}>{notif.title}</p>
                        <small style={{ color: '#888' }}>{notif.message}</small>
                      </div>
                    ))
                  }
               </div>
            </div>
          )}
        </div>

        {/* USER PROFILE SECTION */}
        <div className="user-info-wrapper">
          {loadingUser ? (
            <span>Loading...</span>
          ) : (
            <Link
              to={currentUser?.role === "technician" ? "/worker-profile" : "/client-profile"}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: 'inherit' }}
            >
              <span className="user-name" style={{ fontWeight: '600', fontSize: '14px' }}>
                {currentUser?.name}
              </span>

              
<div
  className="user-avatar-mini"
  style={{
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "1px solid #ddd",
    flexShrink: 0,
    background: "#3b82f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "bold",
  }}
>
  {profileImageUrl ? (
    <img
      src={profileImageUrl}
      alt=""
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
      }}
    />
  ) : (
    currentUser?.name?.charAt(0).toUpperCase()
  )}
</div>


            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;