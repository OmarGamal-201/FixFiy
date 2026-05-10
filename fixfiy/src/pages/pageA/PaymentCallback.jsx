import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../services/api";
import { Loader2 } from "lucide-react";

const PaymentCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processPayment = async () => {
      const query = new URLSearchParams(location.search);
      const token = query.get("token");
      const payerId = query.get("PayerID");

      if (token && payerId) {
        try {
          // نبعت للباكيند عشان يعمل Capture للفعلية
          await API.post("/payments/paypal/capture", { token, payerId });
          
          // لو نجح، وديه لصفحة الحجوزات اللي بعتيها
          navigate("/my-bookings?status=success");
        } catch (err) {
          console.error("Payment Capture Failed", err);
          navigate("/my-bookings?status=error");
        }
      }
    };

    processPayment();
  }, [location, navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      <Loader2 className="spinner" size={48} />
      <h2>Finalizing your payment...</h2>
      <p>Please do not close this window.</p>
    </div>
  );
};

export default PaymentCallback;