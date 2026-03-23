import React, { useState, useEffect } from 'react';
import API from "../../services/api";
import './WorkerManagement.css';

const WorkerManagement = () => {

  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    const fetchWorkers = async () => {
      const res = await API.get("/admin/users?role=technician");
      setWorkers(res.data.data);
    };

    fetchWorkers();
  }, []);

  const verifyWorker = async (id) => {
    await API.patch(`/admin/workers/${id}/verify`);
    alert("Worker verified ✅");
  };

  return (
    <div className="management-container">
      <h2>Worker Management</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Verified</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {workers.map(worker => (
            <tr key={worker._id}>
              <td>{worker.name}</td>
              <td>{worker.email}</td>
              <td>{worker.isVerified ? "Yes" : "No"}</td>

              <td>
                {!worker.isVerified && (
                  <button onClick={() => verifyWorker(worker._id)}>
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