
import React, { useEffect, useState } from "react";
import API from "../../services/api";
import "./withdrawadmin.css";

const WithdrawAdmin = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get("/withdraw/admin/withdraws");
      setRequests(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const approve = async (id) => {
    try {
      await API.patch(`/withdraw/admin/withdraws/${id}/approve`);
      fetchRequests();
    } catch (err) {
      console.log(err);
    }
  };

  const reject = async (id) => {
    try {
      await API.patch(`/withdraw/admin/withdraws/${id}/reject`, {
        note: "Rejected by admin",
      });
      fetchRequests();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="withdraw-page">

      <h2 className="page-title">Withdraw Requests</h2>

      <div className="withdraw-container">

        {requests.length === 0 ? (
          <p className="empty">No requests yet</p>
        ) : (
          requests.map((r) => (
            <div key={r._id} className="withdraw-card">

              <div className="withdraw-info">
                <h3> {r.amount} EGP</h3>

                <p>
                  Status:{" "}
                  <span className={`status ${r.status.toLowerCase()}`}>
                    {r.status}
                  </span>
                </p>

                <p className="date">
                  {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="actions">

                <button
                  className="btn approve"
                  onClick={() => approve(r._id)}
                >
                  Approve
                </button>

                <button
                  className="btn reject"
                  onClick={() => reject(r._id)}
                >
                  Reject
                </button>

              </div>

            </div>
          ))
        )}

      </div>
    </div>
  );
};

export default WithdrawAdmin;