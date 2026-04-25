// import { useState } from 'react';
// import React from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import API from "../../services/api";
// import "./SignInWorker.css";

// function SignInWorker({ onLogin }) {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//     confirmPassword: "",
//     job: "",
//     street: "",
//     city: "",
//     governorate: "",
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm({ ...form, [name]: value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault(); 

//     console.log(" WORKER SUBMIT", form);

//     if (form.password !== form.confirmPassword) {
//       alert("Passwords do not match!");
//       return;
//     }

//     try {
//       const res = await API.post("/auth/register", {
//         name: form.name,
//         email: form.email,
//         password: form.password,
//         phone: form.phone,
//         role: "technician",
//         specialty: form.job,
//         experience_years: 1,
//         address: {
//           street: form.street,
//           city: form.city,
//           governorate: form.governorate,
//         },
//         location: {
//           coordinates: [31.3, 30.2],
//         },
//       });

//       console.log("✅ SUCCESS:", res.data);

//       // data save 
//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("userRole", "worker");

//       // update state
//       onLogin("technician");

//       setTimeout(() => {
//         navigate("/home");
//       }, 100);

//     } catch (error) {
//       console.log(" ERROR FULL:", error);

//       alert(
//         error.response?.data?.message ||
//         "Registration failed"
//       );
//     }
//   };

//   return (
//     <div className="container">
//       <form className="form" onSubmit={handleSubmit}>

//         <h2>Create Worker Account</h2>

//         <input name="name" placeholder="Name" onChange={handleChange} required />
//         <input name="email" placeholder="Email" onChange={handleChange} required />
//         <input name="phone" placeholder="Phone" onChange={handleChange} required />

//         <input name="job" placeholder="Job (plumber, electrician...)" onChange={handleChange} required />

//         <input name="street" placeholder="Street" onChange={handleChange} />
//         <input name="city" placeholder="City" onChange={handleChange} />
//         <input name="governorate" placeholder="Governorate" onChange={handleChange} />

//         <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
//         <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required />

//         <button type="submit">
//           Sign up as Worker
//         </button>

//         {/* <Link to="/login">Login</Link> */}

//       </form>
//     </div>
//   );
// }

// export default SignInWorker;

import { useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import API from "../../services/api";
import { Eye, EyeOff } from "lucide-react";
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

  // 👇 show/hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 👇 error message
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    setErrorMsg(""); // يمسح الرسالة
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

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userRole", "worker");

      onLogin("technician");

      setTimeout(() => {
        navigate("/home");
      }, 100);

    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Registration failed");
    }
  };
console.log(showPassword);
  return (
    <div className="container">
      <form className="form" onSubmit={handleSubmit}>

        {/* 👇 error message */}
        {errorMsg && <div className="error-box">{errorMsg}</div>}

        <h2>Create Worker Account</h2>

        <input name="name" placeholder="Name" onChange={handleChange} required />
        <input name="email" placeholder="Email" onChange={handleChange} required />
        <input name="phone" placeholder="Phone" onChange={handleChange} required />

        <input name="job" placeholder="Job (plumber, electrician...)" onChange={handleChange} required />

        <input name="street" placeholder="Street" onChange={handleChange} />
        <input name="city" placeholder="City" onChange={handleChange} />
        <input name="governorate" placeholder="Governorate" onChange={handleChange} />

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
          Sign up as Worker
        </button>

      </form>
    </div>
  );
}

export default SignInWorker;