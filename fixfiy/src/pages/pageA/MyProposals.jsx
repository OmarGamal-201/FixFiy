
import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import API from "../../services/api";

import {
  MapPin,
  Clock,
  Eye,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  Timer,
} from "lucide-react";

const MyProposals = () => {

  const navigate =
    useNavigate();

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

  const fetchProposals =
    async () => {

      try {

        setLoading(true);

        const res =
          await API.get(
            `/proposals/my?status=${status}`
          );

        setProposals(
          res.data.data
        );

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

  const getStatusStyle =
    (proposalStatus) => {

      switch (
        proposalStatus
      ) {

        case "ACCEPTED":
          return {
            bg: "#dcfce7",
            color:
              "#166534",
            icon:
              <CheckCircle size={16} />,
          };

        case "REJECTED":
          return {
            bg: "#fee2e2",
            color:
              "#991b1b",
            icon:
              <XCircle size={16} />,
          };

        default:
          return {
            bg: "#fef3c7",
            color:
              "#92400e",
            icon:
              <Timer size={16} />,
          };
      }
    };

  if (loading) {

    return (
      <div className="container-fluid p-4">
        <h4>
          Loading proposals...
        </h4>
      </div>
    );
  }

  return (

    <div className="container-fluid p-4">

      {/* HEADER */}

      <div className="mb-4">

        <h2 className="fw-bold mb-1">
          My Proposals
        </h2>

        <p className="text-muted">
          Track your submitted offers
        </p>

      </div>

      {/* FILTERS */}

      <div className="d-flex gap-2 flex-wrap mb-4">

        {[
          "PENDING",
          "ACCEPTED",
          "REJECTED",
        ].map((item) => (

          <button
            key={item}
            className="btn"
            onClick={() =>
              setStatus(item)
            }
            style={{
              background:
                status === item
                  ? "#2563eb"
                  : "#fff",

              color:
                status === item
                  ? "#fff"
                  : "#2563eb",

              border:
                "1px solid #2563eb",

              borderRadius:
                "14px",

              padding:
                "10px 18px",

              fontWeight:
                "600",
            }}
          >

            {item}

          </button>
        ))}

      </div>

      {/* ERROR */}

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* EMPTY */}

      {proposals.length ===
      0 ? (

        <div
          className="card border-0 shadow-sm p-5 text-center"
          style={{
            borderRadius:
              "24px",
          }}
        >

          <h5>
            No proposals found
          </h5>

        </div>

      ) : (

        <div className="row">

          {proposals.map(
            (proposal) => {

              const style =
                getStatusStyle(
                  proposal.status
                );

              const client =
                proposal.jobId
                  ?.clientId;

              return (

                <div
                  className="col-lg-6 mb-4"
                  key={
                    proposal._id
                  }
                >

                  <div
                    className="card border-0 shadow-sm h-100"
                    style={{
                      borderRadius:
                        "24px",
                      overflow:
                        "hidden",
                    }}
                  >

                    {/* TOP */}

                    <div
                      style={{
                        background:
                          "linear-gradient(135deg,#6C4DFF,#8B5CF6)",

                        padding:
                          "24px",

                        color:
                          "#fff",
                      }}
                    >

                      <div className="d-flex justify-content-between align-items-start">

                        <div>

                          <h3 className="fw-bold mb-2">

                            {
                              proposal
                                .jobId
                                ?.title
                            }

                          </h3>

                          <p className="mb-0 opacity-75">

                            {
                              proposal
                                .jobId
                                ?.serviceId
                                ?.name
                            }

                          </p>

                        </div>

                        <div
                          className="d-flex align-items-center gap-2"
                          style={{
                            background:
                              style.bg,

                            color:
                              style.color,

                            padding:
                              "10px 16px",

                            borderRadius:
                              "30px",

                            fontWeight:
                              "700",
                          }}
                        >

                          {
                            style.icon
                          }

                          {
                            proposal.status
                          }

                        </div>

                      </div>

                    </div>

                    <div className="card-body p-4">

                      {/* CLIENT */}

                      {client && (

                        <div className="d-flex justify-content-between align-items-center mb-4">

                          <div className="d-flex align-items-center gap-3">

                            <div
                              style={{
                                width:
                                  "65px",

                                height:
                                  "65px",

                                borderRadius:
                                  "50%",

                                overflow:
                                  "hidden",

                                background:
                                  "#6C4DFF",

                                color:
                                  "#fff",

                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                justifyContent:
                                  "center",

                                fontSize:
                                  "22px",

                                fontWeight:
                                  "700",

                                flexShrink:
                                  0,
                              }}
                            >

                              {
                                client
                                  ?.profilePicture?.[0]
                                  ?.url ? (

                                  <img
                                    src={
                                      client
                                        ?.profilePicture?.[0]
                                        ?.url
                                    }
                                    alt="client"
                                    style={{
                                      width:
                                        "100%",

                                      height:
                                        "100%",

                                      objectFit:
                                        "cover",
                                    }}
                                  />

                                ) : (

                                  client?.name
                                    ?.charAt(
                                      0
                                    )
                                    ?.toUpperCase()
                                )
                              }

                            </div>

                            <div>

                              <h5 className="fw-bold mb-1">

                                {
                                  client?.name
                                }

                              </h5>

                              <div className="d-flex align-items-center gap-2 text-muted">

                                <MapPin
                                  size={15}
                                />

                                <span>

                                  {
                                    client
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
                                `/client/${client?._id}`
                              )
                            }
                          >

                            <Eye
                              size={18}
                            />

                          </button>

                        </div>
                      )}

                      {/* MESSAGE */}

                      <div
                        className="mb-4"
                        style={{
                          background:
                            "#f8fafc",

                          borderRadius:
                            "18px",

                          padding:
                            "18px",
                        }}
                      >

                        <h6 className="fw-bold mb-3">
                          Your Message
                        </h6>

                        <p
                          className="text-muted mb-0"
                          style={{
                            lineHeight:
                              "1.8",
                          }}
                        >

                          {
                            proposal.message
                          }

                        </p>

                      </div>

                      {/* INFO */}

                      <div className="mb-3">

                        <div className="d-flex justify-content-between align-items-center mb-3">

                          <div className="d-flex align-items-center gap-2">

                            <DollarSign
                              size={18}
                            />

                            <span>
                              Price
                            </span>

                          </div>

                          <strong>

                            {
                              proposal.proposedPrice
                            }{" "}

                            EGP

                          </strong>

                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">

                          <div className="d-flex align-items-center gap-2">

                            <Clock
                              size={18}
                            />

                            <span>
                              Duration
                            </span>

                          </div>

                          <strong>

                            {
                              proposal.estimatedDuration
                            }{" "}

                            hours

                          </strong>

                        </div>

                        <div className="d-flex justify-content-between align-items-center">

                          <div className="d-flex align-items-center gap-2">

                            <User
                              size={18}
                            />

                            <span>
                              Submitted
                            </span>

                          </div>

                          <strong>

                            {new Date(
                              proposal.createdAt
                            ).toLocaleDateString()}

                          </strong>

                        </div>

                      </div>

                    </div>

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

export default MyProposals;
