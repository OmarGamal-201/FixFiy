import React, {
  useEffect,
  useState,
} from "react";

import API from "../../services/api";

const MyProposals = () => {

  const [proposals, setProposals] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [status, setStatus] =
    useState("PENDING");

  useEffect(() => {
    fetchProposals();
  }, [status]);

  const fetchProposals = async () => {
    try {
      setLoading(true);

      const res = await API.get(
        `/proposals/my?status=${status}`
      );

      setProposals(res.data.data);

    } catch (err) {
      console.log(err);

      setError(
        err.response?.data?.message ||
          "Failed to load proposals"
      );

    } finally {
      setLoading(false);
    }
  };

  const getBadgeClass = (
    proposalStatus
  ) => {

    switch (proposalStatus) {

      case "ACCEPTED":
        return "bg-success";

      case "REJECTED":
        return "bg-danger";

      case "WITHDRAWN":
        return "bg-secondary";

      default:
        return "bg-warning";
    }
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <h4>Loading proposals...</h4>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="fw-bold">
            My Proposals
          </h2>

          <p className="text-muted">
            Track your submitted proposals
          </p>
        </div>

      </div>

      <div className="d-flex gap-2 mb-4 flex-wrap">

        {[
          "PENDING",
          "ACCEPTED",
          "REJECTED",
          "WITHDRAWN",
        ].map((item) => (
          <button
            key={item}
            className={`btn ${
              status === item
                ? "btn-primary"
                : "btn-outline-primary"
            }`}
            onClick={() =>
              setStatus(item)
            }
          >
            {item}
          </button>
        ))}

      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {proposals.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center">
          <h5>
            No proposals found
          </h5>
        </div>
      ) : (
        <div className="row">

          {proposals.map(
            (proposal) => (
              <div
                className="col-lg-6 mb-4"
                key={proposal._id}
              >
                <div className="card border-0 shadow-sm h-100">

                  <div className="card-body">

                    <div className="d-flex justify-content-between align-items-start mb-3">

                      <div>

                        <h4 className="fw-bold mb-1">
                          {
                            proposal.jobId
                              ?.title
                          }
                        </h4>

                        <p className="text-muted mb-0">
                          {
                            proposal.jobId
                              ?.serviceId
                              ?.name
                          }
                        </p>

                      </div>

                      <span
                        className={`badge ${getBadgeClass(
                          proposal.status
                        )}`}
                      >
                        {
                          proposal.status
                        }
                      </span>

                    </div>

                    <p className="text-muted mb-4">
                      {
                        proposal.message
                      }
                    </p>

                    <div className="mb-4">

                      <div className="d-flex justify-content-between mb-2">

                        <span className="fw-semibold">
                          Your Price
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

                    <div className="text-muted small">

                      Submitted:
                      {" "}
                      {new Date(
                        proposal.createdAt
                      ).toLocaleDateString()}

                    </div>

                  </div>
                </div>
              </div>
            )
          )}

        </div>
      )}
    </div>
  );
};

export default MyProposals;