import React, { useEffect, useState } from "react";
import API from "../../services/api";
import OpenJobCard from "../../components/proposals/OpenJobCard";

const OpenJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOpenJobs();
  }, []);

  const fetchOpenJobs = async () => {
    try {
      setLoading(true);

      const res = await API.get(
        "/proposals/open-jobs"
      );

      setJobs(res.data.data);

    } catch (err) {
      console.log(err);

      setError(
        err.response?.data?.message ||
          "Failed to load jobs"
      );

    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <h3>Loading open jobs...</h3>
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            Open Jobs
          </h2>

          <p className="text-muted">
            Browse available jobs and send proposals
          </p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center">
          <h5>No open jobs available</h5>
        </div>
      ) : (
        <div className="row">
          {jobs.map((job) => (
            <div
              className="col-lg-6 mb-4"
              key={job._id}
            >
              <OpenJobCard job={job} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpenJobs;