
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
    <div className="workers-hero-section">
      <h1 className="service-title">{serviceCategory}</h1>
      <p className="service-subtitle">
        Browse trusted professionals near you and book instantly.
      </p>
    </div>

    <div className="map-card">
      <MapContainer
        center={userCoords ? [userCoords.lat, userCoords.lng] : [30.0444, 31.2357]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {userCoords && (
          <>
            <ChangeView center={[userCoords.lat, userCoords.lng]} />
            <Marker position={[userCoords.lat, userCoords.lng]}>
              <Popup>
                <b>Your Location</b>
              </Popup>
            </Marker>
          </>
        )}

        {workers.map((worker) => {
          const lat = worker.location?.coordinates?.[1] || worker.location?.lat;
          const lng = worker.location?.coordinates?.[0] || worker.location?.lng;

          if (lat && lng) {
            return (
              <Marker key={worker._id} position={[lat, lng]}>
                <Popup>
                  <div className="map-popup">
                    <strong>{worker.name}</strong>
                    <p>{worker.specialty}</p>
                    <button onClick={() => handleBook(worker)}>
                      Book Now
                    </button>
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
      <div className="empty-state">
        <h3>No workers found</h3>
        <p>Try another category or check back later.</p>
      </div>
    ) : (
      <div className="workers-grid">
        {workers.map((technician) => (
          <div key={technician._id} className="worker-card">
            <div className="worker-top-section">
              <div
                className="worker-avatar"
                style={{
                  backgroundImage: technician.profilePicture?.[0]?.url
                    ? `url(${getProfileImageUrl(
                        technician.profilePicture[0].url
                      )})`
                    : "none",
                }}
              >
                {!technician.profilePicture?.[0]?.url && (
                  <span>
                    {technician.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="worker-basic-info">
                <h4 onClick={() => navigate(`/worker-profile/${technician._id}`)}>
                  {technician.name}
                </h4>
                <p>{technician.specialty}</p>
              </div>
            </div>

            <div className="rating-stars">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < (technician.rating || 0) ? "#FFD700" : "none"}
                  color={i < (technician.rating || 0) ? "#FFD700" : "#cbd5e1"}
                />
              ))}
              <span className="rating-num">
                {technician.rating || 0}
              </span>
            </div>

            <div className="worker-actions">
              <button
                className="book-btn"
                onClick={() => handleBook(technician)}
              >
                Book Now
              </button>
              <button
                className="contact-btn"
                onClick={() => handleContact(technician)}
              >
                Contact
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
}
export default ServiceWorkersPage;