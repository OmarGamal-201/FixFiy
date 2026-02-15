
import React from 'react';
import "./ClientHomePage.css";
import { useNavigate } from "react-router-dom";
import {  Zap, Droplets, Hammer, Paintbrush,  Star, User, CheckCircle, MapPin,  CalendarCheck, Search, ArrowRight } from 'lucide-react';

function ClientHomePage() {
  
  const renderStars = (rating) => (
    <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          size={16} 
          fill={i < rating ? "#FFD700" : "none"} 
          color={i < rating ? "#FFD700" : "#cbd5e1"} 
        />
      ))}
    </div>
  );
const navigate = useNavigate();

const handleServiceClick = (serviceName) => {
 
  navigate(`/workers/${serviceName}`);
};
  return (
    <div className="page">
      <div className="content">

        
        <div className="banner">
          <div className="banner-text">
            <h2>Find the best technicians near you in seconds!</h2>
            <button className="get-started">
              Get Started <ArrowRight size={18} style={{marginLeft: '8px'}} />
            </button>
          </div>
          <div className="banner-icon-bg">
             <img src="src\assets\download (7).png" size={100} strokeWidth={1} opacity={0.2} />
          </div>
        </div>

        
        <h3>Our Services</h3>
        <div className="services">
          <div className="service"onClick={() => handleServiceClick('Electricity')}><Zap size={24} color="#eab308" /> Electricity</div>
          <div className="service"onClick={() => handleServiceClick('Plumber')}><Droplets size={24} color="#3b82f6" /> Plumber</div>
          <div className="service"onClick={() => handleServiceClick('Carpenter')}><Hammer size={24} color="#f97316" /> Carpenter</div>
          <div className="service"onClick={() => handleServiceClick('Painter')}><Paintbrush size={24} color="#a855f7" /> Painter</div>
        </div>

        
        <h3>Top Rated Workers</h3>
        <div className="workers">
          {[
            { name: "Ahmed Samy", job: "Electrician", rate: 5 },
            { name: "Omer Samir", job: "Plumber", rate: 4 },
            { name: "Mahmoud Ali", job: "Painter", rate: 3 }
          ].map((worker, index) => (
            <div className="worker-card" key={index}>
              <div className="worker-avatar">{/*<User size={30} />*/}</div>
              <p className="worker-name">{worker.name}</p>
              <p className="worker-job">{worker.job}</p>
              {renderStars(worker.rate)}
              <div className="card-actions">
                <button className="view-profile" onClick={() => navigate(`/worker-profile/${worker.id}`)}>View Profile</button>
                <button className="contact">Contact</button>
              </div>
            </div>
          ))}
        </div>

       
        <h3 style={{marginTop: '40px'}}>How it works</h3>
        <div className="steps">
          <div className="step-item">
            <div className="step-icon"><Search size={22} /></div>
            <p>1. Choose a service</p>
          </div>
          <div className="step-item">
            <div className="step-icon"><MapPin size={22} /></div>
            <p>2. Specify location</p>
          </div>
          <div className="step-item">
            <div className="step-icon"><CalendarCheck size={22} /></div>
            <p>3. Book a worker</p>
          </div>
          <div className="step-item">
            <div className="step-icon"><CheckCircle size={22} /></div>
            <p>4. Task completed</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ClientHomePage;