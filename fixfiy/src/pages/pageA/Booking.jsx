import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Booking.css";
import API from "../../services/api";

const Booking = () => {
  const location = useLocation();

  // 1. استخراج المعرفات من الرابط
  const queryParams = new URLSearchParams(location.search);
  const serviceIdFromUrl = queryParams.get("serviceId") || "";
  const workerIdFromUrl = queryParams.get("workerId") || "";

  // 2. إعداد الحالة (State) 
  const [services, setServices] = useState([]); // كل الخدمات
  const [workerCategory, setWorkerCategory] = useState(""); // تخصص العامل

  // إعداد الحالة الخاصة ببيانات الحجز (ضفنا فيها السعر)
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    category: "",
    price: "", // الخانة الجديدة للتكلفة
    serviceId: serviceIdFromUrl,
    workerId: workerIdFromUrl,
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  // 3. جلب بيانات العامل عشان نعرف تخصصه
  useEffect(() => {
    const fetchWorkerData = async () => {
      if (workerIdFromUrl) {
        try {
          const res = await API.get(`/profile/${workerIdFromUrl}`);
          if (res.data && res.data.success) {
            setWorkerCategory(res.data.data.specialty); 
          }
        } catch (error) {
          console.error("Error fetching worker data:", error);
        }
      }
    };
    fetchWorkerData();
  }, [workerIdFromUrl]);

  // 4. جلب كل الخدمات من الباك إند
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await API.get("/services");
        if (res.data && res.data.success) {
          setServices(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };
    fetchServices();
  }, []);

  // 5. تحديث الـ Category والـ Price لو الـ serviceId جاي من الرابط تلقائياً
  useEffect(() => {
    let matchedCategory = "";
    let matchedPrice = "";

    if (serviceIdFromUrl && services.length > 0) {
      const matchedService = services.find((s) => s._id === serviceIdFromUrl);
      if (matchedService) {
        matchedCategory = matchedService.category;
        matchedPrice = matchedService.base_price || 0; // سحب السعر من الخدمة
      }
    }

    setJobData((prev) => ({
      ...prev,
      serviceId: serviceIdFromUrl,
      workerId: workerIdFromUrl,
      ...(matchedCategory && { category: matchedCategory }),
      ...(matchedPrice !== "" && { price: matchedPrice }),
    }));
  }, [serviceIdFromUrl, workerIdFromUrl, services]);

  // دالة التعامل مع التغيير في الحقول العادية
  const handleChange = (e) => {
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value,
    });
  };

  // دالة التعامل مع تغيير اختيار الخدمة من القائمة (عشان نحدث السعر)
  const handleServiceChange = (e) => {
    const selectedServiceId = e.target.value;
    const selectedService = services.find((s) => s._id === selectedServiceId);

    setJobData((prev) => ({
      ...prev,
      serviceId: selectedServiceId,
      category: selectedService ? selectedService.category : "",
      price: selectedService ? selectedService.base_price || 0 : "", // تحديث السعر بناءً على الاختيار
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Current jobData before submit:", jobData);

    const { title, description, workerId, serviceId, price } = jobData;

    // التحقق المحسن
    if (
      !title ||
      title.trim() === "" ||
      !description ||
      description.trim() === "" ||
      !serviceId
    ) {
      let missing = [];
      if (!title?.trim()) missing.push("Title");
      if (!description?.trim()) missing.push("Description");
      if (!serviceId) missing.push("Service");
      if (!workerId) missing.push("Worker ID (from URL)");

      setStatus({
        type: "error",
        text: `Missing fields: ${missing.join(", ")}`,
      });
      return;
    }

    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      // إرسال البيانات بما فيها السعر للباك إند
      const res = await API.post("/jobs", {
        title: title.trim(),
        description: description.trim(),
        // category: category.trim(),
        total_price: Number(price), // حولناها لرقم عشان الموديل بتاعك
        serviceId,
        workerId: jobData.workerId,
      });

      setStatus({ type: "success", text: "Booking created successfully!" });
      // تصفير الحقول بعد النجاح
      setJobData((prev) => ({
        ...prev,
        title: "",
        description: "",
        serviceId: "",
        // category: "",
        total_price: "",
      }));
    } catch (error) {
      const message =
        error.response?.data?.message || "Error creating booking.";
      setStatus({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  // ----- الفلترة هنا -----
  const filteredServices = workerCategory
    ? services.filter((service) => service.category === workerCategory)
    : services;

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-card">
          <h2>Booking Request</h2>

          {status.text && (
            <div className={`message-box ${status.type}`}>{status.text}</div>
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

            <label htmlFor="service">Select Service</label>
            <select
              id="service"
              name="serviceId"
              value={jobData.serviceId}
              onChange={handleServiceChange}
            >
              <option value="">Choose a service...</option>
              {filteredServices.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name} ({service.category})
                </option>
              ))}
            </select>

            {/* الخانة الجديدة لعرض التكلفة */}
            <label htmlFor="price">Estimated Cost (EGP)</label>
            <input
              id="price"
              type="number"
              name="price"
              value={jobData.price}
              readOnly // خليناها readOnly عشان العميل ميغيرش السعر الثابت للخدمة
              className="readonly-input" // ممكن تديها كلاس CSS يخلي لونها باهت شوية عشان تبان إنها للعرض بس
              placeholder="Select a service to see the price"
            />

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