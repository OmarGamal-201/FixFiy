

///222
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

import "./Booking.css";
import API from "../../services/api";

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const serviceIdFromUrl = queryParams.get("serviceId") || "";
  const workerIdFromUrl = queryParams.get("workerId") || "";

  const [services, setServices] = useState([]);
  const [workerCategory, setWorkerCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    serviceId: serviceIdFromUrl,
    workerId: workerIdFromUrl,
    location: null, // تأكدي من وجودها هنا
  });

  // جلب الموقع
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setJobData((prev) => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          }));
        },
        (error) => console.error("Error getting location:", error)
      );
    }
  }, []);

  // جلب بيانات العامل
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

  // جلب الخدمات
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

  // تحديث البيانات بناءً على الرابط
  useEffect(() => {
    if (services.length > 0) {
      const matchedService = services.find((s) => s._id === serviceIdFromUrl);
      setJobData((prev) => ({
        ...prev,
        serviceId: serviceIdFromUrl,
        workerId: workerIdFromUrl,
        category: matchedService ? matchedService.category : prev.category,
        price: matchedService ? matchedService.base_price : prev.price,
      }));
    }
  }, [serviceIdFromUrl, workerIdFromUrl, services]);

  

  const handleChange = (e) => {
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value,
    });
  };

  const handleServiceChange = (e) => {
    const selectedServiceId = e.target.value;
    const selectedService = services.find((s) => s._id === selectedServiceId);

    setJobData((prev) => ({
      ...prev,
      serviceId: selectedServiceId,
      category: selectedService ? selectedService.category : "",
      price: selectedService ? selectedService.base_price || 0 : "",
    }));
  };

  // --- دالة واحدة فقط للـ Submit لمنع تضارب الكود ---
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const { title, description, serviceId, workerId, price } = jobData;

  //   // التحقق من الحقول
  //   if (!title?.trim() || !description?.trim() || !serviceId || !workerId) {
  //     setStatus({ type: "error", text: "Please fill all required fields." });
  //     return;
  //   }

  //   setLoading(true);
  //   setStatus({ type: "", text: "" });

  //   try {
  //     const res = await API.post("/jobs", {
  //       title: title.trim(),
  //       description: description.trim(),
  //       total_price: Number(price),
  //       serviceId,
  //       workerId,
  //     });

  //     setStatus({ type: "success", text: "Booking created successfully!" });
      
  //     // تصفير الفورم
  //     setJobData((prev) => ({
  //       ...prev,
  //       title: "",
  //       description: "",
  //     }));
  //   } catch (error) {
  //     const message = error.response?.data?.message || "Error creating booking.";
  //     setStatus({ type: "error", text: message });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

// const handleSubmit = async (e) => {
//   e.preventDefault();
//   const { title, description, serviceId, workerId, price } = jobData;

//   if (!title?.trim() || !description?.trim() || !serviceId || !workerId) {
//     setStatus({ type: "error", text: "Please fill all required fields." });
//     return;
//   }

//   setLoading(true);
//   setStatus({ type: "", text: "" });

//   try {
//     const res = await API.post("/jobs", {
//       title: title.trim(),
//       description: description.trim(),
//       total_price: Number(price),
//       serviceId,
//       workerId,
//     });

//     // التعديل هنا: التوجه لصفحة الدفع مباشرة
//     if (res.data && res.data.success) {
//       const createdJobId = res.data.data._id;
//       setStatus({ type: "success", text: "Booking created! Redirecting to payment..." });
      
//       // التوجه لصفحة الدفع بعد ثانية واحدة
//       setTimeout(() => {
//         navigate(`/payments?jobId=${createdJobId}`);
//       }, 1000);
//     }

//   } catch (error) {
//     const message = error.response?.data?.message || "Error creating booking.";
//     setStatus({ type: "error", text: message });
//   } finally {
//     setLoading(false);
//   }
// };



const handleSubmit = async (e) => {
    e.preventDefault();
    // استخراج الحقول من jobData بما فيها الـ location
    const { title, description, serviceId, workerId, price, location } = jobData;

    // 1. التحقق من الحقول المطلوبة
    if (!title?.trim() || !description?.trim() || !serviceId || !workerId) {
      setStatus({ type: "error", text: "Please fill all required fields." });
      return;
    }

    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      // 2. إرسال الطلب مع تأمين البيانات
      const res = await API.post("/jobs", {
        title: title.trim(),
        description: description.trim(),
        // تحويل السعر لرقم أو إرسال 0 لتجنب خطأ toFixed في السيرفر
        total_price: Number(price) || 0, 
        serviceId,
        workerId,
        location: location, // إرسال الموقع الجغرافي
      });

      if (res.data && res.data.success) {
        const createdJobId = res.data.data._id;
        setStatus({ type: "success", text: "Booking created! Redirecting to payment..." });
        
        // 3. التوجه لصفحة الدفع بعد نجاح الحجز
        setTimeout(() => {
          navigate(`/payments?jobId=${createdJobId}`);
        }, 1000);
      }

    } catch (error) {
      // طباعة الخطأ في الكونسول لمعرفة السبب الحقيقي لو فشل
      console.error("Booking Submission Error:", error.response?.data);
      const message = error.response?.data?.message || "Error creating booking.";
      setStatus({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = workerCategory
    ? services.filter((service) => service.category === workerCategory)
    : services;
console.log("Worker Category:", workerCategory);
console.log("All Services:", services);
console.log("Filtered Results:", filteredServices);
  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-card">
          <h2>Booking Request</h2>

          {status.text && (
            <div className={`message-box ${status.type}`}>{status.text}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="location-info-bar">
              <MapPin size={16} />
              <span>{jobData.location ? "Location captured ✅" : "Capturing location..."}</span>
            </div>

            <label>Job Title (Summary)</label>
            <input
              type="text"
              name="title"
              value={jobData.title}
              onChange={handleChange}
              placeholder="e.g., Fixing a lamp"
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
              {/* {filteredServices.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name} ({service.category})
                </option>
              ))} */}
              {(filteredServices.length > 0 ? filteredServices : services).map((service) => (
    <option key={service._id} value={service._id}>
      {service.name}
    </option>
  ))}
            </select>

            <label htmlFor="price">Estimated Cost (EGP)</label>
            <input
              id="price"
              type="number"
              name="price"
              value={jobData.price}
              readOnly
              className="readonly-input"
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