import React, { useState, useEffect } from 'react';
import API from "../../services/api";
import './ServicesManagementPage.css';

const ServicesManagementPage = () => {

  const [services, setServices] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    base_price: "",
    category: ""
  });

  // ✅ load services
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await API.get("/services");
      setServices(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ✅ ADD SERVICE
  const handleAdd = async () => {
    try {
      if (!form.name || !form.description || !form.base_price || !form.category) {
        alert("Fill all fields");
        return;
      }

      await API.post("/services", form);

      alert("Service added ✅");

      fetchServices();

      setForm({
        name: "",
        description: "",
        base_price: "",
        category: ""
      });

    } catch (err) {
      console.log(err.response?.data);
      alert(err.response?.data?.message || "Error");
    }
  };

  // ✅ DELETE (soft delete)
  const handleDelete = async (id) => {
    try {
      await API.delete(`/services/${id}`);
      fetchServices();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="services-management-container">

      <h2>Services Management</h2>

      {/* FORM */}
      <div className="form">

        <input
          name="name"
          placeholder="Service Name"
          value={form.name}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <input
          name="base_price"
          placeholder="Price"
          value={form.base_price}
          onChange={handleChange}
        />

        {/* 🔥 مهم جدًا */}
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select Category</option>
          <option value="plumbing">Plumbing</option>
          <option value="electrical">Electrical</option>
          <option value="carpentry">Carpentry</option>
          <option value="painting">Painting</option>
          <option value="cleaning">Cleaning</option>
          <option value="general">General</option>
        </select>

        <button onClick={handleAdd}>Add Service</button>

      </div>

      {/* TABLE */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {services.map(service => (
            <tr key={service._id}>
              <td>{service.name}</td>
              <td>{service.base_price} EGP</td>
              <td>{service.category}</td>
              <td>
                <button onClick={() => handleDelete(service._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
};

export default ServicesManagementPage;