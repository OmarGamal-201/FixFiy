import React, {
  useState,
  useEffect,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  MapPin,
  AlertCircle,
} from "lucide-react";

import "./Booking.css";
import API from "../../services/api";

const Booking = () => {

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const queryParams =
    new URLSearchParams(
      location.search
    );

  const serviceIdFromUrl =
    queryParams.get(
      "serviceId"
    ) || "";

  const workerIdFromUrl =
    queryParams.get(
      "workerId"
    ) || "";

  const [services, setServices] =
    useState([]);

  const [
    workerCategory,
    setWorkerCategory,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [status, setStatus] =
    useState({
      type: "",
      text: "",
    });

  const [
    bookingType,
    setBookingType,
  ] = useState(
    workerIdFromUrl
      ? "DIRECT"
      : "OPEN"
  );

  const [jobData, setJobData] =
    useState({
      title: "",
      description: "",
      category: "",
      price: "",
      serviceId:
        serviceIdFromUrl,
      workerId:
        workerIdFromUrl,
      location: null,
    });

  /* ================= SPECIALTY MAP ================= */

  const SPECIALTY_TO_CATEGORY = {
    Plumber: "plumbing",
    Electricity: "electrical",
    Painter: "painting",
    Carpinter: "carpentry",
    hvac: "hvac",
    appliance_repair:
      "appliance_repair",
    general: "general",
  };

  /* ================= LOCATION ================= */

  useEffect(() => {

    if (
      "geolocation" in navigator
    ) {

      navigator.geolocation.getCurrentPosition(

        (position) => {

          setJobData(
            (prev) => ({
              ...prev,

              location: {
                lat:
                  position.coords.latitude,

                lng:
                  position.coords.longitude,
              },
            })
          );
        },

        (error) =>
          console.error(
            "Location Error:",
            error
          )
      );
    }
  }, []);

  /* ================= SERVICES ================= */

  useEffect(() => {

    const fetchServices =
      async () => {

        try {

          const res =
            await API.get(
              "/services"
            );

          if (
            res.data.success
          ) {

            setServices(
              res.data.data
            );
          }

        } catch (error) {

          console.error(
            error
          );
        }
      };

    fetchServices();

  }, []);

  /* ================= WORKER ================= */

  useEffect(() => {

    const fetchWorker =
      async () => {

        if (
          !workerIdFromUrl
        )
          return;

        try {

          const res =
            await API.get(
              `/profile/${workerIdFromUrl}`
            );

          if (
            res.data.success
          ) {

            setWorkerCategory(
              res.data.data
                .specialty
            );
          }

        } catch (error) {

          console.error(
            error
          );
        }
      };

    fetchWorker();

  }, [workerIdFromUrl]);

  /* ================= PREFILL ================= */

  useEffect(() => {

    if (
      services.length > 0
    ) {

      const matchedService =
        services.find(
          (s) =>
            s._id ===
            serviceIdFromUrl
        );

      setJobData(
        (prev) => ({
          ...prev,

          serviceId:
            serviceIdFromUrl,

          workerId:
            workerIdFromUrl,

          category:
            matchedService
              ?.category || "",

          price:
            matchedService
              ?.base_price || 0,
        })
      );
    }

  }, [
    services,
    serviceIdFromUrl,
    workerIdFromUrl,
  ]);

  /* ================= FILTERED SERVICES ================= */

  const filteredServices =

    bookingType === "OPEN"

      ? services

      : workerCategory

      ? services.filter(
          (service) =>
            service.category ===
            SPECIALTY_TO_CATEGORY[
              workerCategory
            ]
        )

      : services;

  /* ================= CHANGE ================= */

  const handleChange = (
    e
  ) => {

    setJobData({
      ...jobData,

      [e.target.name]:
        e.target.value,
    });
  };

  /* ================= SERVICE CHANGE ================= */

  const handleServiceChange =
    (e) => {

      const selectedServiceId =
        e.target.value;

      const selectedService =
        services.find(
          (s) =>
            s._id ===
            selectedServiceId
        );

      setJobData(
        (prev) => ({
          ...prev,

          serviceId:
            selectedServiceId,

          category:
            selectedService
              ?.category || "",

          price:
            selectedService
              ?.base_price || 0,
        })
      );
    };

  /* ================= SUBMIT ================= */

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      const {
        title,
        description,
        serviceId,
        location,
      } = jobData;

      if (
        !title?.trim() ||
        !description?.trim() ||
        !serviceId
      ) {

        setStatus({
          type: "error",

          text:
            "Please fill all required fields.",
        });

        return;
      }

      if (
        bookingType ===
          "DIRECT" &&
        !jobData.workerId
      ) {

        setStatus({
          type: "error",

          text:
            "Please select a technician.",
        });

        return;
      }

      setLoading(true);

      try {

        const payload = {

          title:
            title.trim(),

          description:
            description.trim(),

          serviceId,

          location,

          bookingType,
        };

        if (
          bookingType ===
          "DIRECT"
        ) {

          payload.workerId =
            jobData.workerId;
        }

        const res =
          await API.post(
            "/jobs",
            payload
          );

        if (
          res.data.success
        ) {

          const createdJobId =
            res.data.data._id;

          setStatus({
            type: "success",

            text:
              bookingType ===
              "DIRECT"

                ? "Booking created successfully!"

                : "Open request created successfully!",
          });

          setTimeout(() => {

            if (
              bookingType ===
              "DIRECT"
            ) {

              navigate(
                `/payments?jobId=${createdJobId}`
              );
            }

            else {

              navigate(
                `/jobs/${createdJobId}/proposals`
              );
            }

          }, 1000);
        }

      } catch (error) {

        console.error(
          error.response?.data
        );

        setStatus({
          type: "error",

          text:
            error.response?.data
              ?.message ||

            "Error creating booking",
        });

      } finally {

        setLoading(false);
      }
    };

  return (
    <div className="booking-page">

      <div className="booking-container">

        <div className="booking-card">

          <h2>
            Create Booking
          </h2>

          {status.text && (

            <div
              className={`message-box ${status.type}`}
            >

              {status.type ===
                "error" && (
                <AlertCircle
                  size={16}
                />
              )}

              {status.text}
            </div>
          )}

          {/* BOOKING TYPE */}

          <div className="booking-type-section">

            <label>
              Booking Type
            </label>

            <div className="booking-type-options">

              {/* DIRECT */}

              <div
                className={`type-option ${
                  bookingType ===
                  "DIRECT"
                    ? "active"
                    : ""
                } ${
                  !workerIdFromUrl
                    ? "disabled"
                    : ""
                }`}
                onClick={() => {

                  if (
                    !workerIdFromUrl
                  )
                    return;

                  setBookingType(
                    "DIRECT"
                  );

                  setJobData(
                    (prev) => ({
                      ...prev,

                      workerId:
                        workerIdFromUrl,
                    })
                  );
                }}
              >

                <div className="type-icon">
                  📍
                </div>

                <div className="type-text">

                  <h4>
                    Direct Booking
                  </h4>

                  <p>
                    Book a specific technician
                  </p>

                </div>
              </div>

              {/* OPEN */}

              <div
                className={`type-option ${
                  bookingType ===
                  "OPEN"
                    ? "active"
                    : ""
                }`}
                onClick={() => {

                  setBookingType(
                    "OPEN"
                  );

                  setJobData(
                    (prev) => ({
                      ...prev,

                      workerId:
                        "",
                    })
                  );
                }}
              >

                <div className="type-icon">
                  🔓
                </div>

                <div className="type-text">

                  <h4>
                    Open Request
                  </h4>

                  <p>
                    Receive technician proposals
                  </p>

                </div>
              </div>
            </div>
          </div>

          {/* FORM */}

          <form
            onSubmit={
              handleSubmit
            }
          >

            <div className="location-info-bar">

              <MapPin
                size={16}
              />

              <span>
                {jobData.location

                  ? "Location captured successfully"

                  : "Capturing location..."}
              </span>

            </div>

            {/* TITLE */}

            <label>
              Job Title
            </label>

            <input
              type="text"
              name="title"
              value={
                jobData.title
              }
              onChange={
                handleChange
              }
              placeholder="Enter title"
              required
            />

            {/* DESCRIPTION */}

            <label>
              Description
            </label>

            <textarea
              name="description"
              value={
                jobData.description
              }
              onChange={
                handleChange
              }
              placeholder="Describe the issue..."
              required
            />

            {/* SERVICE */}

            <label>
              Service
            </label>

            <select
              name="serviceId"
              value={
                jobData.serviceId
              }
              onChange={
                handleServiceChange
              }
            >

              <option value="">
                Select Service
              </option>

              {filteredServices.map(
                (service) => (

                  <option
                    key={
                      service._id
                    }
                    value={
                      service._id
                    }
                  >
                    {service.name}
                  </option>
                )
              )}
            </select>

            {/* FIXED PRICE */}

            <label>
              Service Price
            </label>

            <input
              type="number"
              value={
                jobData.price
              }
              readOnly
              className="readonly-input"
            />

            {/* OPEN NOTE */}

            {bookingType ===
              "OPEN" && (

              <div className="open-booking-note">

                <small className="text-muted">

                  Technicians will compete using experience and response quality — not pricing.

                </small>

              </div>
            )}

            {/* BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
            >

              {loading

                ? "Processing..."

                : bookingType ===
                  "DIRECT"

                ? "Book Now"

                : "Post Request"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;