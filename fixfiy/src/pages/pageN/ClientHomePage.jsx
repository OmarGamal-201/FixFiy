import React, {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Star,
  MapPin,
  CalendarCheck,
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
  {
    name: "appliance_repair",
    category: "appliance_repair",
  },
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

  const rounded =
    Math.round(rating || 0);

  return (

    <div className="star-rating">

      {[...Array(5)].map((_, i) => (

        <Star
          key={i}
          size={12}
          fill={
            i < rounded
              ? "#F59E0B"
              : "none"
          }
          color={
            i < rounded
              ? "#F59E0B"
              : "#CBD5E1"
          }
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

        <div
          className="skeleton-worker"
          key={i}
        >

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

function WorkerCard({
  tech,
  navigate,
}) {

  return (

    <div
      className="worker-card"
      onClick={() =>
        navigate(
          `/worker/${tech._id}`
        )
      }
    >

      <div className="worker-avatar">

        {tech?.profilePicture?.[0]
          ?.url ? (

          <img
            src={
              tech.profilePicture[0]
                .url
            }
            alt={tech.name}
            className="worker-avatar-img"
          />

        ) : (

          <div className="worker-avatar-placeholder">

            {getInitials(
              tech.name
            )}

          </div>

        )}

        <div className="online-dot" />

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
          rating={
            tech.technician_rate
          }
        />

      </div>

      <div className="worker-arrow">

        <ChevronRight
          size={16}
        />

      </div>

    </div>
  );
}

export default function ClientHomePage() {

  const navigate =
    useNavigate();

  const [
    nearbyWorkers,
    setNearbyWorkers,
  ] = useState([]);

  const [
    topWorkers,
    setTopWorkers,
  ] = useState([]);

  const [
    allWorkers,
    setAllWorkers,
  ] = useState([]);

  const [selectedService,
    setSelectedService] =
    useState(null);

  const [loading,
    setLoading] =
    useState(true);

  const CATEGORY_TO_SPECIALTY = {
    plumbing: "Plumber",
    electrical: "Electricity",
    carpentry: "Carpinter",
    painting: "Painter",
    hvac: "hvac",
    appliance_repair:
      "appliance_repair",
    general: "general",
  };

  useEffect(() => {

    updateLocation();

    fetchWorkers();

  }, []);

  /* ================= UPDATE LOCATION ================= */

  const updateLocation = () => {

    if (
      !navigator.geolocation
    ) {
      console.log(
        "Geolocation not supported"
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        try {

          const lat =
            position.coords.latitude;

          const lng =
            position.coords.longitude;

          await API.put(
            "/profile/update-location",
            {
              coordinates: [
                lng,
                lat,
              ],
            }
          );

        } catch (err) {

          console.log(
            "Location update error",
            err
          );
        }
      },

      (err) => {

        console.log(
          "Location permission denied",
          err
        );
      }
    );
  };

  /* ================= FETCH WORKERS ================= */

  const fetchWorkers =
    async (specialty = "") => {

      try {

        setLoading(true);

        let nearestUrl =
          "/profile/nearest";

        let allUrl =
          "/profile";

        if (specialty) {

          nearestUrl +=
            `?specialty=${specialty}`;

          allUrl +=
            `?specialty=${specialty}`;
        }

        /* ===== NEARBY ===== */

        const nearestRes =
          await API.get(
            nearestUrl
          );

        const nearest =
          Array.isArray(
            nearestRes.data.data
          )
            ? nearestRes.data.data
            : [];

        setNearbyWorkers(
          nearest
        );

        /* ===== ALL ===== */

        const allRes =
          await API.get(
            allUrl
          );

        const all =
          Array.isArray(
            allRes.data.data
          )
            ? allRes.data.data
            : [];

        setAllWorkers(all);

        /* ===== TOP ===== */

        const sorted =
          [...all].sort(
            (a, b) =>
              (b.technician_rate || 0) -
              (a.technician_rate || 0)
          );

        setTopWorkers(
          sorted.slice(0, 6)
        );

      } catch (err) {

        console.log(err);

        setNearbyWorkers([]);
        setTopWorkers([]);
        setAllWorkers([]);

      } finally {

        setLoading(false);
      }
    };

  /* ================= FILTER ================= */

  const handleServiceClick =
    async (service) => {

      setSelectedService(
        service
      );

      const specialty =
        CATEGORY_TO_SPECIALTY[
          service.category
        ] || service.name;

      await fetchWorkers(
        specialty
      );
    };

  const clearFilter =
    async () => {

      setSelectedService(
        null
      );

      await fetchWorkers();
    };

  return (

    <div className="client-home-container">

      {/* HERO */}

      <div className="welcome-banner">

        <div className="welcome-text">

          <div className="hero-badge">

            <BadgeCheck
              size={14}
            />

            Trusted professionals

          </div>

          <h3>
            Find trusted technicians
          </h3>

          <p>
            Discover nearby verified workers
            based on your location.
          </p>

        </div>

      </div>

      {/* CONTENT */}

      <div className="page-content">

        {/* SERVICES */}

        <div className="services-wrapper">

          {DEFAULT_SERVICES.map(
            (service) => (

              <button
                key={service.name}
                className={`service-pill ${
                  selectedService?.name ===
                  service.name
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleServiceClick(
                    service
                  )
                }
              >

                <div className="service-pill-icon">

                  {serviceIcons[
                    service.name
                  ] || (
                    <Wrench
                      size={22}
                    />
                  )}

                </div>

                <span className="service-pill-name">

                  {service.name}

                </span>

              </button>
            )
          )}

          {selectedService && (

            <button
              className="clear-filter-btn"
              onClick={
                clearFilter
              }
            >

              Clear Filter

            </button>
          )}

        </div>

        {/* LOWER */}

        <div className="lower-section">

          <div className="workers-sections">

            {/* NEARBY */}

            {nearbyWorkers.length > 0 && (

              <div className="workers-panel">

                <div className="workers-panel-header">

                  <div>

                    <p className="section-title">

                      Nearby Workers

                    </p>

                    <p className="section-subtitle">

                      Workers close to your location

                    </p>

                  </div>

                </div>

                <div className="workers-list">

                  {loading ? (

                    <SkeletonWorkers />

                  ) : (

                    nearbyWorkers.map(
                      (tech) => (

                        <WorkerCard
                          key={tech._id}
                          tech={tech}
                          navigate={navigate}
                        />

                      )
                    )
                  )}

                </div>

              </div>
            )}

            {/* TOP */}

            <div className="workers-panel">

              <div className="workers-panel-header">

                <div>

                  <p className="section-title">

                    Top Rated Workers

                  </p>

                  <p className="section-subtitle">

                    Highest rated technicians

                  </p>

                </div>

              </div>

              <div className="workers-list">

                {loading ? (

                  <SkeletonWorkers />

                ) : (

                  topWorkers.map(
                    (tech) => (

                      <WorkerCard
                        key={tech._id}
                        tech={tech}
                        navigate={navigate}
                      />

                    )
                  )
                )}

              </div>

            </div>

            {/* ALL */}

            <div className="workers-panel full-width">

              <div className="workers-panel-header">

                <div>

                  <p className="section-title">

                    All Workers

                  </p>

                  <p className="section-subtitle">

                    Browse all available technicians

                  </p>

                </div>

              </div>

              <div className="workers-list">

                {loading ? (

                  <SkeletonWorkers />

                ) : allWorkers.length ===
                  0 ? (

                  <p className="empty-msg">

                    No technicians found

                  </p>

                ) : (

                  allWorkers.map(
                    (tech) => (

                      <WorkerCard
                        key={tech._id}
                        tech={tech}
                        navigate={navigate}
                      />

                    )
                  )
                )}

              </div>

            </div>

          </div>

          {/* SIDEBAR */}

          <div className="sidebar">

            <div className="how-it-works-card">

              <h4>
                How it works
              </h4>

              <div className="steps-list">

                {[
                  {
                    icon:
                      <MapPin
                        size={14}
                      />,
                    title:
                      "Enable location",
                    desc:
                      "Allow location access",
                  },
                  {
                    icon:
                      <Wrench
                        size={14}
                      />,
                    title:
                      "Choose service",
                    desc:
                      "Select your needed service",
                  },
                  {
                    icon:
                      <CalendarCheck
                        size={14}
                      />,
                    title:
                      "Book worker",
                    desc:
                      "Send booking request",
                  },
                  {
                    icon:
                      <CheckCircle
                        size={14}
                      />,
                    title:
                      "Done",
                    desc:
                      "Rate your experience",
                  },
                ].map(
                  (
                    step,
                    idx
                  ) => (

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
                  )
                )}

              </div>

            </div>

            {/* PROMO */}

            <div className="promo-card">

              <div className="promo-tag">

                Nearby experts

              </div>

              <h4>

                Find skilled workers around you

              </h4>

              <p>

                Get matched with trusted nearby
                technicians instantly.

              </p>

              <button
                className="promo-btn"
                onClick={() =>
                  navigate(
                    "/create-job"
                  )
                }
              >

                Create Job

                <ArrowRight
                  size={15}
                />

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}