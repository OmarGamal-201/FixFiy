



import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; 
import "./Booking.css";
import API from "../../services/api";

const Booking = () => {
  const location = useLocation();
  
  // 1. استخراج المعرفات من الرابط (URL) أولاً لتجنب أي ReferenceError
  const queryParams = new URLSearchParams(location.search);
  const serviceIdFromUrl = queryParams.get("serviceId") || "";
  const workerIdFromUrl = queryParams.get("workerId") || "";

  // 2. إعداد الحالة (State) بالقيم المستخرجة
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    category: "", // سيختاره المستخدم يدوياً
    serviceId: serviceIdFromUrl, // تم جلبه تلقائياً
    workerId: workerIdFromUrl    // تم جلبه تلقائياً
  });
console.log("URL Params extracted:", { serviceIdFromUrl, workerIdFromUrl });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  const categories = [
    "Electricity",
    "Plumbing",
    "Painting",
    "Carpentry",
    "Cleaning"
  ];

  // 3. تحديث الحالة إذا تغيرت المعرفات في الرابط (لضمان الدقة)
  useEffect(() => {
    setJobData(prev => ({
      ...prev,
      serviceId: serviceIdFromUrl,
      workerId: workerIdFromUrl
    }));
  }, [serviceIdFromUrl, workerIdFromUrl]);

  const handleChange = (e) => {
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value
    });
  };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
// console.log("Current jobData before submit:", jobData);
//     const { title, description, category, serviceId, workerId } = jobData;

//     // 4. التحقق من الحقول قبل الإرسال (الفئة والوصف والعنوان)
//     // السيرفر يتطلب العنوان والوصف ومعرف الخدمة بشكل أساسي[cite: 2, 3]
//     if (!title.trim() || !description.trim() || !category || !serviceId) {
//       setStatus({ type: "error", text: "Please fill all fields (Title, Description, and Category)." });
//       return;
//     }

//     setLoading(true);
//     setStatus({ type: "", text: "" });

//     try {
//       // 5. إرسال الطلب للباك إند[cite: 2, 4]
//       // نرسل الحقول المطلوبة في controller السيرفر: title, description, serviceId, workerId
//       const res = await API.post("/jobs", { 
//         title, 
//         description, 
//         serviceId, 
//         workerId 
//       });

//       console.log("JOB CREATED SUCCESS:", res.data);
//       setStatus({ type: "success", text: "Booking created successfully!" });
      
//       // تصفير الحقول اليدوية فقط بعد النجاح
//       setJobData(prev => ({ ...prev, title: "", description: "", category: "" }));
//     } catch (error) {
//       const message = error.response?.data?.message || "Error creating booking.";
//       console.error("SERVER ERROR:", error.response?.data);
//       setStatus({ type: "error", text: message });
//     } finally {
//       setLoading(false);
//     }
//   };

const handleSubmit = async (e) => {
    e.preventDefault();

    // طباعة البيانات في الكونسول للتأكد من وصولها (افتح الـ Inspect لتراها)
    console.log("Current jobData before submit:", jobData);

    const { title, description, category,workerId } = jobData;

    // 4. التحقق المحسن
    if (!title || title.trim() === "" || 
        !description || description.trim() === "" || 
        !category || !workerId ) {
      
      // لنعرف ما هو الحقل الناقص بالضبط
      let missing = [];
      if (!title.trim()) missing.push("Title");
      if (!description.trim()) missing.push("Description");
      if (!category) missing.push("Category");
      // if (!serviceId) missing.push("Service ID (from URL)");
       if (!workerId) missing.push("Worker ID (from URL)");

      setStatus({ 
        type: "error", 
        text: `Missing fields: ${missing.join(", ")}` 
      });
      return;
    }

    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      // إرسال المعرفات والبيانات للباك إند[cite: 2, 5]
      const res = await API.post("/jobs", { 
        title: title.trim(), 
        description: description.trim(), 
        category:category.trim(),
        // serviceId, 
        workerId: jobData.workerId 
      });

      setStatus({ type: "success", text: "Booking created successfully!" });
      setJobData(prev => ({ ...prev, title: "", description: "", category: "" }));
    } catch (error) {
      const message = error.response?.data?.message || "Error creating booking.";
      setStatus({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-card">
          <h2>Booking Request</h2>

          {status.text && (
            <div className={`message-box ${status.type}`}>
              {status.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label htmlFor="title">Job Title</label>
            <input
              id="title"
              type="text"
              name="title"
              value={jobData.title}
              onChange={handleChange}
              placeholder="e.g., Fix electricity issue"
            />

            <label htmlFor="description">Detailed Description</label>
            <textarea
              id="description"
              name="description"
              value={jobData.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail..."
            />

            <label htmlFor="category">Service Category</label>
            <select
              id="category"
              name="category"
              value={jobData.category}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Book Now"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;















