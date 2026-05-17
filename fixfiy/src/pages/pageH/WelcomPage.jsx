
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Wrench, ArrowRight } from "lucide-react";
import "./welcomepage.css";

const WelcomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleSelection = (role) => {
    if (role === "client") {
      navigate("/signin-client");
    } else {
      navigate("/signin-worker");
    }
  };

  return (
    <div className="welcome-page">
      {/* Hero Section */}
      <section className="hero-section-modern">
        <div className="hero-background-overlay"></div>

        <div className="hero-main-content">
          <span className="hero-tagline">Trusted Home Services Platform</span>

          <h1>
            FIXIFY Makes Home Services
            <span> Fast, Reliable & Professional</span>
          </h1>

          <p>
            Whether you need expert repairs or want to offer your skills,
            FIXIFY connects clients with verified workers seamlessly.
          </p>

          <div className="hero-action-buttons">
            <button
              className="primary-cta-btn"
              onClick={() => setShowModal(true)}
            >
              Get Started <ArrowRight size={18} />
            </button>

            <button
              className="secondary-cta-btn"
              onClick={() => navigate("/login")}
            >
              Log In
            </button>
          </div>

          <div className="hero-stats-grid">
            <div>
              <strong>10K+</strong>
              <span>Completed Services</span>
            </div>
            <div>
              <strong>500+</strong>
              <span>Verified Technicians</span>
            </div>
            <div>
              <strong>4.9★</strong>
              <span>Customer Satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
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
};

export default WelcomePage;
