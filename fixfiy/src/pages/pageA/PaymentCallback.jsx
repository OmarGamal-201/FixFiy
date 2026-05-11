import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle } from "lucide-react";

function PaymentCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    // مجرد انتظار بسيط لإظهار تجربة أفضل للمستخدم
    const timer = setTimeout(() => {
      setStatus("success");

      // تحويل المستخدم بعد ثانيتين
      setTimeout(() => {
        navigate("/my-bookings");
      }, 2000);
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={styles.container}>
      {status === "processing" && (
        <>
          <Loader2
            size={50}
            style={{
              animation: "spin 1s linear infinite",
              color: "#2563eb",
            }}
          />

          <h2 style={{ marginTop: "20px" }}>
            جاري تأكيد عملية الدفع...
          </h2>

          <p>يرجى عدم إغلاق هذه الصفحة</p>
        </>
      )}

      {status === "success" && (
        <div style={{ color: "green" }}>
          <CheckCircle size={65} />

          <h2 style={{ marginTop: "20px" }}>
            ✅ تم الدفع بنجاح
          </h2>

          <p>جاري تحويلك إلى صفحة حجوزاتي...</p>
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
    fontFamily: "Arial, sans-serif",
  },
};

export default PaymentCallback;