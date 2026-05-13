import { useState } from 'react';
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

  // show / hide password

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  // error message

  const [errorMsg, setErrorMsg] =
    useState("");

  // loading

  const [loading, setLoading] =
    useState(false);

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    setErrorMsg("");
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    // confirm password

    if (
      form.password !== form.confirmPassword
    ) {

      setErrorMsg(
        "Passwords do not match!"
      );

      return;
    }

    try {

      setLoading(true);

      const res = await API.post(
        "/auth/register",
        {
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
            governorate:
              form.governorate,
          },

          location: {
            coordinates: [31.3, 30.2],
          },
        }
      );

      // save token

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "userRole",
        "worker"
      );

      // login

      onLogin("technician");

      // navigate

      setTimeout(() => {

        navigate("/home");

      }, 100);

    } catch (error) {

      console.log(
        error.response?.data
      );

      // validation errors

      if (
        error.response?.data?.errors
      ) {

        setErrorMsg(
          error.response.data.errors.join(
            " , "
          )
        );

      } else {

        setErrorMsg(
          error.response?.data?.message ||
          "Registration failed"
        );
      }

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="container">

      <form
        className="form"
        onSubmit={handleSubmit}
      >

        {/* ERROR MESSAGE */}

        {
          errorMsg && (
            <div className="error-box">
              {errorMsg}
            </div>
          )
        }

        <h2>
          Create Worker Account
        </h2>

        {/* NAME */}

        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          required
        />

        {/* EMAIL */}

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />

        {/* PHONE */}

        <input
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
          required
        />

        {/* SPECIALTY */}

        <select
          name="job"
          value={form.job}
          onChange={handleChange}
          required
        >

          <option value="">
            Select Specialty
          </option>

          <option value="Plumber">
            Plumber
          </option>

          <option value="Electricity">
            Electricity
          </option>

          <option value="Painter">
            Painter
          </option>

          <option value="Carpinter">
            Carpinter
          </option>

          <option value="hvac">
            HVAC
          </option>

          <option value="appliance_repair">
            Appliance Repair
          </option>

          <option value="general">
            General
          </option>

        </select>

        {/* STREET */}

        <input
          name="street"
          placeholder="Street"
          onChange={handleChange}
          required
        />

        {/* CITY */}

        <input
          name="city"
          placeholder="City"
          onChange={handleChange}
          required
        />

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

        {/* PASSWORD */}

        <div className="password-field">

          <input
            name="password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Password"
            onChange={handleChange}
            required
          />

          <span
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
          >

            {
              showPassword
                ? <EyeOff size={20} />
                : <Eye size={20} />
            }

          </span>

        </div>

        {/* CONFIRM PASSWORD */}

        <div className="password-field">

          <input
            name="confirmPassword"
            type={
              showConfirm
                ? "text"
                : "password"
            }
            placeholder="Confirm Password"
            onChange={handleChange}
            required
          />

          <span
            onClick={() =>
              setShowConfirm(
                !showConfirm
              )
            }
          >

            {
              showConfirm
                ? <EyeOff size={20} />
                : <Eye size={20} />
            }

          </span>

        </div>

        {/* BUTTON */}

        <button
          type="submit"
          disabled={loading}
        >

          {
            loading
              ? "Creating..."
              : "Sign up as Worker"
          }

        </button>

        {/* FOOTER */}

        <p className="auth-footer">

          Already have an account?

          <Link to="/login">
            Log In
          </Link>

        </p>

      </form>

    </div>
  );
}

export default SignInWorker;