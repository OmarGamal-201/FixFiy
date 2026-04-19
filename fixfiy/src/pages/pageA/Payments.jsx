

import React, { useState } from "react";
import API from "../../services/api";
import "./Payments.css";

const Payments = () => {
  const [jobId, setJobId] = useState("");
  const [loading, setLoading] = useState(false);

  const payDeposit = async () => {
    if (!jobId) return alert("Enter Job ID");

    try {
      setLoading(true);
      await API.post("/payments/deposit", { jobId });
      alert("Deposit paid successfully ");
      setJobId("");
    } catch (err) {
      console.log(err.response?.data);
      alert("Error in deposit payment");
    } finally {
      setLoading(false);
    }
  };

  const payFinal = async () => {
    if (!jobId) return alert("Enter Job ID");

    try {
      setLoading(true);
      await API.post("/payments/final", { jobId });
      alert("Final payment done ");
      setJobId("");
    } catch (err) {
      console.log(err.response?.data);
      alert("Error in final payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">

      <div className="payment-card">

        <h2 className="title"> Payment Center</h2>

        <p className="subtitle">
          Enter Job ID to process payment
        </p>

        <input
          className="input"
          placeholder="Enter Job ID"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
        />

        <div className="buttons">

          <button
            className="btn deposit"
            onClick={payDeposit}
            disabled={loading}
          >
            Pay Deposit
          </button>

          <button
            className="btn final"
            onClick={payFinal}
            disabled={loading}
          >
            Pay Final
          </button>

        </div>

      </div>

    </div>
  );
};

export default Payments;