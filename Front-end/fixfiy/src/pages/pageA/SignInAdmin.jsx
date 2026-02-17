
import { useState } from 'react';
import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import "./SignInAdmin.css";

function SignInAdmin() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    job: "",
  });

 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    
    console.log("Account Created:", form);
    alert("Sign up successful!");
    
 
    navigate('/admin-home'); 
  };

  return (
    <div className="container">
      <form className="form" onSubmit={handleSubmit}>
        <h2 className="form-title">Create Admin Account</h2>

        <label>Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>

        <label>Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>

        <label>Phone Number
          <input name="phone" value={form.phone} onChange={handleChange} required />
        </label>

        <label>Create Password
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </label>

        <label>Confirm Password
          <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required />
        </label>
        
        <button type="submit" className="signin-btn">Sign up</button>

       
        <div className="login-link-container">
          <span>Already have an account? </span>
          <Link to="/login" style={{ color: '#007bff', fontWeight: 'bold' }}>Log in</Link>
        </div>
      </form>
    </div>
  );
}

export default SignInAdmin;