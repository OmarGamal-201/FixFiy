import React, { useState } from 'react';
import './ServicesManagementPage.css';

const ServicesManagementPage = () => {
  const [serviceData, setServiceData] = useState({
    name: 'Plumbing',
    description: '',
    price: '0.00',
    status: 'Active'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setServiceData({ ...serviceData, [name]: value });
  };

  
  const handleAdd = () => {
    if (serviceData.name.trim() === "") {
      alert("Please enter a service name");
      return;
    }
    console.log("Adding new service:", serviceData);
    alert(`Service "${serviceData.name}" added successfully!`);
    
  };

  
  const handleEdit = () => {
    console.log("Updating service:", serviceData);
    alert(`Service "${serviceData.name}" updated!`);
  };

 
  const handleDelete = () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this service?");
    if (confirmDelete) {
      console.log("Deleting service:", serviceData.name);
      setServiceData({ name: '', description: '', price: '0.00', status: 'Active' }); // مسح الفورم
      alert("Service deleted!");
    }
  };

  return (
    <div className="services-management-container">
      <h2 className="page-main-title">Services Management</h2>

      <div className="service-form-card">
        <form className="service-form">
          
         
          <div className="form-group">
            <label>Service Name</label>
            <input 
              type="text" 
              name="name"
              value={serviceData.name}
              onChange={handleChange}
              placeholder="Enter service name"
            />
          </div>

         
          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description"
              value={serviceData.description}
              onChange={handleChange}
              rows="6"
            ></textarea>
          </div>

      
          <div className="form-row">
            <div className="form-group small">
              <label>Price</label>
              <div className="price-input-wrapper">
                <span className="currency-prefix">LE</span>
                <input 
                  type="text" 
                  name="price"
                  value={serviceData.price}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group small">
              <label>Status</label>
              <select 
                name="status" 
                value={serviceData.status} 
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

       
          <div className="form-actions-buttons">
            <button type="button" className="btn-action add-btn" onClick={handleAdd}>Add New</button>
            <button type="button" className="btn-action edit-btn" onClick={handleEdit}>Edit</button>
            <button type="button" className="btn-action delete-btn" onClick={handleDelete}>Delete</button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ServicesManagementPage;