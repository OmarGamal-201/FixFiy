import React, { useState } from "react";

import API from "../../services/api";

import {
  Clock,
  MapPin,
  DollarSign,
  Send,
  X,
} from "lucide-react";

const OpenJobCard = ({ job }) => {

  const [showModal, setShowModal] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState({

      message: "",

      estimatedDuration: "",
    });

  const handleChange = (e) => {

    setForm({

      ...form,

      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      setError("");

      await API.post(
        "/proposals",
        {

          jobId: job._id,

          message:
            form.message,

          estimatedDuration:
            form.estimatedDuration,
        }
      );

      alert(
        "Proposal sent successfully"
      );

      setShowModal(false);

      setForm({
        message: "",
        estimatedDuration: "",
      });

    } catch (err) {

      console.log(err);

      if (
        err.response?.data?.errors
      ) {

        setError(
          err.response.data.errors.join(
            ", "
          )
        );

      } else {

        setError(
          err.response?.data
            ?.message ||
            "Failed to send proposal"
        );
      }

    } finally {

      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="card border-0 shadow-sm h-100"
        style={{
          borderRadius: "20px",
        }}
      >

        <div className="card-body p-4">

          <div className="d-flex justify-content-between align-items-start mb-3">

            <div>
              <h4 className="fw-bold mb-2">
                {job.title}
              </h4>

              <span
                className="badge"
                style={{
                  background:
                    "#6C4DFF",
                  color: "#fff",
                  borderRadius:
                    "20px",
                  padding:
                    "8px 14px",
                }}
              >
                OPEN
              </span>
            </div>

            <div className="text-end">

              <h4
                className="fw-bold"
                style={{
                  color:
                    "#6C4DFF",
                }}
              >
                {job.total_price} EGP
              </h4>

              <small className="text-muted">
                Fixed Price
              </small>
            </div>
          </div>

          <p className="text-muted mb-4">
            {job.description}
          </p>

          <div className="mb-3">

            <div className="d-flex align-items-center gap-2 mb-2">

              <DollarSign size={18} />

              <span>
                Service Price:
                {" "}
                <strong>
                  {
                    job.total_price
                  }{" "}
                  EGP
                </strong>
              </span>
            </div>

            <div className="d-flex align-items-center gap-2 mb-2">

              <MapPin size={18} />

              <span>
                Client:
                {" "}
                {
                  job.clientId
                    ?.name
                }
              </span>
            </div>

            <div className="d-flex align-items-center gap-2">

              <Clock size={18} />

              <span>
                Posted:
                {" "}
                {new Date(
                  job.createdAt
                ).toLocaleDateString()}
              </span>
            </div>
          </div>

          <button
            className="btn w-100 fw-semibold"
            style={{
              background:
                "#6C4DFF",
              color: "#fff",
              borderRadius:
                "14px",
              padding:
                "12px",
            }}
            onClick={() =>
              setShowModal(true)
            }
          >
            Send Proposal
          </button>
        </div>
      </div>

      {/* ================= MODAL ================= */}

      {showModal && (

        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            background:
              "rgba(0,0,0,0.45)",
            zIndex: 9999,
          }}
        >

          <div
            className="bg-white"
            style={{
              width: "500px",
              borderRadius:
                "20px",
              overflow:
                "hidden",
            }}
          >

            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">

              <h3 className="fw-bold mb-0">
                Send Proposal
              </h3>

              <button
                className="btn"
                onClick={() =>
                  setShowModal(
                    false
                  )
                }
              >
                <X />
              </button>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="p-4">

                {error && (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                )}

                <div className="mb-4">

                  <label className="fw-semibold mb-2">
                    Message
                  </label>

                  <textarea
                    name="message"
                    rows="5"
                    className="form-control"
                    placeholder="Describe your experience and how you can help..."
                    value={
                      form.message
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div className="mb-4">

                  <label className="fw-semibold mb-2">
                    Estimated Duration (hours)
                  </label>

                  <input
                    type="number"
                    name="estimatedDuration"
                    className="form-control"
                    placeholder="Example: 3"
                    value={
                      form.estimatedDuration
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>

                <div
                  className="p-3 mb-4"
                  style={{
                    background:
                      "#F4F1FF",
                    borderRadius:
                      "14px",
                  }}
                >

                  <p className="mb-1 fw-semibold">
                    Fixed Service Price
                  </p>

                  <h4
                    style={{
                      color:
                        "#6C4DFF",
                    }}
                  >
                    {
                      job.total_price
                    }{" "}
                    EGP
                  </h4>

                  <small className="text-muted">
                    The technician cannot change the service price.
                  </small>
                </div>

              </div>

              <div className="p-4 border-top d-flex gap-3">

                <button
                  type="button"
                  className="btn btn-light w-50"
                  onClick={() =>
                    setShowModal(
                      false
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn w-50"
                  disabled={loading}
                  style={{
                    background:
                      "#6C4DFF",
                    color: "#fff",
                  }}
                >
                  {loading
                    ? "Sending..."
                    : "Send Proposal"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default OpenJobCard;