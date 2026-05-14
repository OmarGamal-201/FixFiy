import React, {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle,
  XCircle,
  PlayCircle,
  BadgeCheck,
  MessageSquare,
  Briefcase,
  AlertCircle,
  MapPin,
  User,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import API from "../../services/api";

import "./TechnicianJobs.css";

const TechnicianJobs = () => {

  const navigate =
    useNavigate();

  const [jobs, setJobs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  // ================= FETCH =================

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {

    try {

      setLoading(true);

      setError("");

      const res =
        await API.get(
          "/jobs"
        );

      setJobs(
        res.data.data || []
      );

    } catch (err) {

      console.log(err);

      setError(
        err.response?.data
          ?.message ||
          "Failed to fetch jobs"
      );

    } finally {

      setLoading(false);
    }
  };

  // ================= ACTIONS =================

  const handleAccept =
    async (id) => {

      try {

        await API.patch(
          `/jobs/${id}/accept`
        );

        fetchJobs();

      } catch (err) {

        alert(
          err.response?.data
            ?.message
        );
      }
    };

  const handleReject =
    async (id) => {

      try {

        await API.patch(
          `/jobs/${id}/reject`
        );

        fetchJobs();

      } catch (err) {

        alert(
          err.response?.data
            ?.message
        );
      }
    };

  const handleStart =
    async (id) => {

      try {

        await API.patch(
          `/jobs/${id}/start`
        );

        fetchJobs();

      } catch (err) {

        alert(
          err.response?.data
            ?.message
        );
      }
    };

  const handleComplete =
    async (id) => {

      try {

        await API.patch(
          `/jobs/${id}/complete`
        );

        fetchJobs();

      } catch (err) {

        alert(
          err.response?.data
            ?.message
        );
      }
    };

  // ================= FILTER =================

  const filteredJobs =
    statusFilter === "ALL"
      ? jobs
      : jobs.filter(
          (job) =>
            job.status ===
            statusFilter
        );

  return (

    <div className="tech-jobs-page">

      {/* HEADER */}

      <div className="tech-jobs-header">

        <div>

          <h2>
            My Jobs
          </h2>

          <p>
            Manage your assigned jobs
          </p>

        </div>

      </div>

      {/* FILTERS */}

      <div className="jobs-filters">

        {[
          "ALL",
          "PENDING",
          "ACCEPTED",
          "ACTIVE",
          "DONE",
        ].map((item) => (

          <button
            key={item}
            className={`filter-btn ${
              statusFilter ===
              item
                ? "active"
                : ""
            }`}
            onClick={() =>
              setStatusFilter(
                item
              )
            }
          >
            {item}
          </button>

        ))}

      </div>

      {/* ERROR */}

      {error && (

        <div className="error-box">

          <AlertCircle
            size={18}
          />

          <span>
            {error}
          </span>

        </div>
      )}

      {/* LOADING */}

      {loading ? (

        <div className="loading-box">
          Loading jobs...
        </div>

      ) : filteredJobs.length === 0 ? (

        <div className="empty-box">

          <Briefcase
            size={55}
          />

          <h3>
            No Jobs Found
          </h3>

          <p>
            There are no jobs in this category yet.
          </p>

        </div>

      ) : (

        <div className="jobs-grid">

          {filteredJobs.map(
            (job) => {

              const totalPrice =
                Number(
                  job.total_price
                ) || 0;

              return (

                <div
                  key={job._id}
                  className="tech-job-card"
                >

                  {/* TOP */}

                  <div className="job-card-top">

                    <div>

                      <h3>
                        {job.title}
                      </h3>

                      <p>
                        {
                          job.serviceId
                            ?.name
                        }
                      </p>

                    </div>

                    <div className="d-flex gap-2 flex-wrap">

                      <span
                        className={`status-pill ${job.status.toLowerCase()}`}
                      >
                        {job.status}
                      </span>

                      <span className="booking-pill">

                        {job.bookingType}

                      </span>

                    </div>

                  </div>

                  {/* CLIENT PREVIEW */}

                  <div className="client-preview">

                    <div
                      className="client-avatar"
                      onClick={() =>
                        navigate(
                          `/client/${job.clientId?._id}`
                        )
                      }
                    >

                      {job.clientId
                        ?.profilePicture?.[0]
                        ?.url ? (

                        <img
                          src={
                            job.clientId
                              ?.profilePicture?.[0]
                              ?.url
                          }
                          alt="client"
                        />

                      ) : (

                        <span>

                          {job.clientId?.name
                            ?.charAt(0)
                            ?.toUpperCase()}

                        </span>

                      )}

                    </div>

                    <div className="client-info">

                      <h4>
                        {
                          job.clientId
                            ?.name
                        }
                      </h4>

                      <p>

                        <MapPin
                          size={14}
                        />

                        {
                          job.clientId
                            ?.address
                            ?.city
                        }

                      </p>

                      <button
                        className="view-client-btn"
                        onClick={() =>
                          navigate(
                            `/client/${job.clientId?._id}`
                          )
                        }
                      >
                        <User
                          size={15}
                        />

                        View Profile

                      </button>

                    </div>

                  </div>

                  {/* BODY */}

                  <div className="job-card-body">

                    <div className="job-row">

                      <span>
                        Price
                      </span>

                      <strong>
                        {totalPrice.toFixed(
                          2
                        )}{" "}
                        EGP
                      </strong>

                    </div>

                    <div className="job-row">

                      <span>
                        Payment
                      </span>

                      <strong>
                        {
                          job.paymentStatus
                        }
                      </strong>

                    </div>

                  </div>

                  {/* ACTIONS */}


{
  job.status === "PENDING" &&
  job.paymentStatus !== "DEPOSIT_PAID" && (

    <div className="deposit-warning">

      Waiting for client deposit payment

    </div>
)}

<div className="job-actions">

  {
    job.status === "PENDING" &&
    job.paymentStatus === "DEPOSIT_PAID" && (

      <>
        <button
          className="job-btn success"
          onClick={() =>
            handleAccept(
              job._id
            )
          }
        >

          <CheckCircle
            size={17}
          />

          Accept

        </button>

        <button
          className="job-btn danger"
          onClick={() =>
            handleReject(
              job._id
            )
          }
        >

          <XCircle
            size={17}
          />

          Reject

        </button>
      </>
  )}

  {
    job.status === "ACCEPTED" && (

      <button
        className="job-btn primary"
        onClick={() =>
          handleStart(
            job._id
          )
        }
      >

        <PlayCircle
          size={17}
        />

        Start Job

      </button>
  )}

  {
    job.status === "ACTIVE" && (

      <button
        className="job-btn dark"
        onClick={() =>
          handleComplete(
            job._id
          )
        }
      >

        <BadgeCheck
          size={17}
        />

        Complete

      </button>
  )}

  {
    (
      job.status === "ACCEPTED" ||
      job.status === "ACTIVE"
    ) && (

      <button
        className="job-btn light"
        onClick={() =>
          navigate(
            `/chat?jobId=${job._id}&receiverId=${job.clientId?._id}`
          )
        }
      >

        <MessageSquare
          size={17}
        />

        Chat

      </button>
  )}

</div>


                </div>
              );
            }
          )}

        </div>
      )}

    </div>
  );
};

export default TechnicianJobs;