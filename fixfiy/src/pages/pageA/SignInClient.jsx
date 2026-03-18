import { useState } from 'react';
import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import API from "../../services/api";
import "./SignInClient.css";

function SignInClient({ onLogin }) {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
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

    console.log("🔥 CLIENT SUBMIT", form);

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
        role: "client",
        address: {
          street: form.street,
          city: form.city,
          governorate: form.governorate,
        },
        location: {
          coordinates: [31.2, 30.1],
        },
      });

      console.log("✅ SUCCESS:", res.data);

      // حفظ البيانات
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userRole", "client");

      // تحديث state
      onLogin("client");

      // 🔥 ندي فرصة للـ state يتحدث
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

        <h2>Create Client Account</h2>

        <input name="name" placeholder="Name" onChange={handleChange} required />
        <input name="email" placeholder="Email" onChange={handleChange} required />
        <input name="phone" placeholder="Phone" onChange={handleChange} required />

        <input name="street" placeholder="Street" onChange={handleChange} />
        <input name="city" placeholder="City" onChange={handleChange} />
        <input name="governorate" placeholder="Governorate" onChange={handleChange} />

        <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
        <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />

        <button type="submit">
          Sign up
        </button>

        <Link to="/login-client">Login</Link>

      </form>
    </div>
  );
}

export default SignInClient;