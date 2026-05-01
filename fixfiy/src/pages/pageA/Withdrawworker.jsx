


import React, { useState } from "react";
import API from "../../services/api";
import "./withdrawworker.css";

const Withdrawworker = () => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const requestWithdraw = async () => {
    if (!amount || amount <= 0) {
      alert("Enter valid amount");
      return;
    }

    try {
      setLoading(true);

      await API.post("/withdraw/request", { amount });

      alert("Request sent successfully ");

      setAmount("");
    } catch (err) {
      console.log(err.response?.data);
      alert("Error sending request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="withdraw-page">

      <div className="withdraw-card">

        <h2 className="title"> Withdraw Request</h2>

        <p className="subtitle">
          Enter the amount you want to withdraw from your wallet
        </p>

        <input
          type="number"
          placeholder="Enter amount (EGP)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input"
        />

        <button
          onClick={requestWithdraw}
          className="btn"
          disabled={loading}
        >
          {loading ? "Processing..." : "Request Withdraw"}
        </button>

      </div>

    </div>
  );
};

export default Withdrawworker;