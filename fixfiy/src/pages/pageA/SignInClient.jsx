

import { useState } from 'react';
import React from 'react';
import { useNavigate,Link } from 'react-router-dom'; 
import API from "../../services/api";
import { Eye, EyeOff } from "lucide-react";
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

  // 👇 حالات إظهار/إخفاء الباسورد
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 👇 state للـ error
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    setErrorMsg(""); // 👈 يمسح الرسالة أول ما يكتب
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    if (form.password !== form.confirmPassword) {
      setErrorMsg("Passwords do not match!");
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

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userRole", "client");

      onLogin("client");

      setTimeout(() => {
        navigate("/home");
      }, 100);

    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="container">
      <form className="form" onSubmit={handleSubmit}>

        {/* 👇 رسالة الخطأ */}
        {errorMsg && <div className="error-box">{errorMsg}</div>}

        <h2>Create Client Account</h2>

        <input name="name" placeholder="Name" onChange={handleChange} required />
        <input name="email" placeholder="Email" onChange={handleChange} required />
        <input name="phone" placeholder="Phone" onChange={handleChange} required />

        <input name="street" placeholder="Street" onChange={handleChange} />
        <input name="city" placeholder="City" onChange={handleChange} />
        {/* <input name="governorate" placeholder="Governorate" onChange={handleChange} /> */}
         {/* GOVERNORATE */}

        <select
          name="governorate"
          value={form.governorate}
          onChange={handleChange}
          required
        >

          <option value="">
            Select Governorate
          </option>

          <option value="Cairo">
            Cairo
          </option>

          <option value="Giza">
            Giza
          </option>

          <option value="Alexandria">
            Alexandria
          </option>

          <option value="Dakahlia">
            Dakahlia
          </option>

          <option value="Red Sea">
            Red Sea
          </option>

          <option value="Beheira">
            Beheira
          </option>

          <option value="Fayoum">
            Fayoum
          </option>

          <option value="Gharbia">
            Gharbia
          </option>

          <option value="Ismailia">
            Ismailia
          </option>

          <option value="Monufia">
            Monufia
          </option>

          <option value="Minya">
            Minya
          </option>

          <option value="Qalyubia">
            Qalyubia
          </option>

          <option value="New Valley">
            New Valley
          </option>

          <option value="Suez">
            Suez
          </option>

          <option value="Aswan">
            Aswan
          </option>

          <option value="Assiut">
            Assiut
          </option>

          <option value="Beni Suef">
            Beni Suef
          </option>

          <option value="Port Said">
            Port Said
          </option>

          <option value="Damietta">
            Damietta
          </option>

          <option value="Sharqia">
            Sharqia
          </option>

          <option value="South Sinai">
            South Sinai
          </option>

          <option value="Kafr El Sheikh">
            Kafr El Sheikh
          </option>

          <option value="Matrouh">
            Matrouh
          </option>

          <option value="Luxor">
            Luxor
          </option>

          <option value="Qena">
            Qena
          </option>

          <option value="North Sinai">
            North Sinai
          </option>

          <option value="Sohag">
            Sohag
          </option>

        </select>

        {/* 🔐 Password */}
        <div className="password-field">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            onChange={handleChange}
            required
          />
          <span onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        {/* 🔐 Confirm Password */}
        <div className="password-field">
          <input
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            onChange={handleChange}
            required
          />
          <span onClick={() => setShowConfirm(!showConfirm)}>
            {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        <button type="submit">
          Sign up
        </button>
<p className="auth-footer">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </form>
    </div>
  );
}

export default SignInClient;