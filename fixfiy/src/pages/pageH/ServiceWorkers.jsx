
// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Star } from "lucide-react";
// import API from "../../services/api";
// import "./serviceworkers.css";

// const ServiceWorkersPage = () => {
//   // serviceId from the URL could be a MongoDB ObjectId OR a service name slug
//   const { serviceId } = useParams();
//   const navigate = useNavigate();

//   const [workers, setWorkers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   // This will hold the real MongoDB ObjectId for the service
//   const [serviceObjectId, setServiceObjectId] = useState(null);
//   const [serviceTitle, setServiceTitle] = useState("Our Workers");

//   useEffect(() => {
//     if (!serviceId) return;

//     const controller = new AbortController();

//     const fetchData = async () => {
//       try {
//         setLoading(true);

//         // ── Step 1: Resolve the real service ObjectId ──────────────────
//         // If serviceId already looks like a MongoDB ObjectId (24 hex chars), use it directly.
//         // Otherwise treat it as a name/slug and look the service up.
//         const isObjectId = /^[a-f\d]{24}$/i.test(serviceId);

//         let resolvedServiceId = serviceId;
//         let resolvedTitle = serviceId;

//         if (isObjectId) {
//           // Fetch the service by ID to get its name and specialty for filtering workers
//           const serviceRes = await API.get(`/services/${serviceId}`, {
//             signal: controller.signal,
//           });
//           const service = serviceRes.data?.data;
//           resolvedTitle = service?.name ?? serviceId;
//           // specialty on technicians matches service category/name
//           resolvedServiceId = serviceId;
//         } else {
//           // serviceId is a name slug — find the matching service to get its real _id
//           const allServices = await API.get(`/services`, {
//             signal: controller.signal,
//           });
//           const matched = (allServices.data?.data || []).find(
//             (s) =>
//               s.name.toLowerCase() === serviceId.toLowerCase() ||
//               s.category.toLowerCase() === serviceId.toLowerCase()
//           );
//           if (matched) {
//             resolvedServiceId = matched._id; // real ObjectId
//             resolvedTitle = matched.name;
//           } else {
//             // Fallback: capitalise the slug as best-guess title
//             resolvedTitle = serviceId.charAt(0).toUpperCase() + serviceId.slice(1);
//           }
//         }

//         setServiceObjectId(resolvedServiceId);
//         setServiceTitle(resolvedTitle);

//         // ── Step 2: Fetch workers filtered by specialty ─────────────────
//         const specialty = resolvedTitle;
//         const res = await API.get(
//           `/profile?specialty=${encodeURIComponent(specialty)}`,
//           { signal: controller.signal }
//         );
//         setWorkers(res.data?.data || []);
//       } catch (error) {
//         if (error.name !== "CanceledError") {
//           console.log("Error fetching workers:", error);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();

//     return () => controller.abort();
//   }, [serviceId]);

//   if (loading) return <h2>Loading workers...</h2>;

//   const handleBook = (technician) => {
//     // Always use the resolved ObjectId, never the raw URL param (which may be a name)
//     const sid = serviceObjectId || serviceId;
//     navigate(`/booking?workerId=${technician._id}&serviceId=${sid}`, {
//       state: { workerName: technician.name },
//     });
//   };

//   // const handleContact = (technician) => {
//   //   navigate(`/chat?workerId=${technician._id}`, {
//   //     state: { workerName: technician.name },
//   //   });
//   // };
// const handleContact = (technician) => {
//   // الانتقال لصفحة الشات مع تمرير معرف العامل ومعرف الخدمة
//   navigate(`/chat?workerId=${technician._id}&serviceId=${serviceId}`, {
//     state: { 
//       workerName: technician.name,
//       // يمكنك تمرير بيانات إضافية ليتم عرضها في رأس صفحة الشات
//     },
//   });
// };
// const getProfileImageUrl = (image) => {
//   if (!image) return null;
//   return image.startsWith("http") ? image : `${API.defaults.baseURL}${image}`;
// };
//   return (
//     <div className="workers-gallery-container">
//       <h2 className="service-title">{serviceTitle}</h2>

//       {workers.length === 0 ? (
//         <p>No workers found for this service.</p>
//       ) : (
//         <div className="workers-grid">
//           {workers.map((technician) => (
//             <div key={technician._id} className="worker-card">

//               <div className="worker-avatar"
//     style={{
//       width: "80px", // يمكنك التحكم في الحجم هنا
//       height: "80px",
//       borderRadius: "50%",
//       backgroundImage: technician.profileImage ? `url(${getProfileImageUrl(technician.profileImage)})` : "none",
//       backgroundSize: "cover",
//       backgroundPosition: "center",
//       backgroundColor: "#e2e8f0",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       margin: "0 auto 15px", // لتوسيط الصورة داخل الكارد
//       position: "relative",
//       border: "2px solid #f0f0f0"
//     }}
//   >
//     {/* إذا لم توجد صورة، نعرض أول حرف من الاسم */}
//     {!technician.profileImage && (
//       <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
//         {technician.name?.charAt(0).toUpperCase()}
//       </span>
//     )}
  
//   {/* <div className="worker-avatar">
//   <div 
//     className="avatar-circle"
//     style={{ backgroundImage: technician.profileImage ? `url(${getProfileImageUrl(technician.profileImage)})` : "none" }}
//   >
//     {!technician.profileImage && (
//       <span className="avatar-initials">{technician.name?.charAt(0)}</span>
//     )}
//   </div> 
// </div>*/}
//             </div>

//               <div className="worker-info">
//                 <h4
//                   className="worker-name-link"
//                   style={{ cursor: "pointer" }}
//                   onClick={() => navigate(`/worker-profile/${technician._id}`)}
//                 >
//                   {technician.name}
//                 </h4>
//                 <p className="worker-job">{technician.specialty}</p>

//                 <div className="rating-stars">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       size={16}
//                       fill={i < (technician.rating || 0) ? "#FFD700" : "none"}
//                       color={i < (technician.rating || 0) ? "#FFD700" : "#cbd5e1"}
//                     />
//                   ))}
//                   <span className="rating-num">{technician.rating || 0}</span>
//                 </div>
//               </div>

//               <div className="worker-actions">
//                 <button
//                   className="view-profile-btn"
//                   onClick={() => handleBook(technician)}
//                 >
//                   Book
//                 </button>
//                 <button
//                   className="contact-btn"
//                   onClick={() => handleContact(technician)}
//                 >
//                   Contact
//                 </button>
//               </div>

//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ServiceWorkersPage;
























// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { Star, MapPin, Navigation } from "lucide-react";
// import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import API from "../../services/api";
// import "./serviceworkers.css";

// // إصلاح مشكلة ظهور أيقونات الخريطة في Leaflet مع React
// import icon from 'leaflet/dist/images/marker-icon.png';
// import iconShadow from 'leaflet/dist/images/marker-shadow.png';
// let DefaultIcon = L.icon({
//     iconUrl: icon,
//     shadowUrl: iconShadow,
//     iconSize: [25, 41],
//     iconAnchor: [12, 41]
// });
// L.Marker.prototype.options.icon = DefaultIcon;

// // مكون فرعي لتغيير مركز الخريطة تلقائياً عند الحصول على الموقع
// const ChangeView = ({ center }) => {
//   const map = useMap();
//   map.setView(center, map.getZoom());
//   return null;
// };

// const ServiceWorkersPage = () => {
//   const { serviceId } = useParams();
//   const navigate = useNavigate();

//   const [workers, setWorkers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   // This will hold the real MongoDB ObjectId for the service
//   const [serviceObjectId, setServiceObjectId] = useState(null);
//   const [serviceCategory, setServiceTitle] = useState("Our Workers");

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);

//         // ── Step 1: Resolve the real service ObjectId ──────────────────
//         // If serviceId already looks like a MongoDB ObjectId (24 hex chars), use it directly.
//         // Otherwise treat it as a name/slug and look the service up.
//        // const isObjectId = /^[a-f\d]{24}$/i.test(serviceId);

//         //let resolvedServiceId = serviceId;
//         //let resolvedTitle = serviceId;

//         if (isObjectId) {
//           // Fetch the service by ID to get its name and specialty for filtering workers
//           const serviceRes = await API.get(`/services/${serviceId}`, {
//             signal: controller.signal,
//           });
//           const service = serviceRes.data?.data;
//           resolvedTitle = service?.category ?? serviceId;
//           // specialty on technicians matches service category/name
//           resolvedServiceId = serviceId;
//         } else {
//           // serviceId is a name slug — find the matching service to get its real _id
//           const allServices = await API.get(`/services`, {
//             signal: controller.signal,
//           });
//           const matched = (allServices.data?.data || []).find(
//             (s) =>
//               s.name.toLowerCase() === serviceId.toLowerCase() ||
//               s.category.toLowerCase() === serviceId.toLowerCase()
//           );
//           if (matched) {
//             resolvedServiceId = matched._id; // real ObjectId
//             resolvedTitle = matched.category;
//           } else {
//             // Fallback: capitalise the slug as best-guess title
//             resolvedTitle = serviceId.charAt(0).toUpperCase() + serviceId.slice(1);
//           }
//         }

//         // 2. معالجة اسم الخدمة أو الـ ID (من كودك الأصلي)
//         const isObjectId = /^[a-f\d]{24}$/i.test(serviceId);
//         let specialty = serviceId;

//         if (isObjectId) {
//           const serviceRes = await API.get(`/services/${serviceId}`);
//           specialty = serviceRes.data?.data?.name ?? serviceId;
//         }
//         setServiceTitle(specialty);

//         // 3. جلب العمال مع إرسال الإحداثيات للباك إند للفلترة (Query Params)
//         let url = `/profile?specialty=${encodeURIComponent(specialty)}`;
//         if (currentCoords) {
//           url += `&lat=${currentCoords.lat}&lng=${currentCoords.lng}&sort=nearest`;
//         }

//         const res = await API.get(url);
//         setWorkers(res.data?.data || []);

//       } catch (error) {
//         console.error("Error fetching data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [serviceId]);

//   const handleBook = (technician) => {
//     navigate(`/booking?workerId=${technician._id}&serviceId=${serviceId}`, {
//       state: { workerName: technician.name },
//     });
//   };

//   const handleContact = (technician) => {
//     navigate(`/chat?workerId=${technician._id}&serviceId=${serviceId}`, {
//       state: { workerName: technician.name },
//     });
//   };

//   const getProfileImageUrl = (image) => {
//     if (!image) return null;
//     return image.startsWith("http") ? image : `${API.defaults.baseURL}${image}`;
//   };

//   if (loading) return <div className="loading-state"><h2>Loading Workers Near You...</h2></div>;

//   return (
//     <div className="workers-gallery-container">
//       <h2 className="service-title">{serviceCategory}</h2>

//       {/* قسم الخريطة التفاعلية */}
//       <div className="map-wrapper" style={{ height: "350px", width: "100%", marginBottom: "30px", borderRadius: "15px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
//         <MapContainer center={userCoords ? [userCoords.lat, userCoords.lng] : [30.0444, 31.2357]} zoom={13} style={{ height: "100%", width: "100%" }}>
//           <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
//           {userCoords && (
//             <>
//               <ChangeView center={[userCoords.lat, userCoords.lng]} />
//               <Marker position={[userCoords.lat, userCoords.lng]}>
//                 <Popup><b>Your Location</b></Popup>
//               </Marker>
//             </>
//           )}

//           {/* عرض دبابيس العمال على الخريطة */}
//           {/* {workers.map((worker) => worker.location && (
//             <Marker key={worker._id} position={[worker.location.lat, worker.location.lng]}>
//               <Popup>
//                 <div className="map-popup">
//                   <strong>{worker.name}</strong>
//                   <p>{worker.specialty}</p>
//                   <button onClick={() => handleBook(worker)}>Book Now</button>
//                 </div>
//               </Popup>
//             </Marker>
//           ))} */}
//           {/* عرض دبابيس العمال على الخريطة */}
// {workers.map((worker) => {
//   // تأكدي إن العامل عنده لوكيشن وإحداثيات كاملة
//   if (worker.location && worker.location.lat && worker.location.lng) {
//     return (
//       <Marker 
//         key={worker._id} 
//         position={[worker.location.lat, worker.location.lng]}
//       >
//         <Popup>
//           <div className="map-popup">
//             <strong>{worker.name}</strong>
//             <p>{worker.specialty}</p>
//             <button onClick={() => handleBook(worker)}>Book Now</button>
//           </div>
//         </Popup>
//       </Marker>
//     );
//   }
//   return null; // لو معندوش موقع ميرسمش حاجة وميضربش Error
// })}
//         </MapContainer>
//       </div>

//       {/* شبكة العمال (Grid) */}
//       {workers.length === 0 ? (
//         <p className="no-data">No workers found for this service in your area.</p>
//       ) : (
//         <div className="workers-grid">
//           {workers.map((technician) => (
//             <div key={technician._id} className="worker-card">
//               <div className="worker-avatar-container">
//                 <div className="worker-avatar"
//                   style={{
//                     backgroundImage: technician.profileImage ? `url(${getProfileImageUrl(technician.profileImage)})` : "none",
//                     backgroundColor: "#e2e8f0",
//                     backgroundSize: "cover",
//                     backgroundPosition: "center"
//                   }}>
//                   {!technician.profileImage && <span>{technician.name?.charAt(0).toUpperCase()}</span>}
//                 </div>
//               </div>

//               <div className="worker-info">
//                 <h4 onClick={() => navigate(`/worker-profile/${technician._id}`)}>{technician.name}</h4>
//                 <p className="worker-job">{technician.specialty}</p>
                
//                 {/* عرض المسافة لو الباك إند بعتها */}
//                 {technician.distance && (
//                    <p className="distance-tag"><Navigation size={12}/> {technician.distance.toFixed(1)} km away</p>
//                 )}

//                 <div className="rating-stars">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       size={14}
//                       fill={i < (technician.rating || 0) ? "#FFD700" : "none"}
//                       color={i < (technician.rating || 0) ? "#FFD700" : "#cbd5e1"}
//                     />
//                   ))}
//                   <span className="rating-num">({technician.rating || 0})</span>
//                 </div>
//               </div>

//               <div className="worker-actions">
//                 <button className="book-btn" onClick={() => handleBook(technician)}>Book</button>
//                 <button className="contact-btn" onClick={() => handleContact(technician)}>Contact</button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ServiceWorkersPage;





















///3333
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, Navigation } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../../services/api";
import "./serviceworkers.css";

// إصلاح أيقونات الخريطة
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// دالة مساعدة للتحقق من الـ ID (وضعتها خارج الكومبوننت لضمان الوصول إليها)
const checkIsObjectId = (id) => /^[a-f\d]{24}$/i.test(id);

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
};

const ServiceWorkersPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serviceCategory, setServiceTitle] = useState("Our Workers");
  
  // 1. FIXED: تعريف الـ States الناقصة
  const [userCoords, setUserCoords] = useState(null); 

  useEffect(() => {
    const fetchData = async () => {
      // 2. FIXED: تعريف الـ controller للـ Signal
      const controller = new AbortController();

      try {
        setLoading(true);

        // تحديد هل الـ ID هو ObjectId أم اسم خدمة
        const isObjectId = checkIsObjectId(serviceId);
        let specialty = serviceId;
        let resolvedTitle = serviceId;

        if (isObjectId) {
          const serviceRes = await API.get(`/services/${serviceId}`, { signal: controller.signal });
          const service = serviceRes.data?.data;
          specialty = service?.name || serviceId;
          resolvedTitle = service?.category || serviceId;
        } else {
          const allServices = await API.get(`/services`, { signal: controller.signal });
          const matched = (allServices.data?.data || []).find(
            (s) => s.name.toLowerCase() === serviceId.toLowerCase() ||
                   s.category.toLowerCase() === serviceId.toLowerCase()
          );
          if (matched) {
            specialty = matched.name;
            resolvedTitle = matched.category;
          }
        }

        setServiceTitle(resolvedTitle);

        // جلب موقع المستخدم (اختياري لتحسين البحث)
        let url = `/profile?specialty=${encodeURIComponent(specialty)}`;
        // لو حابة تضيفي إحداثيات حالية ممكن تطلبيها من المتصفح هنا
        
        const res = await API.get(url, { signal: controller.signal });
        setWorkers(res.data?.data || []);

      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error("Error fetching data:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serviceId]);

  // باقي الدوال (handleBook, handleContact, getProfileImageUrl) كما هي...
  const handleBook = (technician) => {
    navigate(`/booking?workerId=${technician._id}&serviceId=${serviceId}`, {
      state: { workerName: technician.name },
    });
  };

  const handleContact = (technician) => {
    navigate(`/chat?workerId=${technician._id}&serviceId=${serviceId}`, {
      state: { workerName: technician.name },
    });
  };

  const getProfileImageUrl = (image) => {
    if (!image) return null;
    return image.startsWith("http") ? image : `${API.defaults.baseURL}${image}`;
  };

  if (loading) return <div className="loading-state"><h2>Loading Workers...</h2></div>;

  return (
    <div className="workers-gallery-container">
      <h2 className="service-title">{serviceCategory}</h2>

      <div className="map-wrapper" style={{ height: "350px", width: "100%", marginBottom: "30px", borderRadius: "15px", overflow: "hidden" }}>
        <MapContainer center={userCoords ? [userCoords.lat, userCoords.lng] : [30.0444, 31.2357]} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          {userCoords && (
            <>
              <ChangeView center={[userCoords.lat, userCoords.lng]} />
              <Marker position={[userCoords.lat, userCoords.lng]}>
                <Popup><b>Your Location</b></Popup>
              </Marker>
            </>
          )}

          {workers.map((worker) => {
            // تأكد من هيكلة بيانات الموقع القادمة من الباك إند
            const lat = worker.location?.coordinates?.[1] || worker.location?.lat;
            const lng = worker.location?.coordinates?.[0] || worker.location?.lng;

            if (lat && lng) {
              return (
                <Marker key={worker._id} position={[lat, lng]}>
                  <Popup>
                    <div className="map-popup">
                      <strong>{worker.name}</strong>
                      <p>{worker.specialty}</p>
                      <button onClick={() => handleBook(worker)}>Book Now</button>
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}
        </MapContainer>
      </div>

      {workers.length === 0 ? (
        <p className="no-data">No workers found for this service.</p>
      ) : (
        <div className="workers-grid">
          {workers.map((technician) => (
            <div key={technician._id} className="worker-card">
              <div className="worker-avatar-container">
                <div className="worker-avatar"
                  style={{
                    backgroundImage: technician.profilePicture?.[0]?.url 
                      ? `url(${getProfileImageUrl(technician.profilePicture[0].url)})` 
                      : "none",
                    backgroundColor: "#e2e8f0",
                    backgroundSize: "cover"
                  }}>
                  {!technician.profilePicture?.[0]?.url && <span>{technician.name?.charAt(0).toUpperCase()}</span>}
                </div>
              </div>

              <div className="worker-info">
                <h4 onClick={() => navigate(`/worker-profile/${technician._id}`)}>{technician.name}</h4>
                <p className="worker-job">{technician.specialty}</p>
                
                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < (technician.rating || 0) ? "#FFD700" : "none"}
                      color={i < (technician.rating || 0) ? "#FFD700" : "#cbd5e1"}
                    />
                  ))}
                  <span className="rating-num">({technician.rating || 0})</span>
                </div>
              </div>

              <div className="worker-actions">
                <button className="book-btn" onClick={() => handleBook(technician)}>Book</button>
                <button className="contact-btn" onClick={() => handleContact(technician)}>Contact</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceWorkersPage;