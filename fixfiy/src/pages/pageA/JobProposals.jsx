import React, {
  useEffect,
  useState,
} from "react";

import { useParams } from "react-router-dom";

import API from "../../services/api";

import ProposalCard from "../../components/proposals/ProposalCard";

const JobProposals = () => {

  const { id } = useParams();

  const [proposals, setProposals] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);

      const res = await API.get(
        `/proposals/job/${id}`
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

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <h4>Loading proposals...</h4>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-4">
        <div className="alert alert-danger">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">

      <div className="mb-4">
        <h2 className="fw-bold">
          Job Proposals
        </h2>

        <p className="text-muted">
          Review technician offers
        </p>
      </div>

      {proposals.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center">
          <h5>No proposals yet</h5>
        </div>
      ) : (
        <div className="row">

          {proposals.map((proposal) => (
            <div
              key={proposal._id}
              className="col-lg-6 mb-4"
            >
              <ProposalCard
                proposal={proposal}
                refresh={
                  fetchProposals
                }
              />
            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default JobProposals;