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

  // ================= ACCEPT =================

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

  // ================= REJECT =================

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

  // ================= START =================

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

  // ================= COMPLETE =================

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

                  {/* BODY */}

                  <div className="job-card-body">

                    <div className="job-row">

                      <span>
                        Client
                      </span>

                      <strong>
                        {
                          job.clientId
                            ?.name ||
                          "N/A"
                        }
                      </strong>

                    </div>

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

                  <div className="job-actions">

                    {/* ACCEPT */}

                    {job.status ===
                      "PENDING" && (

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
                    )}

                    {/* REJECT */}

                    {job.status ===
                      "PENDING" && (

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
                    )}

                    {/* START */}

                    {job.status ===
                      "ACCEPTED" && (

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

                    {/* COMPLETE */}

                    {job.status ===
                      "ACTIVE" && (

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

                    {/* CHAT */}

                    {(job.status ===
                      "ACCEPTED" ||
                      job.status ===
                        "ACTIVE") && (

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