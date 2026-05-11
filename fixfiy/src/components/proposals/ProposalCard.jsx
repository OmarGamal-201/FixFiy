import React, {
  useState,
} from "react";

import API from "../../services/api";

const ProposalCard = ({
  proposal,
  refresh,
}) => {

  const [loading, setLoading] =
    useState(false);

  const tech =
    proposal.technicianId;

  const handleAccept = async () => {
    try {
      setLoading(true);

      await API.patch(
        `/proposals/${proposal._id}/accept`
      );

      alert(
        "Proposal accepted successfully"
      );

      refresh();

    } catch (err) {
      console.log(err);

      alert(
        err.response?.data?.message
      );

    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);

      await API.patch(
        `/proposals/${proposal._id}/reject`
      );

      alert(
        "Proposal rejected"
      );

      refresh();

    } catch (err) {
      console.log(err);

      alert(
        err.response?.data?.message
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm h-100">

      <div className="card-body">

        <div className="d-flex justify-content-between align-items-start mb-4">

          <div>

            <h4 className="fw-bold mb-1">
              {tech?.name}
            </h4>

            <p className="text-muted mb-0">
              {tech?.email}
            </p>

          </div>

          <span
            className={`badge ${
              proposal.status ===
              "ACCEPTED"
                ? "bg-success"
                : proposal.status ===
                  "REJECTED"
                ? "bg-danger"
                : "bg-warning"
            }`}
          >
            {proposal.status}
          </span>

        </div>

        <div className="mb-4">

          <div className="d-flex justify-content-between mb-2">
            <span className="fw-semibold">
              Proposed Price
            </span>

            <span>
              {
                proposal.proposedPrice
              }{" "}
              EGP
            </span>
          </div>

          <div className="d-flex justify-content-between">
            <span className="fw-semibold">
              Estimated Duration
            </span>

            <span>
              {
                proposal.estimatedDuration
              }{" "}
              hours
            </span>
          </div>

        </div>

        <div className="mb-4">

          <h6 className="fw-bold">
            Message
          </h6>

          <p className="text-muted mb-0">
            {proposal.message}
          </p>

        </div>

        {proposal.status ===
          "PENDING" && (
          <div className="d-flex gap-2">

            <button
              className="btn btn-success flex-grow-1"
              onClick={
                handleAccept
              }
              disabled={loading}
            >
              Accept
            </button>

            <button
              className="btn btn-outline-danger flex-grow-1"
              onClick={
                handleReject
              }
              disabled={loading}
            >
              Reject
            </button>

          </div>
        )}

      </div>
    </div>
  );
};

export default ProposalCard;