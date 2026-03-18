import { useState } from 'react';
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from "../../services/api";
import "./SignInWorker.css";

function SignInWorker({ onLogin }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    job: "",
    street: "",
    city: "",
    governorate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 🔥 مهم جدا

    console.log("🔥 WORKER SUBMIT", form);

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: "technician",
        specialty: form.job,
        experience_years: 1,
        address: {
          street: form.street,
          city: form.city,
          governorate: form.governorate,
        },
        location: {
          coordinates: [31.3, 30.2],
        },
      });

      console.log("✅ SUCCESS:", res.data);

      // حفظ البيانات
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userRole", "worker");

      // تحديث state
      onLogin("worker");

      // 🔥 تأخير بسيط عشان نضمن تحديث الـ state
      setTimeout(() => {
        navigate("/home");
      }, 100);

    } catch (error) {
      console.log("❌ ERROR FULL:", error);

      alert(
        error.response?.data?.message ||
        "Registration failed"
      );
    }
  };

  return (
    <div className="container">
      <form className="form" onSubmit={handleSubmit}>

        <h2>Create Worker Account</h2>

        <input name="name" placeholder="Name" onChange={handleChange} required />
        <input name="email" placeholder="Email" onChange={handleChange} required />
        <input name="phone" placeholder="Phone" onChange={handleChange} required />

        <input name="job" placeholder="Job (plumber, electrician...)" onChange={handleChange} required />

        <input name="street" placeholder="Street" onChange={handleChange} />
        <input name="city" placeholder="City" onChange={handleChange} />
        <input name="governorate" placeholder="Governorate" onChange={handleChange} />

        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />

        <button type="submit">
          Sign up as Worker
        </button>

        <Link to="/login-worker">Login</Link>

      </form>
    </div>
  );
}

export default SignInWorker;