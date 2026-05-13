import React, {
  useState,
} from "react";

import API from "../../services/api";

import "./BookServiceModal.css";

const BookServiceModal = ({
  worker,
  services,
  onClose,
}) => {

  const [form, setForm] =
    useState({

      title: "",

      description: "",

      serviceId: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const selectedService =
    services.find(
      (s) =>
        s._id ===
        form.serviceId
    );

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        setError("");

        await API.post(
          "/jobs",
          {

            title:
              form.title,

            description:
              form.description,

            serviceId:
              form.serviceId,

            workerId:
              worker._id,

            bookingType:
              "DIRECT",
          }
        );

        alert(
          "Booking created successfully"
        );

        onClose();

      } catch (err) {

        console.log(err);

        setError(
          err.response?.data
            ?.message ||
            "Failed to create booking"
        );

      } finally {

        setLoading(false);
      }
    };

  return (
    <div className="booking-modal-overlay">

      <div className="booking-modal-container">

        {/* HEADER */}

        <div className="booking-modal-header">

          <div>

            <h2>
              Book Service
            </h2>

            <p>
              Create a direct booking
              with{" "}
              {worker.name}
            </p>

          </div>

          <button
            className="close-booking-btn"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        {/* ERROR */}

        {error && (

          <div className="booking-error">

            {error}

          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={
            handleSubmit
          }
        >

          {/* SERVICE */}

          <div className="booking-field">

            <label>
              Select Service
            </label>

            <select
              name="serviceId"
              value={
                form.serviceId
              }
              onChange={
                handleChange
              }
              required
            >

              <option value="">
                Choose service
              </option>

              {services.map(
                (service) => (

                  <option
                    key={
                      service._id
                    }
                    value={
                      service._id
                    }
                  >

                    {service.name} —{" "}
                    {
                      service.base_price
                    }{" "}
                    EGP

                  </option>
                )
              )}

            </select>

          </div>

          {/* TITLE */}

          <div className="booking-field">

            <label>
              Job Title
            </label>

            <input
              type="text"
              name="title"
              value={
                form.title
              }
              onChange={
                handleChange
              }
              placeholder="Example: AC repair"
              required
            />

          </div>

          {/* DESCRIPTION */}

          <div className="booking-field">

            <label>
              Description
            </label>

            <textarea
              rows="5"
              name="description"
              value={
                form.description
              }
              onChange={
                handleChange
              }
              placeholder="Describe your issue..."
              required
            />

          </div>

          {/* PRICE */}

          {selectedService && (

            <div className="selected-price-box">

              <span>
                Service Price
              </span>

              <h3>

                {
                  selectedService.base_price
                }{" "}
                EGP

              </h3>

            </div>
          )}

          {/* ACTIONS */}

          <div className="booking-actions">

            <button
              type="button"
              className="cancel-booking-btn"
              onClick={
                onClose
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-booking-btn"
              disabled={
                loading
              }
            >

              {loading
                ? "Creating..."
                : "Confirm Booking"}

            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default BookServiceModal;