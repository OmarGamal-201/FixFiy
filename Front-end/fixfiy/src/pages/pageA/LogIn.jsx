
import { useState } from "react";
import "./LogIn.css";
import React from "react";
import { Link, useNavigate } from "react-router-dom"; 

function LogIn() {
  const navigate = useNavigate(); 
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
  e.preventDefault();
  if (form.email && form.password) {
    
    navigate('/admin-home'); 
  } else {
    alert("Please fill in all fields");
  }
};

  return (
    <div className="container">
      <form className="form" onSubmit={handleSubmit}>
        <h2 className="login-header">Login</h2>
        
        <label>Email
          <input 
            name="email" 
            type="email" 
            value={form.email}
            onChange={handleChange} 
            placeholder="example@mail.com"
            required
          />
        </label>

        <label> Password
          <input 
            name="password" 
            type="password" 
            value={form.password}
            onChange={handleChange} 
            placeholder="********"
            required
          />
          
          <Link to="/reset-password" name="forget" className="forget-password">forget password?</Link>
        </label>

        <button type="submit" className="login-btn">Log in</button>

        
        <div className="signup-link">
          <span>Don't have an account? </span>
          <Link to="/signin-client" style={{ fontWeight: 'bold', color: '#007bff' }}>
             Create Account
          </Link>
        </div>
      </form>
    </div>
  );
}

export default LogIn;