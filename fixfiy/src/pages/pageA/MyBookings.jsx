import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./MyBookings.css";

const MyBookings = () => {

  const [jobs, setJobs] = useState([]);

  // data loading
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await API.get("/jobs");
      setJobs(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  //  cancel job
  const handleCancel = async (id) => {
    try {
      await API.patch(`/jobs/${id}/cancel`, {
        reason: "User canceled"
      });

      alert("Job canceled ");

      fetchJobs(); // refresh

    } catch (err) {
      console.log(err.response?.data);
      alert("Cannot cancel this job");
    }
  };

  //  status colors
  const getStatusClass = (status) => {
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
      default:
        return "";
    }
  };

  return (
    <div className="my-bookings-container">

      <h2>My Bookings</h2>

      <div className="bookings-table">

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Service</th>
              <th>Worker</th>
              <th>Price</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {jobs.map((job) => (
              <tr key={job._id}>

                <td>{job._id.slice(-5)}</td>

                <td>{job.serviceId?.name || "-"}</td>

                <td>
                  {job.workerId?.name || "Not assigned"}
                </td>

                <td>{job.total_price} EGP</td>

                <td>
                  <span className={`status ${getStatusClass(job.status)}`}>
                    {job.status}
                  </span>
                </td>

                <td>
                  {job.status === "PENDING" && (
                    <button
                      className="cancel-btn"
                      onClick={() => handleCancel(job._id)}
                    >
                      Cancel
                    </button>
                  )}
                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>
    </div>
  );
};

export default MyBookings;