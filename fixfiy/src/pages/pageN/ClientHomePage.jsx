


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

  //  stars
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

  //  GET Top Workers
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await API.get("/workers/top"); 
        setWorkers(res.data);
      } catch (err) {
        console.log("Error fetching workers", err);
      }
    };

    fetchWorkers();
  }, []);

  //  GET Services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await API.get("/services");
        setServices(res.data);
      } catch (err) {
        console.log("Error fetching services", err);
      }
    };

    fetchServices();
  }, []);

  const handleServiceClick = (serviceName) => {
    navigate(`/workers/${serviceName}`);
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

        {/*  Services */}
        <h3>Our Services</h3>
        <div className="services">
          {services.length > 0 ? (
            services.map((service) => (
              <div
                key={service._id}
                className="service"
                onClick={() => handleServiceClick(service.name)}
              >
                {service.name}
              </div>
            ))
          ) : (
            <>
              {/* fallback لو API مش جاهز */}
              <div onClick={() => handleServiceClick("Electrician")} className="service">
                <Zap /> Electricity
              </div>
              <div onClick={() => handleServiceClick("Plumber")} className="service">
                <Droplets /> Plumber
              </div>
              <div onClick={() => handleServiceClick("Electrician")} className="service">
                <Paintbrush /> Painter
              </div>
              <div onClick={() => handleServiceClick("Plumber")} className="service">
                <Hammer />Carpinter
              </div>
            </>
          )}
        </div>

        {/*  Top Workers */}
        <h3>Top Rated Workers</h3>
        <div className="workers">
          {workers.length === 0 ? (
            <p>No workers available</p>
          ) : (
            workers.map((worker) => (
              <div className="worker-card" key={worker._id}>
                <div className="worker-avatar"></div>

                <p className="worker-name">{worker.name}</p>
                <p className="worker-job">{worker.specialty}</p>

                {renderStars(worker.rating || 0)}

                <div className="card-actions">
                  <button
                    className="view-profile"
                    onClick={() => navigate(`/worker/${worker._id}`)}
                  >
                    View Profile
                  </button>

                  <button className="contact">
                    Contact
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/*  How it works */}
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
    </div>
  );
}

export default ClientHomePage;