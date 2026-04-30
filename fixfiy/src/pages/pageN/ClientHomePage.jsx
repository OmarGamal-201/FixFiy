
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
  X,
  ArrowRight,
  Users,
  Wrench,
  BadgeCheck,
  ChevronRight
} from "lucide-react";
import API from "../../services/api";
import "./ClientHomePage.css";

const serviceIcons = {
  Electricity: <Zap size={22} />,
  Plumber: <Droplets size={22} />,
  Painter: <Paintbrush size={22} />,
  Carpinter: <Hammer size={22} />,
};

const DEFAULT_SERVICES = ["Electricity", "Plumber", "Painter", "Carpinter"];

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
          color={i < rounded ? "#F59E0B" : "#cbd5e1"}
        />
      ))}
      <span className="rating-value">{(rating || 0).toFixed(1)}</span>
    </div>
  );
}

function SkeletonWorkers() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
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
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [serviceWorkers, setServiceWorkers] = useState([]);
  const [loadingServiceWorkers, setLoadingServiceWorkers] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servRes, workRes] = await Promise.all([
          API.get("/services"),
          API.get("/workers"),
        ]);
        setServices(servRes.data || []);
        setWorkers(workRes.data || []);
      } catch (err) {
        console.error("Error fetching initial data", err);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchData();
  }, []);

  const handleServiceClick = async (service) => {
    if (selectedService?.name === service.name) {
      setSelectedService(null);
      return;
    }
    setSelectedService(service);
    setLoadingServiceWorkers(true);
    try {
      const res = await API.get(
        `/users?specialty=${encodeURIComponent(service.name)}`
      );
      setServiceWorkers(res.data?.data || []);
    } catch {
      setServiceWorkers([]);
    } finally {
      setLoadingServiceWorkers(false);
    }
  };

  const displayedServices =
    services.length > 0
      ? services
      : DEFAULT_SERVICES.map((name) => ({ name, _id: name }));

  const displayedWorkers = selectedService ? serviceWorkers : workers.slice(0, 8);
  const isLoading = loadingInitial || loadingServiceWorkers;

  return (
    <div className="client-home-container">
      {/* ── Hero Banner ── */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <div className="hero-badge">
            <BadgeCheck size={12} />
            Trusted professionals
          </div>
          <h3>Find the best technicians near you</h3>
          <p>
            Book verified home-service professionals in seconds — no hassle,
            no guesswork.
          </p>
           
          
        </div>

   </div>

      {/* ── Page Content ── */}
      <div className="page-content">
        {/* ── Services ── */}
        <div className="services-section">
          <div className="section-header-row">
            <div>
              <p className="section-title">Our Services</p>
              <p className="section-subtitle">What do you need help with?</p>
            </div>
          </div>

          <div className="services-grid">
            {displayedServices.map((service) => (
              <div
                key={service._id || service.name}
                className={`service-card ${
                  selectedService?.name === service.name ? "active" : ""
                }`}
                onClick={() => handleServiceClick(service)}
              >
                <div className="service-icon-wrap">
                  {serviceIcons[service.name] || <Wrench size={22} />}
                </div>
                <span className="service-card-name">{service.name}</span>
                <span className="service-card-sub">
                  {selectedService?.name === service.name
                    ? "Viewing"
                    : "Tap to filter"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Lower Section ── */}
        <div className="lower-section">
          {/* Workers Panel */}
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
                    ? `Showing experts in ${selectedService.name}`
                    : "Handpicked based on ratings & reviews"}
                </p>
              </div>
              {selectedService && (
                <button
                  className="clear-filter-btn"
                  onClick={() => setSelectedService(null)}
                >
                  Clear filter
                </button>
              )}
            </div>

            <div className="workers-list">
              {isLoading ? (
                <SkeletonWorkers />
              ) : displayedWorkers.length === 0 ? (
                <p className="empty-msg">
                  No technicians found in this category.
                </p>
              ) : (
                displayedWorkers.map((tech) => (
                  <div
                    className="worker-card"
                    key={tech._id}
                    onClick={() => navigate(`/worker/${tech._id}`)}
                  >
                    <div className="worker-avatar">
                      {getInitials(tech.name)}
                    </div>
                    <div className="worker-info">
                      <p className="worker-name">{tech.name}</p>
                      <p className="worker-specialty">
                        {tech.specialty || "Technician"}
                      </p>
                    </div>
                    <div className="worker-meta">
                      <StarRating rating={tech.technician_rate} />
                    </div>
                    <div className="worker-arrow">
                      <ChevronRight size={15} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            {/* How It Works */}
            <div className="how-it-works-card">
              <h4>How it works</h4>
              <div className="steps-list">
                {[
                  {
                    icon: <Search size={14} />,
                    title: "Choose a service",
                    desc: "Pick the type of work you need done",
                  },
                  {
                    icon: <MapPin size={14} />,
                    title: "Set your location",
                    desc: "We find professionals near you",
                  },
                  {
                    icon: <CalendarCheck size={14} />,
                    title: "Book a technician",
                    desc: "Pick a time slot that works for you",
                  },
                  {
                    icon: <CheckCircle size={14} />,
                    title: "Job done!",
                    desc: "Rate your experience afterward",
                  },
                ].map((step, idx) => (
                  <div className="step-item" key={idx}>
                    <div className="step-num">{step.icon}</div>
                    <div className="step-body">
                      <p className="step-title">{step.title}</p>
                      <p className="step-desc">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Card */}
            <div className="promo-card">
              <div className="promo-tag">Limited offer</div>
              <h4>First booking free inspection</h4>
              <p>
                New clients get a complimentary diagnostic with their first
                service appointment.
              </p>
              <button className="promo-btn">
                Book now <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {selectedService && (
        <div className="modal-overlay" onClick={() => setSelectedService(null)}>
          <div
            className="custom-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h4>{selectedService.name} Experts</h4>
              <button
                className="modal-close"
                onClick={() => setSelectedService(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="workers-list">
              {loadingServiceWorkers ? (
                <SkeletonWorkers />
              ) : serviceWorkers.length === 0 ? (
                <p className="empty-msg">No technicians found.</p>
              ) : (
                serviceWorkers.map((tech) => (
                  <div
                    className="worker-card"
                    key={tech._id}
                    onClick={() => {
                      setSelectedService(null);
                      navigate(`/worker/${tech._id}`);
                    }}
                  >
                    <div className="worker-avatar">
                      {getInitials(tech.name)}
                    </div>
                    <div className="worker-info">
                      <p className="worker-name">{tech.name}</p>
                      <p className="worker-specialty">
                        {tech.specialty || "Technician"}
                      </p>
                    </div>
                    <div className="worker-meta">
                      <StarRating rating={tech.technician_rate} />
                    </div>
                    <div className="worker-arrow">
                      <ChevronRight size={15} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}