import React from 'react';
import './Worker.css';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Paintbrush, Star, User, Edit3 } from 'lucide-react';


const WorkerPage = ({ userData }) => {
  const navigate = useNavigate();
  
 
  const defaultUser = {
    name: "",
    role: "",
    email: "",
    phone: "",
    location: "R",
    job: "",
    experience: "",
    rating: 4,
    stats: [
      { label: "Completed requests", value: "" },
      { label: "Active requests", value: "" },
      { label: "Waiting requests", value: "" }
    ]
  };


  const user = userData || defaultUser;

  return (
    <div className="profile-container">
      
      <div className="profile-header">
        <div className="cover-photo"></div>
        
        <div className='name-photo-section'>
          <div className="avatar-wrapper">
            <div className="avatar">
              <User size={80} color="#ccc" />
              
              {user.role !== 'admin' && <span className="status-dot"></span>}
            </div>
          </div>
          
          <div className="user-main-info">
            <h1 className="user-name">{user.name}</h1>
            <button 
              className="edit-profile-btn" 
              onClick={() => navigate('/edit-profile')}
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      
      <div className="profile-content">
        <div className="info-card-section">
          <h3>Info</h3>
          <div className="info-card-body">
            <div className="info-grid">
              <div className="info-item">
                <Mail size={18} /> <span>{user.email}</span>
              </div>
              <div className="info-item">
                <Paintbrush size={18} /> <span>{user.job || "Service Provider"}</span>
              </div>
              <div className="info-item">
                <Phone size={18} /> <span>{user.phone}</span>
              </div>
              <div className="info-item">
                 <span className="exp-text">{user.experience || "Available for hire"}</span>
              </div>
              <div className="info-item">
                <MapPin size={18} /> <span>{user.location}</span>
              </div>
              <div className="info-item rating-display">
                <span className="rating-num">{user.rating || 5}</span>
                <div className="stars-row">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      fill={i < (user.rating || 5) ? "#ffc107" : "none"} 
                      color={i < (user.rating || 5) ? "#ffc107" : "#ccc"} 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

       
        <div className="stats-grid">
          {(user.stats || defaultUser.stats).map((stat, index) => (
            <div key={index} className="stat-box">
              <h2 className="stat-value">{stat.value}</h2>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkerPage;