import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CreditCard, ShieldCheck, Loader2, CheckCircle, ExternalLink } from "lucide-react";
import API from "../../services/api";
import "./Payments.css";

const POLL_INTERVAL = 3000; // كل 3 ثواني
const POLL_TIMEOUT  = 5 * 60 * 1000; // أقصى 5 دقايق

const Payments = () => {
  const location  = useLocation();
  const navigate  = useNavigate();

  const jobIdFromUrl = new URLSearchParams(location.search).get("jobId") || "";

  const [jobDetails, setJobDetails]   = useState(null);
  const [loading, setLoading]         = useState(false);
  const [approveUrl, setApproveUrl]   = useState(null);
  const [polling, setPolling]         = useState(false);
  const [message, setMessage]         = useState({ type: "", text: "" });

  const pollRef      = useRef(null);
  const pollStart    = useRef(null);

  useEffect(() => {
    if (jobIdFromUrl) fetchJobData();
    return () => stopPolling();
  }, [jobIdFromUrl]);

  // ─── fetch job ───────────────────────────────────────────
  const fetchJobData = async () => {
    try {
      const res = await API.get(`/jobs/${jobIdFromUrl}`);
      setJobDetails(res.data.data);
    } catch {
      showMessage("error", "Could not load job details.");
    }
  };

  // ─── messages ────────────────────────────────────────────
  const showMessage = (type, text) => {
    setMessage({ type, text });
    if (type !== "success") setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  // ─── polling helpers ─────────────────────────────────────
  const startPolling = (paymentId) => {
    setPolling(true);
    pollStart.current = Date.now();

    pollRef.current = setInterval(async () => {
      // timeout بعد 5 دقايق
      if (Date.now() - pollStart.current > POLL_TIMEOUT) {
        stopPolling();
        showMessage("error", "Payment confirmation timed out. Check your bookings.");
        return;
      }

      try {
        const res = await API.get(`/payments/${paymentId}`);
        const status = res.data.data?.status;

        if (status === "PAID") {
          stopPolling();
          showMessage("success", "Payment confirmed! Redirecting…");
          await fetchJobData(); // تحديث عرض الصفحة
          setTimeout(() => navigate("/payment-callback"), 2000);
        }
        // لو FAILED
        if (status === "FAILED") {
          stopPolling();
          showMessage("error", "Payment failed. Please try again.");
          await fetchJobData();
        }
      } catch (err){
        // ignore network hiccups أثناء الـ polling
        if (err.response?.status === 403 || err.response?.status === 401) {
      stopPolling();
      showMessage("error", "Access denied. Please login again.");
    }
      }
    }, POLL_INTERVAL);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setPolling(false);
  };

  // ─── handle payment ──────────────────────────────────────
  const handlePayment = async (type) => {
    if (!jobIdFromUrl) { showMessage("error", "No Job ID found!"); return; }

    try {
      setLoading(true);
      setApproveUrl(null);
      stopPolling();

      const endpoint = type === "DEPOSIT" ? "/payments/deposit" : "/payments/final";
      const res = await API.post(endpoint, { jobId: jobIdFromUrl });
      const data = res.data.data;
      const isMock = data?.approveUrl?.includes("mock-approve") ||
                     data?.payment?.transactionId?.startsWith("MOCK_");
      // if (data?.approveUrl&& !isMock) {
      //   // PayPal
      //   setApproveUrl(data.approveUrl);
      //   window.open(data.approveUrl, "_blank");
      //   showMessage("success", "Complete payment on PayPal — this page will update automatically.");
      //   startPolling(data.payment.id); // ابدأ تسمع
      // } else {
      //   // Mock gateway
      //   const transactionId = data?.payment?.transactionId;
      //   if (transactionId) {
      //     await API.post("/payments/mock-webhook", {
      //       transactionId,
      //       success: true,
      //     });
      //   }
      //   showMessage("success", data?.message || "Payment completed!");
      //   await fetchJobData();
      //   setTimeout(() => navigate("/my-bookings"), 2000);
        
      // }
      if (data?.approveUrl && !isMock) {
    // PayPal Flow
    setApproveUrl(data.approveUrl);
    window.open(data.approveUrl, "_blank");
    showMessage("success", "Complete payment on PayPal...");
    startPolling(data.payment.id); 
} else {
    // Mock Flow
    const transactionId = data?.payment?.transactionId;
    if (transactionId) {
        try {
            await API.post("/payments/mock-webhook", {
                transactionId,
                success: true,
            });
            // وقفي أي polling لو كان بدأ بالصدفة
            stopPolling(); 
            showMessage("success", "Payment completed successfully!");
            await fetchJobData();
            setTimeout(() => navigate("/my-bookings"), 2000);
        } catch (err) {
            showMessage("error", "Mock confirmation failed.");
        }
    }
}

    } catch (err) {
      const msg = err.response?.data?.error?.message || err.response?.data?.message || "Payment failed.";
      showMessage("error", msg);
    } finally {
      setLoading(false);
    }
  };

  // ─── UI ──────────────────────────────────────────────────
  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-card">

          <div className="card-header">
            <div className="header-icon"><CreditCard size={32} /></div>
            <h1 className="card-title">Secure Checkout</h1>
            <p className="card-subtitle">Finalize your booking payment</p>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`message-alert message-${message.type}`}>
              {message.type === "success" && <CheckCircle size={18} />}
              <p>{message.text}</p>
            </div>
          )}

          {/* Polling indicator */}
          {polling && (
            <div className="polling-banner">
              <Loader2 className="spinner-small" />
              <span>Waiting for payment confirmation…</span>
            </div>
          )}

          {/* PayPal fallback button */}
          {approveUrl && (
            <div className="paypal-redirect-box">
              <p>PayPal didn't open?</p>
              <button className="btn btn-paypal" onClick={() => window.open(approveUrl, "_blank")}>
                <ExternalLink size={16} />
                Open PayPal
              </button>
            </div>
          )}

          {/* Order Summary */}
          {jobDetails ? (
            <div className="job-summary-box">
              <h4>Order Summary</h4>
              <div className="summary-row">
                <span>Service:</span>
                <strong>{jobDetails.serviceId?.name || jobDetails.title}</strong>
              </div>
              <div className="summary-row">
                <span>Total Price:</span>
                <strong>{jobDetails.total_price} EGP</strong>
              </div>
              <div className="summary-row">
                <span>Deposit:</span>
                <strong>{jobDetails.depositAmount} EGP</strong>
              </div>
              <div className="summary-row highlight">
                <span>Payment Status:</span>
                <span className={`status-tag ${jobDetails.paymentStatus?.toLowerCase()}`}>
                  {jobDetails.paymentStatus}
                </span>
              </div>
            </div>
          ) : (
            <div className="loading-placeholder">
              <Loader2 className="spinner" />
              <p>Retrieving order info…</p>
            </div>
          )}

          {/* Buttons */}
          <div className="payment-options">

            {jobDetails?.paymentStatus === "UNPAID" && (
              <div className="payment-option primary">
                <h3>Deposit Payment</h3>
                <p className="amount-display">{jobDetails.depositAmount} EGP</p>
                <button
                  className="btn btn-deposit"
                  onClick={() => handlePayment("DEPOSIT")}
                  disabled={loading || polling}
                >
                  {loading ? <Loader2 className="spinner-small" /> : "Confirm & Pay Deposit"}
                </button>
              </div>
            )}

            {jobDetails?.paymentStatus === "DEPOSIT_PAID" && (
              <div className="payment-option">
                <h3>Final Payment</h3>
                <p className="amount-display">
                  {jobDetails.total_price - jobDetails.depositAmount} EGP
                </p>
                <button
                  className="btn btn-final"
                  onClick={() => handlePayment("FINAL")}
                  disabled={loading || polling || jobDetails.status !== "DONE"}
                >
                  {loading ? <Loader2 className="spinner-small" /> : "Pay Final Amount"}
                </button>
                {jobDetails.status !== "DONE" && (
                  <p className="hint">Available after technician marks job as Done</p>
                )}
              </div>
            )}

            {jobDetails?.paymentStatus === "PAID" && (
              <div className="payment-option paid">
                <CheckCircle size={40} color="#22c55e" />
                <h3>All Payments Complete</h3>
                <button className="btn btn-secondary" onClick={() => navigate("/my-bookings")}>
                  View My Bookings
                </button>
              </div>
            )}
          </div>

          <div className="security-footer">
            <ShieldCheck size={16} />
            <p>Payments secured via PayPal</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Payments;