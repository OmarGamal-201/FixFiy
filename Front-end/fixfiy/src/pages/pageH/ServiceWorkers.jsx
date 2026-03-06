import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import './serviceworkers.css';

const ServiceWorkersPage = () => {

  const { serviceName } = useParams(); 

  
  const allWorkers = [
    { id: 1, name: "Ahmed Mohamed", service: "Electrician", rating: 5 },
    { id: 2, name: "Ali Hassan", service: "Electrician", rating: 4 },
    { id: 3, name: "Sayed Ali", service: "Plumber", rating: 5 },
  
  ];

 
  const filteredWorkers = allWorkers.filter(worker => worker.service === serviceName);

  return (
    <div className="workers-gallery-container">

      <h2 className="service-title">{serviceName || "Our Workers"}</h2>

      <div className="workers-grid">
        {filteredWorkers.map((worker) => (
          <div key={worker.id} className="worker-card">
            <div className="worker-avatar">
              <div className="placeholder-img">👤</div>
            </div>
            
            <div className="worker-info">
              <h4>{worker.name}</h4>
              <p className="worker-job">{worker.service}</p>
              
              <div className="rating-stars">
                {[...Array(worker.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#FFD700" color="#FFD700" />
                ))}
                <span className="rating-num">{worker.rating}</span>
              </div>
            </div>

            <div className="worker-actions">
              <button className="view-profile-btn">View Profile</button>
              <button className="contact-btn">Contact</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceWorkersPage;