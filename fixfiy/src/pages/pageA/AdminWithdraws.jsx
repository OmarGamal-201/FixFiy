import React, {
  useEffect,
  useState,
} from "react";

import API from "../../services/api";

import {
  CheckCircle,
  XCircle,
  Clock3,
} from "lucide-react";

import "./AdminWithdraws.css";

export default function AdminWithdraws() {

  const [requests,
    setRequests] =
    useState([]);

  const [loading,
    setLoading] =
    useState(true);

  useEffect(() => {

    fetchRequests();

  }, []);

  const fetchRequests =
    async () => {

      try {

        const res =
          await API.get(
            "/withdraw/admin/withdraws"
          );

        setRequests(
          res.data.data || []
        );

      } catch (err) {

        console.log(err);

      } finally {

        setLoading(false);
      }
    };

  const approveRequest =
    async (id) => {

      try {

        await API.patch(
          `/withdraw/admin/withdraws/${id}/approve`
        );

        alert(
          "Withdraw approved"
        );

        fetchRequests();

      } catch (err) {

        console.log(err);

        alert(
          err.response?.data
            ?.message
        );
      }
    };

  const rejectRequest =
    async (id) => {

      const note =
        prompt(
          "Reject reason"
        );

      if (!note) return;

      try {

        await API.patch(
          `/withdraw/admin/withdraws/${id}/reject`,
          { note }
        );

        alert(
          "Withdraw rejected"
        );

        fetchRequests();

      } catch (err) {

        console.log(err);

        alert(
          err.response?.data
            ?.message
        );
      }
    };

  if (loading) {
    return (
      <div className="admin-withdraws-page">
        <h2>
          Loading...
        </h2>
      </div>
    );
  }

  return (

    <div className="admin-withdraws-page">

      <div className="withdraws-header">

        <h1>
          Withdraw Requests
        </h1>

        <p>
          Manage worker payouts
        </p>

      </div>

      {requests.length ===
      0 ? (

        <div className="empty-box">

          No withdraw requests

        </div>

      ) : (

        <div className="withdraws-grid">

          {requests.map(
            (request) => (

              <div
                key={request._id}
                className="withdraw-card"
              >

                <div className="withdraw-top">

                  <div>

                    <h3>

                      {
                        request.workerId
                          ?.name
                      }

                    </h3>

                    <p>

                      {
                        request.workerId
                          ?.email
                      }

                    </p>

                  </div>

                  <span
                    className={`status-badge ${
                      request.status ===
                      "APPROVED"

                        ? "approved"

                        : request.status ===
                          "REJECTED"

                        ? "rejected"

                        : "pending"
                    }`}
                  >

                    {
                      request.status
                    }

                  </span>

                </div>

                <div className="withdraw-info">

                  <div>

                    <span>
                      Amount
                    </span>

                    <strong>

                      {
                        request.amount
                      } EGP

                    </strong>

                  </div>

                  <div>

                    <span>
                      Date
                    </span>

                    <strong>

                      {new Date(
                        request.createdAt
                      ).toLocaleDateString()}

                    </strong>

                  </div>

                </div>

                {request.note && (

                  <div className="reject-note">

                    <strong>
                      Note:
                    </strong>

                    <p>
                      {
                        request.note
                      }
                    </p>

                  </div>
                )}

                {request.status ===
                  "PENDING" && (

                  <div className="withdraw-actions">

                    <button
                      className="approve-btn"
                      onClick={() =>
                        approveRequest(
                          request._id
                        )
                      }
                    >

                      <CheckCircle
                        size={18}
                      />

                      Approve

                    </button>

                    <button
                      className="reject-btn"
                      onClick={() =>
                        rejectRequest(
                          request._id
                        )
                      }
                    >

                      <XCircle
                        size={18}
                      />

                      Reject

                    </button>

                  </div>
                )}

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}