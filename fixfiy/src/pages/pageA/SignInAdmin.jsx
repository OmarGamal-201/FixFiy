
import { useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./SignInAdmin.css";
import { Eye, EyeOff } from "lucide-react";

const ADMIN_EMAIL = "admin@fixfiy.com";
const ADMIN_PASSWORD = "Admin@1234";

function SignInAdmin({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.email === ADMIN_EMAIL && form.password === ADMIN_PASSWORD) {
      if (onLogin) onLogin(); 
      navigate('/home');
    } else {
      setError("Invalid email or password!");
    }
  };

  return (
    <div className="container">
      <form className="form" onSubmit={handleSubmit}>
        <h2 className="form-title">Admin Login</h2>

        <label>Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="admin@fixfiy.com"
            required
          />
        </label>

        <label>Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="****"
            required
          />
        </label>

        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

        <button type="submit" className="signin-btn">Login</button>
      </form>
    </div>
  );
}

export default SignInAdmin;