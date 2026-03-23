import React, { useState, useEffect } from "react";
import "./Booking.css";
import API from "../../services/api";

const Booking = () => {

  const [form, setForm] = useState({
    title: "",
    description: "",
    serviceId: ""
  });

  const [services, setServices] = useState([]);

  // ✅ تحميل الخدمات
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await API.get("/services"); // لازم يكون عندك endpoint
        setServices(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchServices();
  }, []);

  // ✅ تغيير القيم
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ✅ إرسال الحجز
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.description || !form.serviceId) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await API.post("/jobs", form);

      console.log("✅ JOB CREATED:", res.data);

      alert("Booking created successfully 🎉");

      // reset
      setForm({
        title: "",
        description: "",
        serviceId: ""
      });

    } catch (error) {
      console.log("❌ ERROR:", error.response?.data);
      alert(error.response?.data?.message || "Error creating booking");
    }
  };

  return (
    <div className="booking-page">
      <main className="content">
        <h2>Book a Service</h2>

        <div className="booking-card">
          <form onSubmit={handleSubmit}>

            {/* Title */}
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Fix electricity issue"
            />

            {/* Description */}
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your problem..."
            />

            {/* Service */}
            <label>Service</label>
            <select
              name="serviceId"
              value={form.serviceId}
              onChange={handleChange}
            >
              <option value="">Select Service</option>

              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name} - {service.base_price} EGP
                </option>
              ))}
            </select>

            {/* Submit */}
            <button type="submit">Book Now</button>

          </form>
        </div>
      </main>
    </div>
  );
};

export default Booking;