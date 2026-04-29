


import React, { useState, useEffect } from 'react';
import API from "../../services/api";
import './ServicesManagementPage.css';

const ServicesManagementPage = () => {

  const [services, setServices] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    base_price: "",
    category: ""
  });

  const fetchServices = async () => {
    try {
      const res = await API.get("/services");
      setServices(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchServices();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  //  ADD OR UPDATE
  const handleSubmit = async () => {
    try {
      if (!form.name || !form.description || !form.base_price || !form.category) {
        alert("Fill all fields");
        return;
      }

      if (editingId) {
        await API.put(`/services/${editingId}`, form);
        alert("Service updated ");
      } else {
        await API.post("/services", form);
        alert("Service added ");
      }

      fetchServices();
      resetForm();

    }
    //  catch (err) {
    //   alert("Error");
    // }
    catch (err) {
  console.log(err.response?.data);
  alert("Error");
}
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      base_price: "",
      category: ""
    });
    setEditingId(null);
  };

  //  DELETE
  const handleDelete = async (id) => {
    await API.delete(`/services/${id}`);
    fetchServices();
  };

  //  EDIT
  const handleEdit = (service) => {
    setForm({
      name: service.name,
      description: service.description,
      base_price: service.base_price,
      category: service.category
    });
    setEditingId(service._id);
  };

  return (
    <div className="services-management-container">

      <h2 className="page-main-title">Services Management</h2>

      {/*  FORM CARD */}
      <div className="service-form-card">

        <div className="form-group">
          <label>Service Name</label>
          <input name="name" value={form.name} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} />
        </div>

        <div className="form-row">

          <div className="form-group small">
            <label>Price</label>
            <div className="price-input-wrapper">
              <span className="currency-prefix">EGP</span>
              <input
                name="base_price"
                value={form.base_price}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group small">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="">Select Category</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="carpentry">Carpentry</option>
              <option value="painting">Painting</option>
              <option value="cleaning">Cleaning</option>
            </select>
          </div>

        </div>

        <div className="form-actions-buttons">
          <button className="btn-action add-btn" onClick={handleSubmit}>
            {editingId ? "Update" : "Add"}
          </button>

          {editingId && (
            <button className="btn-action delete-btn" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>

      </div>

      {/*  TABLE CARD */}
      <div className="service-form-card" style={{ marginTop: "30px" }}>

        <table className="services-table">
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

                <td className="actions-cell">

                  <button
                    className="btn-action edit-btn"
                    onClick={() => handleEdit(service)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn-action delete-btn"
                    onClick={() => handleDelete(service._id)}
                  >
                    Delete
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>

    </div>
  );
};

export default ServicesManagementPage;

