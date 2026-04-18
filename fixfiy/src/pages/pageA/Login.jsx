import { useState } from "react";
import "./Login.css"; 
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";

function Login({ onLogin }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const res = await API.post("/auth/login", form);

      console.log(" LOGIN SUCCESS:", res.data);

      const { token, user } = res.data;

      
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", user.role);

      
      navigate("/home");

      
      if (onLogin) {
        onLogin(user.role);
      }

    } catch (error) {
      console.log(" LOGIN ERROR:", error.response?.data);
      alert(error.response?.data?.message || "Login failed");
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
            required
          />
        </label>

        <label>Password
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <Link to="/forgot-password" className="forget-password">
            forget password?
          </Link>
        </label>

        <button type="submit" className="login-btn">
          Log in
        </button>

        <div className="signup-link">
          <span>Don't have an account? </span>
          <Link to="/welcome">Create Account</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;