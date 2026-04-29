import React, { useState } from "react";
import "./Booking.css";
import API from "../../services/api";

const Booking = () => {
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    category: ""
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  const categories = [
    "Electricity",
    "Plumbing",
    "Painting",
    "Carpentry",
    "Cleaning"
  ];

  // const handleSelectCategory = (category) => {
  //   setJobData({
  //     ...jobData,
  //     category
  //   });
  // };

  const handleChange = (e) => {
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = jobData.title.trim();
    const description = jobData.description.trim();
    const category = jobData.category.trim();

    if (!title || !description || !category) {
      setStatus({ type: "error", text: "Please fill all fields." });
      return;
    }

    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      const res = await API.post("/jobs", { title, description, category });
      console.log("JOB CREATED:", res.data);
      setStatus({ type: "success", text: "Booking created successfully." });
      setJobData({ title: "", description: "", category: "" });
    } catch (error) {
      const message = error.response?.data?.message || "Error creating booking.";
      console.log("ERROR:", error.response?.data);
      setStatus({ type: "error", text: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-card">
          <h2>Booking request</h2>

          {status.text && (
            <div className={`message-box ${status.type}`}>
              {status.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              name="title"
              value={jobData.title}
              onChange={handleChange}
              placeholder="Fix electricity issue"
            />

            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={jobData.description}
              onChange={handleChange}
              placeholder="Describe your problem..."
            />

            <label htmlFor="category">Category</label>
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
              {loading ? "Booking..." : "Book Now"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;



