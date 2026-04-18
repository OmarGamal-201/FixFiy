import React, { useState, useEffect } from 'react';
import API from "../../services/api";
import './WorkerManagement.css';

const WorkerManagement = () => {

  const [workers, setWorkers] = useState([]);
 const [showAll, setShowAll] = useState(false);
  useEffect(() => {
    const fetchWorkers = async () => {
      const res = await API.get("/admin/users?role=technician");
      setWorkers(res.data.data);
    };

    fetchWorkers();
  }, []);

  // const verifyWorker = async (id) => {
  //   await API.patch(`/admin/workers/${id}/verify`);
  //   alert("Worker verified ✅");
  //   setWorkers(prev =>
  //   prev.map(worker =>
  //     worker._id === id
  //       ? { ...worker, isVerified: true }
  //       : worker
  //   )
  // );
  // };
  const verifyWorker = async (id) => {
  await API.patch(`/admin/workers/${id}/verify`);

  setWorkers(prev =>
    prev.map(worker =>
      worker._id === id
        ? { ...worker, isVerified: true }
        : worker
    )
  );
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
          {workers.map(worker => (
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
    <button className="delete-btn">
      Delete
    </button>
  ) : (
    <button
      className="verify-btn"
      onClick={() => verifyWorker(worker._id)}
    >
      Verify
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