import React, { useEffect, useState } from "react";
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
  CheckCircle,
  ArrowRight,
  Wrench,
  BadgeCheck,
  ChevronRight,
  Wind,
  Settings,
} from "lucide-react";

import API from "../../services/api";
import "./ClientHomePage.css";

const serviceIcons = {
  Electricity: <Zap size={26} />,
  Plumber: <Droplets size={26} />,
  Painter: <Paintbrush size={26} />,
  Carpinter: <Hammer size={26} />,
  hvac: <Wind size={26} />,
  appliance_repair: <Settings size={26} />,
  general: <Wrench size={26} />,
};

const DEFAULT_SERVICES = [
  { name: "Electricity", category: "electrical" },
  { name: "Plumber", category: "plumbing" },
  { name: "Painter", category: "painting" },
  { name: "Carpinter", category: "carpentry" },
  { name: "hvac", category: "hvac" },
  { name: "appliance_repair", category: "appliance_repair" },
  { name: "general", category: "general" },
];

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function StarRating({ rating }) {
  const rounded = Math.round(rating || 0);

  return (
    <div className="star-rating">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={12}
          fill={i < rounded ? "#F59E0B" : "none"}
          color={i < rounded ? "#F59E0B" : "#CBD5E1"}
        />
      ))}

      <span className="rating-value">
        {(rating || 0).toFixed(1)}
      </span>
    </div>
  );
}

function SkeletonWorkers() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <div className="skeleton-worker" key={i}>
          <div className="skeleton skeleton-circle" />

          <div className="skeleton-lines">
            <div className="skeleton skeleton-line-a" />
            <div className="skeleton skeleton-line-b" />
          </div>
        </div>
      ))}
    </>
  );
}

export default function ClientHomePage() {
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const [loading, setLoading] = useState(true);

  const CATEGORY_TO_SPECIALTY = {
    plumbing: "Plumber",
    electrical: "Electricity",
    carpentry: "Carpinter",
    painting: "Painter",
    hvac: "hvac",
    appliance_repair: "appliance_repair",
    general: "general",
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async (specialty = "") => {
    try {
      setLoading(true);

      let url = "/profile";

      if (specialty) {
        url += `?specialty=${specialty}`;
      }

      const res = await API.get(url);

      console.log(res.data);

      if (Array.isArray(res.data)) {
        setWorkers(res.data);
      } else {
        setWorkers(res.data.data || []);
      }
    } catch (err) {
      console.log(err);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceClick = async (service) => {
    setSelectedService(service);

    const specialty =
      CATEGORY_TO_SPECIALTY[service.category] || service.name;

    await fetchWorkers(specialty);
  };

  const clearFilter = async () => {
    setSelectedService(null);
    await fetchWorkers();
  };

  return (
    <div className="client-home-container">
      {/* HERO */}

      <div className="welcome-banner">
        <div className="welcome-text">
          <div className="hero-badge">
            <BadgeCheck size={14} />
            Trusted professionals
          </div>

          <h3>
            Find the best technicians near you
          </h3>

          <p>
            Book verified home-service professionals
            in seconds — no hassle, no guesswork.
          </p>
        </div>
      </div>

      {/* PAGE CONTENT */}

      <div className="page-content">
        {/* SERVICES */}

        <div className="services-wrapper">
  {DEFAULT_SERVICES.map((service) => (
    <button
      key={service.name}
      className={`service-pill ${
        selectedService?.name === service.name
          ? "active"
          : ""
      }`}
      onClick={() => handleServiceClick(service)}
    >
      <div className="service-pill-icon">
        {serviceIcons[service.name] || (
          <Wrench size={22} />
        )}
      </div>

      <span className="service-pill-name">
        {service.name}
      </span>
    </button>
  ))}
</div>

        {/* LOWER SECTION */}

        <div className="lower-section">
          {/* WORKERS */}

          <div className="workers-panel">
            <div className="workers-panel-header">
              <div>
                <p className="section-title">
                  {selectedService
                    ? `${selectedService.name} Technicians`
                    : "Top Rated Technicians"}
                </p>

                <p className="section-subtitle">
                  {selectedService
                    ? `Experts in ${selectedService.name}`
                    : "Verified technicians"}
                </p>
              </div>
            </div>

            <div className="workers-list">
              {loading ? (
                <SkeletonWorkers />
              ) : workers.length === 0 ? (
                <p className="empty-msg">
                  No technicians found
                </p>
              ) : (
                workers.map((tech) => (
                  <div
                    className="worker-card"
                    key={tech._id}
                    onClick={() =>
                      navigate(`/worker/${tech._id}`)
                    }
                  >
                    <div className="worker-avatar">
                      {getInitials(tech.name)}
                    </div>

                    <div className="worker-info">
                      <p className="worker-name">
                        {tech.name}
                      </p>

                      <p className="worker-specialty">
                        {tech.specialty ||
                          "Technician"}
                      </p>
                    </div>

                    <div className="worker-meta">
                      <StarRating
                        rating={tech.technician_rate}
                      />
                    </div>

                    <div className="worker-arrow">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SIDEBAR */}

          <div className="sidebar">
            <div className="how-it-works-card">
              <h4>How it works</h4>

              <div className="steps-list">
                {[
                  {
                    icon: <Search size={14} />,
                    title: "Choose a service",
                    desc: "Select what you need",
                  },
                  {
                    icon: <MapPin size={14} />,
                    title: "Find nearby workers",
                    desc: "See available technicians",
                  },
                  {
                    icon: (
                      <CalendarCheck size={14} />
                    ),
                    title: "Book technician",
                    desc: "Send booking request",
                  },
                  {
                    icon: (
                      <CheckCircle size={14} />
                    ),
                    title: "Done",
                    desc: "Rate your experience",
                  },
                ].map((step, idx) => (
                  <div
                    className="step-item"
                    key={idx}
                  >
                    <div className="step-num">
                      {step.icon}
                    </div>

                    <div className="step-body">
                      <p className="step-title">
                        {step.title}
                      </p>

                      <p className="step-desc">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PROMO */}

            <div className="promo-card">
              <div className="promo-tag">
                Limited offer
              </div>

              <h4>
                First booking free inspection
              </h4>

              <p>
                Get free inspection on your first
                booking.
              </p>

              <button
                className="promo-btn"
                onClick={() =>
                  navigate("/booking")
                }
              >
                Book now
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}