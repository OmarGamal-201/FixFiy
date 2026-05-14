
import React, {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import API from "../../services/api";

import {
  Clock,
  MapPin,
  DollarSign,
  Send,
  X,
  User,
  CheckCircle,
  Eye,
} from "lucide-react";

const OpenJobCard = ({
  job,
}) => {

  const navigate =
    useNavigate();

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

  if (!job?.clientId) {
    return null;
  }

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

        window.location.reload();

      } catch (err) {

        console.log(err);

        setError(
          err.response?.data
            ?.message ||
            "Failed to send proposal"
        );

      } finally {

        setLoading(false);
      }
    };

  return (
    <>
      <div
        className="card border-0 shadow-sm h-100"
        style={{
          borderRadius: "24px",
          overflow: "hidden",
        }}
      >

        {/* TOP */}

        <div
          style={{
            background:
              "linear-gradient(135deg,#6C4DFF,#8B5CF6)",
            padding: "24px",
            color: "#fff",
          }}
        >

          <div className="d-flex justify-content-between align-items-start">

            <div>

              <h3 className="fw-bold mb-2">
                {job.title}
              </h3>

              <div
                className="d-inline-flex align-items-center gap-2"
                style={{
                  background:
                    "rgba(255,255,255,.15)",
                  padding:
                    "8px 14px",
                  borderRadius:
                    "30px",
                }}
              >

                <DollarSign size={16} />

                <span>
                  {job.total_price} EGP
                </span>

              </div>

            </div>

            <span
              className="badge"
              style={{
                background:
                  "#fff",
                color:
                  "#6C4DFF",
                padding:
                  "10px 16px",
                borderRadius:
                  "30px",
                fontWeight:
                  "700",
              }}
            >
              OPEN
            </span>

          </div>

        </div>

        <div className="card-body p-4">

          {/* CLIENT */}

          <div
            className="d-flex align-items-center justify-content-between mb-4"
          >

            <div className="d-flex align-items-center gap-3">

              <div
                onClick={() =>
                  navigate(
                    `/client/${job.clientId?._id}`
                  )
                }
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  cursor: "pointer",
                  background:
                    "#6C4DFF",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "700",
                  flexShrink: 0,
                }}
              >

                {
                  job.clientId
                    ?.profilePicture?.[0]
                    ?.url ? (

                    <img
                      src={
                        job.clientId
                          ?.profilePicture?.[0]
                          ?.url
                      }
                      alt="client"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit:
                          "cover",
                      }}
                    />

                  ) : (

                    job.clientId?.name
                      ?.charAt(0)
                      ?.toUpperCase()
                  )
                }

              </div>

              <div>

                <h5 className="fw-bold mb-1">
                  {
                    job.clientId
                      ?.name
                  }
                </h5>

                <div className="d-flex align-items-center gap-2 text-muted">

                  <MapPin size={15} />

                  <span>
                    {
                      job.clientId
                        ?.address
                        ?.city
                    }
                  </span>

                </div>

              </div>

            </div>

            <button
              className="btn btn-light border"
              onClick={() =>
                navigate(
                  `/client/${job.clientId?._id}`
                )
              }
            >

              <Eye size={17} />

            </button>

          </div>

          {/* DESCRIPTION */}

          <div
            className="mb-4"
            style={{
              background:
                "#f8fafc",
              borderRadius:
                "18px",
              padding: "18px",
            }}
          >

            <h6 className="fw-bold mb-3">
              Job Description
            </h6>

            <p
              className="text-muted mb-0"
              style={{
                lineHeight:
                  "1.8",
              }}
            >
              {job.description}
            </p>

          </div>

          {/* INFO */}

          <div className="mb-4">

            <div className="d-flex align-items-center gap-2 mb-3">

              <Clock size={18} />

              <span>
                Posted:
                {" "}
                {new Date(
                  job.createdAt
                ).toLocaleDateString()}
              </span>

            </div>

            <div className="d-flex align-items-center gap-2">

              <User size={18} />

              <span>
                Booking:
                {" "}
                {
                  job.bookingType
                }
              </span>

            </div>

          </div>

          {/* ACTION */}

          {
            job.alreadyApplied ? (

              <div
                className="d-flex align-items-center justify-content-center gap-2"
                style={{
                  background:
                    "#ecfdf3",
                  color:
                    "#15803d",
                  padding:
                    "14px",
                  borderRadius:
                    "14px",
                  fontWeight:
                    "700",
                }}
              >

                <CheckCircle
                  size={18}
                />

                Proposal already submitted

              </div>

            ) : (

              <button
                className="btn w-100 fw-semibold"
                style={{
                  background:
                    "#6C4DFF",
                  color:
                    "#fff",
                  borderRadius:
                    "14px",
                  padding:
                    "14px",
                }}
                onClick={() =>
                  setShowModal(true)
                }
              >

                <Send size={18} />

                <span className="ms-2">
                  Send Proposal
                </span>

              </button>
          )}

        </div>
      </div>

      {/* MODAL */}

      {showModal && (

        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            background:
              "rgba(0,0,0,.45)",
            zIndex: 9999,
          }}
        >

          <div
            className="bg-white"
            style={{
              width: "500px",
              borderRadius:
                "24px",
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
                  setShowModal(false)
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
                    Estimated Duration
                  </label>

                  <input
                    type="number"
                    name="estimatedDuration"
                    className="form-control"
                    value={
                      form.estimatedDuration
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

              </div>

              <div className="p-4 border-top d-flex gap-3">

                <button
                  type="button"
                  className="btn btn-light w-50"
                  onClick={() =>
                    setShowModal(false)
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
                    color:
                      "#fff",
                  }}
                >
                  {
                    loading
                      ? "Sending..."
                      : "Send Proposal"
                  }
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
