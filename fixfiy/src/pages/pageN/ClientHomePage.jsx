


// import React, { useEffect, useState } from "react";
// import "./ClientHomePage.css";
// import { useNavigate } from "react-router-dom";
// import {
//   Zap,
//   Droplets,
//   Hammer,
//   Paintbrush,
//   Star,
//   MapPin,
//   CalendarCheck,
//   Search,
//   CheckCircle
// } from "lucide-react";

// import API from "../../services/api";

// function ClientHomePage() {
//   const navigate = useNavigate();

//   const [workers, setWorkers] = useState([]);
//   const [services, setServices] = useState([]);

//   //  stars
//   const renderStars = (rating) => (
//     <div style={{ display: "flex", gap: "2px", justifyContent: "center" }}>
//       {[...Array(5)].map((_, i) => (
//         <Star
//           key={i}
//           size={16}
//           fill={i < rating ? "#FFD700" : "none"}
//           color={i < rating ? "#FFD700" : "#cbd5e1"}
//         />
//       ))}
//     </div>
//   );

//   //  GET Top Workers
//   useEffect(() => {
//     const fetchWorkers = async () => {
//       try {
//         const res = await API.get("/workers"); 
//         setWorkers(res.data);
//       } catch (err) {
//         console.log("Error fetching workers", err);
//       }
//     };

//     fetchWorkers();
//   }, []);

//   //  GET Services
//   useEffect(() => {
//     const fetchServices = async () => {
//       try {
//         const res = await API.get("/services");
//         setServices(res.data);
//       } catch (err) {
//         console.log("Error fetching services", err);
//       }
//     };

//     fetchServices();
//   }, []);

//   const handleServiceClick = (serviceId) => {
//     navigate(`/workers/${serviceId}`);
//   };

//   return (
//     <div className="page">
//       <div className="content">

//         {/* Banner */}
//         <div className="banner">
//           <div className="banner-text">
//             <h2>Find the best technicians near you in seconds!</h2>
//           </div>
//           <div className="banner-icon-bg">
//               <img src="src\assets\download (7).png" size={100} strokeWidth={1} opacity={0.2} />
//            </div>
//         </div>

//         {/*  Services */}
//         <h3>Our Services</h3>
//         <div className="services">
//           {services.length > 0 ? (
//             services.map((service) => (
//               <div
//                 key={service._id}
//                 className="service"
//                 onClick={() => handleServiceClick(service.name)}
//               >
//                 {service.name}
//               </div>
//             ))
//           ) : (
//             <>
//               {/* fallback لو API مش جاهز */}
//               <div onClick={() => handleServiceClick(service._id)} className="service">
//                 <Zap /> Electricity
//               </div>
//               <div onClick={() => handleServiceClick(service._id)} className="service">
//                 <Droplets /> Plumber
//               </div>
//               <div onClick={() => handleServiceClick(service._id)} className="service">
//                 <Paintbrush /> Painter
//               </div>
//               <div onClick={() => handleServiceClick(service._id)} className="service">
//                 <Hammer />Carpinter
//               </div>
//             </>
//           )}
//         </div>

//         {/*  Top Workers */}
//         <h3>Top Rated Workers</h3>
//         <div className="workers">
//           {workers.length === 0 ? (
//             <p>No workers available</p>
//           ) : (
//             workers.map((worker) => (
//               <div className="worker-card" key={worker._id}>
//                 <div className="worker-avatar"></div>

//                 <p className="worker-name">{worker.name}</p>
//                 <p className="worker-job">{worker.specialty}</p>

//                 {renderStars(worker.rating || 0)}

//                 <div className="card-actions">
//                   <button
//                     className="view-profile"
//                     onClick={() => navigate(`/worker/${worker._id}`)}
//                   >
//                     View Profile
//                   </button>

//                   <button className="contact">
//                     Contact
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         {/*  How it works */}
//         <h3 style={{ marginTop: "40px" }}>How it works</h3>
//         <div className="steps">
//           <div className="step-item">
//             <div className="step-icon"><Search size={22} /></div>
//             <p>1. Choose a service</p>
//           </div>
//           <div className="step-item">
//             <div className="step-icon"><MapPin size={22} /></div>
//             <p>2. Specify location</p>
//           </div>
//           <div className="step-item">
//             <div className="step-icon"><CalendarCheck size={22} /></div>
//             <p>3. Book a worker</p>
//           </div>
//           <div className="step-item">
//             <div className="step-icon"><CheckCircle size={22} /></div>
//             <p>4. Task completed</p>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

// export default ClientHomePage;


import React, { useEffect, useState } from "react";

import "./ClientHomePage.css";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Star,
  MapPin,
  CalendarCheck,
  Search,
  CheckCircle
} from "lucide-react";

import API from "../../services/api";

function ClientHomePage() {
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceWorkers, setServiceWorkers] = useState([]);
  const [loadingServiceWorkers, setLoadingServiceWorkers] = useState(false);
  const [topRatedServiceWorkers, setTopRatedServiceWorkers] = useState([]);
  const [loadingTopRated, setLoadingTopRated] = useState(false);

  const renderStars = (rating) => (
    <div style={{ display: "flex", gap: "2px", justifyContent: "center" }}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          fill={i < rating ? "#FFD700" : "none"}
          color={i < rating ? "#FFD700" : "#cbd5e1"}
        />
      ))}
    </div>
  );

  // GET Workers
  useEffect(() => {
    const controller = new AbortController();

    const fetchWorkers = async () => {
      try {
        const res = await API.get("/workers", { signal: controller.signal });
        setWorkers(res.data);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.log("Error fetching workers", err);
        }
      }
    };

    fetchWorkers();
    return () => controller.abort();
  }, []);

  // GET Services
  useEffect(() => {
    const controller = new AbortController();

    const fetchServices = async () => {
      try {
        const res = await API.get("/services", { signal: controller.signal });
        setServices(res.data);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.log("Error fetching services", err);
        }
      }
    };

    fetchServices();
    return () => controller.abort();
  }, []);

  const handleServiceClick = async (service) => {
    setSelectedService(service);
    setLoadingServiceWorkers(true);
    setLoadingTopRated(true);

    try {
      const res = await API.get(`/users?specialty=${encodeURIComponent(service.name)}`);
      setServiceWorkers(res.data?.data || []);
      
      // Fetch top-rated workers for this service (limited to 6)
      const topRes = await API.get(`/users?specialty=${encodeURIComponent(service.name)}&sort=-technician_rate&limit=6`);
      setTopRatedServiceWorkers(topRes.data?.data || []);
    } catch (err) {
      console.log("Error fetching service workers", err);
      setServiceWorkers([]);
      setTopRatedServiceWorkers([]);
    } finally {
      setLoadingServiceWorkers(false);
      setLoadingTopRated(false);
    }
  };

  const closeModal = () => {
    setSelectedService(null);
    setServiceWorkers([]);
    setTopRatedServiceWorkers([]);
  };

  return (
    <div className="page">
      <div className="content">

        {/* Banner */}
        <div className="banner">
          <div className="banner-text">
            <h2>Find the best technicians near you in seconds!</h2>
          </div>
          <div className="banner-icon-bg">
            <img src="src\assets\download (7).png" size={100} strokeWidth={1} opacity={0.2} />
          </div>
        </div>

        {/* Services */}
        <h3>Our Services</h3>
        <div className="services">
          {services.length > 0 ? (
            services.map((service) => (
              <div
                key={service._id}
                className="service"
                onClick={() => handleServiceClick(service)}
                style={{ cursor: "pointer" }}
              >
                {service.name}
              </div>
            ))
          ) : (
            <>
              <div onClick={() => handleServiceClick({ name: "Electricity" })} className="service" style={{ cursor: "pointer" }}>
                <Zap /> Electricity
              </div>
              <div onClick={() => handleServiceClick({ name: "Plumber" })} className="service" style={{ cursor: "pointer" }}>
                <Droplets /> Plumber
              </div>
              <div onClick={() => handleServiceClick({ name: "Painter" })} className="service" style={{ cursor: "pointer" }}>
                <Paintbrush /> Painter
              </div>
              <div onClick={() => handleServiceClick({ name: "Carpinter" })} className="service" style={{ cursor: "pointer" }}>
                <Hammer /> Carpinter
              </div>
            </>
          )}
        </div>

        {/* Service Workers Modal */}
        {selectedService && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              maxWidth: "800px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2>{selectedService.name} - Available Technicians</h2>
                <button
                  onClick={closeModal}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "#666"
                  }}
                >
                  ✕
                </button>
              </div>

              {loadingServiceWorkers ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <p>Loading technicians...</p>
                </div>
              ) : serviceWorkers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <p>No technicians available for this service.</p>
                </div>
              ) : (
                <div className="workers" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                  {serviceWorkers.map((technician) => (
                    <div className="worker-card" key={technician._id} style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "8px" }}>
                      <div className="worker-avatar" style={{ width: "80px", height: "80px", backgroundColor: "#e0e0e0", borderRadius: "50%", margin: "0 auto 12px" }}></div>
                      <p className="worker-name" style={{ fontWeight: "bold", marginBottom: "4px" }}>{technician.name}</p>
                      <p className="worker-job" style={{ color: "#666", fontSize: "14px", marginBottom: "8px" }}>{technician.specialty}</p>
                      {renderStars(technician.technician_rate || 0)}
                      <div className="card-actions" style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                        <button
                          className="view-profile"
                          onClick={() => {
                            navigate(`/worker/${technician._id}`);
                            closeModal();
                          }}
                          style={{
                            flex: 1,
                            padding: "8px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                          View Profile
                        </button>
                        <button
                          className="contact"
                          style={{
                            flex: 1,
                            padding: "8px",
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                          Contact
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top Workers */}
        <h3>Top Rated Workers{selectedService && ` - ${selectedService.name}`}</h3>
        <div className="workers">
          {loadingTopRated && selectedService ? (
            <p>Loading top-rated workers...</p>
          ) : selectedService && topRatedServiceWorkers.length === 0 ? (
            <p>No top-rated workers available for {selectedService.name}</p>
          ) : selectedService && topRatedServiceWorkers.length > 0 ? (
            topRatedServiceWorkers.map((technician) => (
              <div className="worker-card" key={technician._id}>
                <div className="worker-avatar"></div>

                <p className="worker-name">{technician.name}</p>
                <p className="worker-job">{technician.specialty}</p>

                {renderStars(technician.technician_rate || 0)}

                <div className="card-actions">
                  <button
                    className="view-profile"
                    onClick={() => navigate(`/worker/${technician._id}`)}
                  >
                    View Profile
                  </button>

                  <button className="contact">Contact</button>
                </div>
              </div>
            ))
          ) : !selectedService && workers.length === 0 ? (
            <p>No workers available</p>
          ) : !selectedService ? (
            workers.map((technician) => (
              <div className="worker-card" key={technician._id}>
                <div className="worker-avatar"></div>

                <p className="worker-name">{technician.name}</p>
                <p className="worker-job">{technician.specialty}</p>

                {renderStars(technician.technician_rate || 0)}

                <div className="card-actions">
                  <button
                    className="view-profile"
                    onClick={() => navigate(`/worker/${technician._id}`)}
                  >
                    View Profile
                  </button>

                  <button className="contact">Contact</button>
                </div>
              </div>
            ))
          ) : null}
        </div>
      

      </div>
        {/* How it works */}
        <h3 style={{ marginTop: "40px" }}>How it works</h3>
        <div className="steps">
          <div className="step-item">
            <div className="step-icon"><Search size={22} /></div>
            <p>1. Choose a service</p>
          </div>
          <div className="step-item">
            <div className="step-icon"><MapPin size={22} /></div>
            <p>2. Specify location</p>
          </div>
          <div className="step-item">
            <div className="step-icon"><CalendarCheck size={22} /></div>
            <p>3. Book a worker</p>
          </div>
          <div className="step-item">
            <div className="step-icon"><CheckCircle size={22} /></div>
            <p>4. Task completed</p>
          </div>
        </div>

      
    </div>
  );
}

export default ClientHomePage;