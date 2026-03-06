import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './welcomepage.css';

const WelcomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  
  const handleSelection = (role) => {
    if (role === 'client') {
      navigate('/signin-client'); 
    } else {
      navigate('/signin-worker'); 
    }
  };

  return (
    <div className="welcome-hero-container">
   
      <div className="hero-overlay">
        <div className="hero-content">
          <h1>WELCOME TO FIXFIY</h1>
          <h3>Best Home Services</h3>
          <p>
            Home maintenance and repairs made simple. We connect you with 
            top-tier professionals to keep your living space running perfectly
          </p>
          
          <button className="get-start-btn" onClick={() => setShowModal(true)}>
            Get Start
          </button>
        </div>
      </div>

 
      {showModal && (
        <div className="selection-modal-overlay">
          <div className="selection-card">
            <h2>Join Us As</h2>
            <p>Please select your account type to continue</p>
            
            <div className="selection-options">
              <div className="option-box" onClick={() => handleSelection('client')}>
                <div className="icon-circle">👤</div>
                <span>Client</span>
              </div>
              
              <div className="option-box" onClick={() => handleSelection('worker')}>
                <div className="icon-circle">🛠️</div>
                <span>Worker</span>
              </div>
            </div>
            
            <button className="close-modal" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomePage;