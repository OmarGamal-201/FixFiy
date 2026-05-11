import React, { useState } from "react";
import API from "../../services/api";

const ProposalForm = ({
  jobId,
  jobPrice,
  onClose,
}) => {

  const [formData, setFormData] =
    useState({
      message: "",
      estimatedDuration: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleChange = (e) => {

    setFormData({
      ...formData,
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

          jobId,

          message:
            formData.message,

          estimatedDuration:
            Number(
              formData.estimatedDuration
            ),
        }
      );

      alert(
        "Proposal sent successfully"
      );

      onClose();

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
    <div
      className="modal d-block"
      style={{
        background:
          "rgba(0,0,0,0.5)",
        backdropFilter:
          "blur(3px)",
      }}
    >

      <div className="modal-dialog modal-dialog-centered">

        <div
          className="modal-content border-0"
          style={{
            borderRadius:
              "24px",
            overflow:
              "hidden",
          }}
        >

          {/* HEADER */}

          <div
            className="modal-header border-0"
            style={{
              padding:
                "24px 28px",
            }}
          >

            <div>

              <h3 className="fw-bold mb-1">
                Send Proposal
              </h3>

              <p className="text-muted mb-0">
                Submit your offer for this job
              </p>

            </div>

            <button
              className="btn-close"
              onClick={onClose}
            />
          </div>

          <form onSubmit={handleSubmit}>

            <div
              className="modal-body"
              style={{
                padding:
                  "0 28px 24px",
              }}
            >

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              {/* MESSAGE */}

              <div className="mb-4">

                <label className="form-label fw-semibold mb-2">
                  Your Message
                </label>

                <textarea
                  className="form-control"
                  rows="5"
                  name="message"
                  placeholder="Describe your experience and explain why you're suitable for this job..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  style={{
                    borderRadius:
                      "14px",
                    padding:
                      "14px",
                  }}
                />
              </div>

              {/* DURATION */}

              <div className="mb-4">

                <label className="form-label fw-semibold mb-2">
                  Estimated Duration (hours)
                </label>

                <input
                  type="number"
                  className="form-control"
                  name="estimatedDuration"
                  placeholder="Example: 3"
                  value={
                    formData.estimatedDuration
                  }
                  onChange={handleChange}
                  required
                  style={{
                    borderRadius:
                      "14px",
                    height:
                      "52px",
                  }}
                />
              </div>

              {/* FIXED PRICE */}

              <div
                className="p-4"
                style={{
                  background:
                    "#F5F3FF",
                  borderRadius:
                    "18px",
                }}
              >

                <p className="text-muted mb-2">
                  Fixed Service Price
                </p>

                <h2
                  className="fw-bold mb-1"
                  style={{
                    color:
                      "#6C4DFF",
                  }}
                >
                  {jobPrice} EGP
                </h2>

                <small className="text-muted">
                  The service price is fixed by the platform.
                </small>

              </div>

            </div>

            {/* FOOTER */}

            <div
              className="modal-footer border-0"
              style={{
                padding:
                  "0 28px 28px",
              }}
            >

              <button
                type="button"
                className="btn btn-light"
                onClick={onClose}
                style={{
                  borderRadius:
                    "14px",
                  padding:
                    "12px 24px",
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn"
                disabled={loading}
                style={{
                  background:
                    "#6C4DFF",
                  color: "#fff",
                  borderRadius:
                    "14px",
                  padding:
                    "12px 28px",
                  fontWeight:
                    "600",
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
    </div>
  );
};

export default ProposalForm;