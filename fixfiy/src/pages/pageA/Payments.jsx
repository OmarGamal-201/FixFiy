

import React, { useState } from "react";
import API from "../../services/api";
import "./Payments.css";

const Payments = () => {
  const [jobId, setJobId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const payDeposit = async () => {
    if (!jobId.trim()) {
      showMessage("error", "Please enter a valid Job ID");
      return;
    }

    try {
      setLoading(true);
      await API.post("/payments/deposit", { jobId });
      showMessage("success", "Deposit paid successfully!");
      setJobId("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error processing deposit payment";
      showMessage("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const payFinal = async () => {
    if (!jobId.trim()) {
      showMessage("error", "Please enter a valid Job ID");
      return;
    }

    try {
      setLoading(true);
      await API.post("/payments/final", { jobId });
      showMessage("success", "Final payment completed successfully!");
      setJobId("");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error processing final payment";
      showMessage("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-card">
          <div className="card-header">
            <div className="header-icon">💳</div>
            <h1 className="card-title">Payment Center</h1>
            <p className="card-subtitle">Process deposit or final payment for your booking</p>
          </div>

          {message.text && (
            <div className={`message-alert message-${message.type}`}>
              <span className="message-icon">{message.type === "success" ? "✓" : "⚠"}</span>
              <p>{message.text}</p>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Job ID</label>
            <input
              className="input-field"
              type="text"
              placeholder="Enter your Job ID"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              disabled={loading}
            />
            <p className="input-hint">Enter the ID of the job for which you want to make payment</p>
          </div>

          <div className="payment-options">
            <div className="payment-option">
              <div className="option-header">
                <span className="option-icon">🔐</span>
                <h3>Deposit Payment</h3>
              </div>
              <p className="option-description">Pay the required deposit amount to confirm your booking</p>
              <button
                className="btn btn-deposit"
                onClick={payDeposit}
                disabled={loading || !jobId.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>💰</span>
                    Pay Deposit
                  </>
                )}
              </button>
            </div>

            <div className="payment-option">
              <div className="option-header">
                <span className="option-icon">✅</span>
                <h3>Final Payment</h3>
              </div>
              <p className="option-description">Complete the final payment after service completion</p>
              <button
                className="btn btn-final"
                onClick={payFinal}
                disabled={loading || !jobId.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span>💳</span>
                    Pay Final
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="security-info">
            <p>
              <strong>🔒 Secure Payments:</strong> All transactions are encrypted and secured with industry-standard protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;