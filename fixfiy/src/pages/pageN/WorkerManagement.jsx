import React, { useState, useEffect } from 'react';
import API from "../../services/api";
import './WorkerManagement.css';

const WorkerManagement = () => {
  const [workers, setWorkers] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchWorkers = async () => {
    try {
      const res = await API.get("/admin/users?role=technician");
      setWorkers(res.data.data);
    } catch (err) {
      setError("Unable to load workers");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const verifyWorker = async (id) => {
    try {
      setError(null);
      setVerifyingId(id);

      const res = await API.patch(`/admin/workers/${id}/verify`);
      const verifiedWorker = res.data.data;

      setWorkers((prev) =>
        prev.map((worker) =>
          worker._id === id
            ? { ...worker, isVerified: verifiedWorker?.isVerified ?? true }
            : worker
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
      console.error(err);
    } finally {
      setVerifyingId(null);
    }
  };

  const displayedWorkerss = showAll ? workers : workers.slice(0, 5);

  return (
    <div className="management-container">
      {/* <h2>Worker Management</h2> */}
<div className="view-toggle">
  <span onClick={() => setShowAll(!showAll)}>
    {showAll ? "Show less" : "View all"}
  </span>
</div>
      {error && <div className="error-message">{error}</div>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Address</th>
            <th>Service</th>
            <th>Verified</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {displayedWorkerss.map(worker => (
            <tr key={worker._id}>
              <td>{worker.name}</td>
              <td>{worker.email}</td>
               <td>{worker.address?.city}, {worker.address?.governorate}</td>
               <td>{worker.specialties}</td>
              <td><span className={worker.isVerified ? "status yes" : "status no"}>
    {worker.isVerified ? "Yes" : "No"}
  </span></td>

              <td>
                {worker.isVerified ? (
                  <button className="delete-btn">Delete</button>
                ) : (
                  <button
                    className="verify-btn"
                    onClick={() => verifyWorker(worker._id)}
                    disabled={verifyingId === worker._id}
                  >
                    {verifyingId === worker._id ? "Verifying..." : "Verify"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

export default WorkerManagement;