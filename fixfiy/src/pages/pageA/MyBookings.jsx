import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  MessageSquare,
  Loader2,
  AlertCircle,
  Calendar,
  CreditCard,
  Star,
  XCircle,
  Eye,
} from "lucide-react";

import API from "../../services/api";

import "./MyBookings.css";

const MyBookings = () => {

  const [jobs, setJobs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const navigate =
    useNavigate();

  // ================= ROLE =================

  const userRole = (
    localStorage.getItem(
      "role"
    ) ||
    localStorage.getItem(
      "userRole"
    )
  )?.toLowerCase();

  useEffect(() => {

    if (
      userRole !== "client"
    ) {

      navigate("/");
      return;
    }

    fetchJobs();

  }, [userRole]);

  // ================= FETCH =================

  const fetchJobs =
    async () => {

      setLoading(true);

      setError(null);

      try {

        const res =
          await API.get(
            "/jobs"
          );

        const fetchedJobs =
          res.data.data ||
          res.data;

        setJobs(
          Array.isArray(
            fetchedJobs
          )
            ? fetchedJobs
            : []
        );

      } catch (err) {

        console.error(
          err.response?.data
        );

        setError(
          err.response?.data
            ?.message ||
            "Failed to load jobs."
        );

        setJobs([]);

      } finally {

        setLoading(false);
      }
    };

  // ================= CANCEL =================

  const handleCancel =
    async (jobId) => {

      const confirm =
        window.confirm(
          "Are you sure you want to cancel this job?"
        );

      if (!confirm)
        return;

      try {

        await API.patch(
          `/jobs/${jobId}/cancel`,
          {
            reason:
              "Canceled by client",
          }
        );

        alert(
          "Job canceled successfully"
        );

        fetchJobs();

      } catch (err) {

        alert(
          err.response?.data
            ?.message ||
            "Failed to cancel job"
        );
      }
    };

  // ================= CHAT =================

  const handleChat = (
    jobId,
    workerId
  ) => {

   navigate(
  `/chat?jobId=${jobId}&type=JOB`
);
  };

  // ================= PAYMENT =================

  const handlePayment =
    (jobId) => {

      navigate(
        `/payments?jobId=${jobId}`
      );
    };

  // ================= STATUS =================

  const getStatusClass =
    (status) => {

      switch (status) {

        case "PENDING":
          return "pending";

        case "ACCEPTED":
          return "accepted";

        case "ACTIVE":
          return "active";

        case "DONE":
          return "done";

        case "CANCELED":
          return "canceled";

        case "REJECTED":
          return "rejected";

        default:
          return "";
      }
    };

  if (
    userRole !== "client"
  )
    return null;

  return (

    <div className="bookings-container">

      <div className="my-bookings-container">

        {/* HEADER */}

        <div className="bookings-header">

          <div>

            <h2>
              My Jobs
            </h2>

            <p>
              Manage all your bookings and payments
            </p>

          </div>

        </div>

        {/* LOADING */}

        {loading && (

          <div className="loading-state">

            <Loader2 className="spinner" />

            <p>
              Fetching your jobs...
            </p>

          </div>
        )}

        {/* ERROR */}

        {error && (

          <div className="error-banner">

            <AlertCircle
              size={18}
            />

            <span>
              {error}
            </span>

          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
          jobs.length === 0 && (

          <div className="empty-state">

            <Calendar
              size={55}
            />

            <h3>
              No Jobs Yet
            </h3>

            <p>
              You haven't created any jobs yet.
            </p>

            <button
              className="book-now-btn"
              onClick={() =>
                navigate(
                  "/booking"
                )
              }
            >
              Create Job
            </button>

          </div>
        )}

        {/* JOBS */}

        {!loading &&
          !error &&
          jobs.length > 0 && (

          <div className="bookings-cards">

            {jobs.map(
              (job) => {

                const totalPrice =
                  Number(
                    job.total_price
                  ) || 0;

                const depositAmount =
                  Number(
                    job.depositAmount
                  ) || 0;

                return (

                  <div
                    key={job._id}
                    className="modern-booking-card"
                  >

                    {/* TOP */}

                    <div className="modern-card-top">

                      <div>

                        <div className="job-title-row">

                          <h3>
                            {job.title}
                          </h3>

                          <span className="job-price">

                            {totalPrice.toFixed(
                              2
                            )}{" "}
                            EGP

                          </span>

                        </div>

                        <p className="job-date">

                          Created{" "}
                          {new Date(
                            job.createdAt
                          ).toLocaleDateString()}

                        </p>

                      </div>

                      <div className="job-badges">

                        <span
                          className={`modern-status ${getStatusClass(
                            job.status
                          )}`}
                        >
                          {job.status}
                        </span>

                        <span className="booking-type-badge">

                          {job.bookingType ===
                          "OPEN"
                            ? "OPEN REQUEST"
                            : "DIRECT"}

                        </span>

                      </div>

                    </div>

                    {/* BODY */}

                    <div className="modern-job-body">

                      <div className="modern-job-row">

                        <span>
                          Service
                        </span>

                        <strong>
                          {job.serviceId
                            ?.name || "N/A"}
                        </strong>

                      </div>

                      <div className="modern-job-row">

                        <span>
                          Technician
                        </span>

                        <strong>

                          {job.workerId
                            ?.name ||

                            (job.bookingType ===
                            "OPEN"
                              ? "Waiting for proposals"
                              : "N/A")}

                        </strong>

                      </div>

                      <div className="modern-job-row">

                        <span>
                          Deposit
                        </span>

                        <strong>

                          {depositAmount.toFixed(
                            2
                          )}{" "}
                          EGP

                        </strong>

                      </div>

                      <div className="modern-job-row">

                        <span>
                          Payment Status
                        </span>

                        <strong>
                          {
                            job.paymentStatus
                          }
                        </strong>

                      </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="modern-actions">

                      {/* PROPOSALS */}

                      {job.bookingType ===
                        "OPEN" &&
                        job.status ===
                          "PENDING" && (

                        <button
                          className="modern-btn primary"
                          onClick={() =>
                            navigate(
                              `/jobs/${job._id}/proposals`
                            )
                          }
                        >

                          <Eye size={17} />

                          Proposals

                        </button>
                      )}

                      {/* PAY */}

                      {job.paymentStatus ===
                        "UNPAID" &&
                        job.workerId && (

                        <button
                          className="modern-btn success"
                          onClick={() =>
                            handlePayment(
                              job._id
                            )
                          }
                        >

                          <CreditCard
                            size={17}
                          />

                          Pay Deposit

                        </button>
                      )}

                      {/* FINAL */}

                      {job.status ===
                        "DONE" &&
                        job.paymentStatus ===
                          "DEPOSIT_PAID" && (

                        <button
                          className="modern-btn warning"
                          onClick={() =>
                            handlePayment(
                              job._id
                            )
                          }
                        >

                          <CreditCard
                            size={17}
                          />

                          Pay Remaining

                        </button>
                      )}

                     {/* REVIEW */}

{job.status === "DONE" &&
  !job.reviewId && (

  <button
    className="modern-btn review"
    onClick={() =>
      navigate(
        `/review/${job._id}`
      )
    }
  >

    <Star size={17} />

    Write Review

  </button>
)}

                      {/* CHAT */}

                      {(job.status ===
                        "ACCEPTED" ||
                        job.status ===
                          "ACTIVE") &&
                        job.workerId
                          ?._id && (

                        <button
                          className="modern-btn dark"
                          onClick={() =>
                            handleChat(
                              job._id,
                              job.workerId
                                ._id
                            )
                          }
                        >

                          <MessageSquare
                            size={17}
                          />

                          Chat

                        </button>
                      )}

                      {/* CANCEL */}

                      {job.status ===
                        "PENDING" && (

                        <button
                          className="modern-btn danger"
                          onClick={() =>
                            handleCancel(
                              job._id
                            )
                          }
                        >

                          <XCircle
                            size={17}
                          />

                          Cancel

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

    </div>
  );
};

export default MyBookings;