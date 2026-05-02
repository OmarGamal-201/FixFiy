
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import API from "../../services/api";
import "./serviceworkers.css";

const ServiceWorkersPage = () => {
  // serviceId from the URL could be a MongoDB ObjectId OR a service name slug
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  // This will hold the real MongoDB ObjectId for the service
  const [serviceObjectId, setServiceObjectId] = useState(null);
  const [serviceTitle, setServiceTitle] = useState("Our Workers");

  useEffect(() => {
    if (!serviceId) return;

    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);

        // ── Step 1: Resolve the real service ObjectId ──────────────────
        // If serviceId already looks like a MongoDB ObjectId (24 hex chars), use it directly.
        // Otherwise treat it as a name/slug and look the service up.
        const isObjectId = /^[a-f\d]{24}$/i.test(serviceId);

        let resolvedServiceId = serviceId;
        let resolvedTitle = serviceId;

        if (isObjectId) {
          // Fetch the service by ID to get its name and specialty for filtering workers
          const serviceRes = await API.get(`/services/${serviceId}`, {
            signal: controller.signal,
          });
          const service = serviceRes.data?.data;
          resolvedTitle = service?.name ?? serviceId;
          // specialty on technicians matches service category/name
          resolvedServiceId = serviceId;
        } else {
          // serviceId is a name slug — find the matching service to get its real _id
          const allServices = await API.get(`/services`, {
            signal: controller.signal,
          });
          const matched = (allServices.data?.data || []).find(
            (s) =>
              s.name.toLowerCase() === serviceId.toLowerCase() ||
              s.category.toLowerCase() === serviceId.toLowerCase()
          );
          if (matched) {
            resolvedServiceId = matched._id; // real ObjectId
            resolvedTitle = matched.name;
          } else {
            // Fallback: capitalise the slug as best-guess title
            resolvedTitle = serviceId.charAt(0).toUpperCase() + serviceId.slice(1);
          }
        }

        setServiceObjectId(resolvedServiceId);
        setServiceTitle(resolvedTitle);

        // ── Step 2: Fetch workers filtered by specialty ─────────────────
        const specialty = resolvedTitle;
        const res = await API.get(
          `/profile?specialty=${encodeURIComponent(specialty)}`,
          { signal: controller.signal }
        );
        setWorkers(res.data?.data || []);
      } catch (error) {
        if (error.name !== "CanceledError") {
          console.log("Error fetching workers:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [serviceId]);

  if (loading) return <h2>Loading workers...</h2>;

  const handleBook = (technician) => {
    // Always use the resolved ObjectId, never the raw URL param (which may be a name)
    const sid = serviceObjectId || serviceId;
    navigate(`/booking?workerId=${technician._id}&serviceId=${sid}`, {
      state: { workerName: technician.name },
    });
  };

  // const handleContact = (technician) => {
  //   navigate(`/chat?workerId=${technician._id}`, {
  //     state: { workerName: technician.name },
  //   });
  // };
const handleContact = (technician) => {
  // الانتقال لصفحة الشات مع تمرير معرف العامل ومعرف الخدمة
  navigate(`/chat?workerId=${technician._id}&serviceId=${serviceId}`, {
    state: { 
      workerName: technician.name,
      // يمكنك تمرير بيانات إضافية ليتم عرضها في رأس صفحة الشات
    },
  });
};
  return (
    <div className="workers-gallery-container">
      <h2 className="service-title">{serviceTitle}</h2>

      {workers.length === 0 ? (
        <p>No workers found for this service.</p>
      ) : (
        <div className="workers-grid">
          {workers.map((technician) => (
            <div key={technician._id} className="worker-card">

              <div className="worker-avatar">
                <div className="placeholder-img"></div>
              </div>

              <div className="worker-info">
                <h4
                  className="worker-name-link"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/worker-profile/${technician._id}`)}
                >
                  {technician.name}
                </h4>
                <p className="worker-job">{technician.specialty}</p>

                <div className="rating-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < (technician.rating || 0) ? "#FFD700" : "none"}
                      color={i < (technician.rating || 0) ? "#FFD700" : "#cbd5e1"}
                    />
                  ))}
                  <span className="rating-num">{technician.rating || 0}</span>
                </div>
              </div>

              <div className="worker-actions">
                <button
                  className="view-profile-btn"
                  onClick={() => handleBook(technician)}
                >
                  Book
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
};

export default ServiceWorkersPage;
