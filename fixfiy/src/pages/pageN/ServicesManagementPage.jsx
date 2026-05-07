

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Tag, DollarSign, Layout, Info, Briefcase } from 'lucide-react';
import API from "../../services/api";
import './ServicesManagementPage.css';

const ServicesManagementPage = () => {
  const [services, setServices] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    name: "",
    description: "",
    base_price: "",
    category: ""
  });

  const showNotification = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await API.get("/services");
      // Adjust according to your API response structure (res.data or res.data.data)
      setServices(res.data.data || res.data || []);
    } catch (err) {
      showNotification("error", "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // 1. Basic Validation
    if (!form.name || !form.description || !form.base_price || !form.category) {
      showNotification("error", "Please fill all fields");
      return;
    }

    // 2. Data Transformation: Convert base_price to Number to prevent 400 Bad Request
    const payload = {
      ...form,
      base_price: Number(form.base_price)
    };

    try {
      if (editingId) {
        await API.put(`/services/${editingId}`, payload);
        showNotification("success", "Service updated successfully");
      } else {
        await API.post("/services", payload);
        showNotification("success", "New service added");
      }
      fetchServices();
      resetForm();
    } catch (err) {
      console.error("API Error:", err.response?.data);
      const errorText = err.response?.data?.message || "Operation failed";
      showNotification("error", errorText);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await API.delete(`/services/${id}`);
        showNotification("success", "Service deleted");
        fetchServices();
      } catch (err) {
        showNotification("error", "Delete failed");
      }
    }
  };

  const handleEdit = (service) => {
    setForm({
      name: service.name,
      description: service.description,
      base_price: service.base_price,
      category: service.category
    });
    setEditingId(service._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setForm({ name: "", description: "", base_price: "", category: "" });
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="management-page">
        <div className="loading-container"><div className="spinner-large"></div></div>
      </div>
    );
  }

  return (
    <div className="management-page">
      <div className="management-content">
        
        {/* Header Section */}
        <div className="management-header">
          <div className="header-top">
            <div className="header-icon">💼</div>
            <div className="header-info">
              <h1>Services Management</h1>
              <p>Configure and price your business service offerings</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-box">
              <span className="stat-value">{services.length}</span>
              <span className="stat-label">Total Services</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">
                {new Set(services.map(s => s.category)).size}
              </span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
        </div>

        {/* Notification Banner */}
        {message.text && (
          <div className={`notification notification-${message.type}`}>
            <span className="notification-icon">{message.type === "success" ? "✓" : "⚠"}</span>
            <p>{message.text}</p>
          </div>
        )}

        <div className="management-grid">
          {/* Form Card */}
          <aside className="form-section">
            <div className="table-card">
              <div className="table-header">
                <h2>{editingId ? "Edit Service" : "Add New Service"}</h2>
              </div>
              <div className="form-container">
                <div className="input-group">
                  <label><Layout size={14} /> Service Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Master Plumbing" />
                </div>
                <div className="input-group">
                  <label><Info size={14} /> Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} placeholder="What does this service include?" />
                </div>
                <div className="input-row">
                  <div className="input-group">
                    <label><DollarSign size={14} /> Price (EGP)</label>
                    <input name="base_price" type="number" value={form.base_price} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                    <label><Tag size={14} /> Category</label>
                    <select name="category" value={form.category} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="Electricity">Electrical</option>
                      <option value="carpentry">Carpentry</option>
                      <option value="painting">Painting</option>
                      <option value="cleaning">Cleaning</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button className={`action-btn ${editingId ? 'btn-restore' : 'btn-primary'}`} onClick={handleSubmit}>
                    {editingId ? "Update Service" : "Create Service"}
                  </button>
                  {editingId && (
                    <button className="action-btn btn-cancel" onClick={resetForm}>Cancel</button>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Table Card */}
          <main className="list-section">
            <div className="table-card">
              <div className="table-header">
                <h2>Active Services</h2>
                <span className="record-count">{services.length} Total</span>
              </div>
              <div className="table-wrapper">
                <table className="clients-table">
                  <thead>
                    <tr>
                      <th>Service Details</th>
                      <th>Category</th>
                      <th>Base Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => (
                      <tr key={service._id}>
                        <td>
                          <div className="name-text">{service.name}</div>
                          <div className="email-subtext">
                            {service.description.length > 60 
                              ? `${service.description.substring(0, 60)}...` 
                              : service.description}
                          </div>
                        </td>
                        <td>
                          <span className={`specialty-tag tag-${service.category}`}>
                            {service.category}
                          </span>
                        </td>
                        <td className="price-bold">{service.base_price} EGP</td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-btn btn-edit" title="Edit" onClick={() => handleEdit(service)}>
                              <Edit2 size={14} />
                            </button>
                            <button className="action-btn btn-suspend" title="Delete" onClick={() => handleDelete(service._id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ServicesManagementPage;