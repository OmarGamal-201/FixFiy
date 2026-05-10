



import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../../services/api"; // تأكدي أن المسار صحيح حسب مشروعك
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function PaymentCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("processing"); // processing, success, error

  useEffect(() => {
    const finalizePayment = async () => {
      // 1. سحب الـ token والـ PayerID من رابط المتصفح
      const query = new URLSearchParams(location.search);
      const token = query.get("token");
      const payerId = query.get("PayerID");

      if (token && payerId) {
        try {
          // 2. إرسال البيانات للباكيند لإتمام العملية (Capture)
          // ملاحظة: تأكدي أن الـ Endpoint في الباكيند هو /payments/paypal/capture
          await API.post("/payments/paypal/capture", { 
            token, 
            payerId 
          });
          
          setStatus("success");
          // 3. التوجه لصفحة الحجوزات بعد ثانيتين من النجاح
          setTimeout(() => navigate("/my-bookings"), 2500);
        } catch (error) {
          console.error("Capture Error:", error);
          setStatus("error");
          setTimeout(() => navigate("/my-bookings"), 3000);
        }
      } else {
        // إذا رجع المستخدم للصفحة بدون بيانات
        navigate("/my-bookings");
      }
    };

    finalizePayment();
  }, [location, navigate]);

  return (
    <div style={styles.container}>
      {status === "processing" && (
        <>
          <Loader2 className="spinner" size={48} style={{ animation: "spin 1s linear infinite" }} />
          <h2 style={{ marginTop: "20px" }}>جاري تأكيد عملية الدفع...</h2>
          <p>يرجى عدم إغلاق هذه الصفحة</p>
        </>
      )}

      {status === "success" && (
        <div style={{ color: "green" }}>
          <CheckCircle size={60} />
          <h2>تم الدفع بنجاح!</h2>
          <p>جاري تحويلك لصفحة حجوزاتي...</p>
        </div>
      )}

      {status === "error" && (
        <div style={{ color: "red" }}>
          <XCircle size={60} />
          <h2>عذراً، فشلت عملية التأكيد</h2>
          <p>سنقوم بإعادتك لصفحة الحجوزات للمحاولة مرة أخرى</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "80vh",
    textAlign: "center",
    fontFamily: "Arial, sans-serif"
  }
};

export default PaymentCallback;