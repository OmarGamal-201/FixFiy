import { useState } from "react";
import { User, Wrench, ArrowRight } from "lucide-react";
import "./Login.css";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";

function Login({ onLogin }) {

  const [showModal,
    setShowModal] =
    useState(false);

  const navigate =
    useNavigate();

  const [selectedRole,
    setSelectedRole] =
    useState("client");

  const [form,
    setForm] =
    useState({
      email: "",
      password: ""
    });

  // ================= HANDLE INPUT =================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setForm({
      ...form,
      [name]: value
    });
  };

  // ================= ACCOUNT TYPE =================

  const handleSelection = (role) => {

    if (role === "client") {

      navigate(
        "/signin-client"
      );

    } else {

      navigate(
        "/signin-worker"
      );
    }
  };

  // ================= LOGIN =================

  const handleSubmit = async (e) => {

  e.preventDefault();

  if (
    !form.email ||
    !form.password
  ) {

    alert(
      "Please fill in all fields"
    );

    return;
  }

  try {

    const res =
      await API.post(
        "/auth/login",
        form
      );

    console.log(
      "LOGIN SUCCESS:",
      res.data
    );

    // ================= USER DATA =================

    const token =
      res.data.token;

    const user =
      res.data.user;

    // ================= SAVE =================

    localStorage.setItem(
      "token",
      token
    );

    localStorage.setItem(
      "userRole",
      user.role
    );

    localStorage.setItem(
      "userId",
      user.id || user._id
    );

    localStorage.setItem(
      "userName",
      user.name || ""
    );

    console.log(
      "USER ID SAVED:",
      user._id
    );

    // ================= UPDATE LOCATION =================

    if (
      user.role ===
      "technician"
    ) {

      navigator.geolocation.getCurrentPosition(

        async (position) => {

          try {

            await API.put(
  "/profile/update-location",
  {
    coordinates: [
      position.coords.longitude,
      position.coords.latitude,
    ],
  }
);

            console.log(
              "Location updated successfully"
            );

          } catch (err) {

            console.log(
              "Location update failed",
              err
            );
          }
        },

        (error) => {

          console.log(
            "Location permission denied",
            error
          );
        }

      );
    }

    // ================= APP STATE =================

    if (onLogin) {

      onLogin(
        user.role
      );
    }

    // ================= REDIRECT =================

    navigate("/home");

  } catch (error) {

    console.log(
      "LOGIN ERROR:",
      error.response?.data
    );

    alert(
      error.response?.data?.message ||
      "Login failed"
    );
  }
};

  return (

    <div className="container">

      <form
        className="form"
        onSubmit={handleSubmit}
      >

        <h2 className="login-header">
          Login
        </h2>

        {/* EMAIL */}

        <label>

          Email

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

        </label>

        {/* PASSWORD */}

        <label>

          Password

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <Link
            to="/forgot-password"
            className="forget-password"
          >

            forget password?

          </Link>

        </label>

        {/* LOGIN BUTTON */}

        <button
          type="submit"
          className="login-btn"
        >

          Log in

        </button>

        {/* SIGNUP */}

        <div className="signup-link">

          <span>
            Don't have an account?
          </span>

          <Link
            className="create-account-link"
            onClick={() =>
              setShowModal(true)
            }
          >

            Create Account

          </Link>

        </div>

      </form>

      {/* MODAL */}
{showModal && (
        <div className="role-modal-overlay">
          <div className="role-selection-modal">
            <h2>Choose Your Account Type</h2>
            <p>Select how you’d like to use FIXIFY</p>

            <div className="role-cards-grid">
              <div
                className="role-card"
                onClick={() => handleSelection("client")}
              >
                <div className="role-icon client-icon">
                  <User size={34} />
                </div>
                <h3>Client</h3>
                <p>Book trusted professionals for your home services.</p>
              </div>

              <div
                className="role-card"
                onClick={() => handleSelection("worker")}
              >
                <div className="role-icon worker-icon">
                  <Wrench size={34} />
                </div>
                <h3>Worker</h3>
                <p>Offer your services and grow your client base.</p>
              </div>
            </div>

            <button
              className="close-role-modal"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Login;