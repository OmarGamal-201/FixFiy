import { useState } from "react";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./ResetNewPassword.css";

function ResetNewPassword() {
  const { token } = useParams(); // 🔥 مهم
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await API.put(`/auth/reset-password/${token}`, {
  password: form.password,
});

      alert(res.data.message || "Password reset successful");

      navigate("/login");

    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
        "Reset failed"
      );
    }
  };

  return (
    <div className="container">
      <div className="form-wrapper">
        <h1 className="page-title">Reset New Password</h1>

        <form className="form" onSubmit={handleSubmit}>
          
          <label>Password
            <input
              name="password"
              type="password"
              onChange={handleChange}
              required
            />
          </label>

          <label>Confirm Password
            <input
              name="confirmPassword"
              type="password"
              onChange={handleChange}
              required
            />
          </label>

          <button type="submit">Reset Password</button>

        </form>
      </div>
    </div>
  );
}

export default ResetNewPassword;