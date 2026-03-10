import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = ({ userData }) => {
  const navigate = useNavigate();
  
  const defaultAdmin = {
    name: "Admin Name",
    role: "admin",
    email: "admin@example.com",
    phone: "01012345678",
    location: "Region, City, Country",
    stats: [
      { label: "Requests", value: "150" },
      { label: "Workers", value: "450" },
      { label: "Clients", value: "1,200" }
    ]
  };
  const displayUser = userData || defaultAdmin;
  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="cover-photo"></div>
        <div className='name-photo'>
          <div className="profile-info-main">
            <div className="avatar">
              {displayUser.role !== 'admin' && <span className="status-dot"></span>}
            </div>
            <h1 className="user-name">{displayUser.name}</h1>
          </div>
          <div className='edit-btn'>
            <button className="edit-profile-btn" onClick={() => navigate('/edit-profile')}>
              <span className="edit-icon"></span> Edit Profile
            </button>
          </div>
        </div>
      </div>
      <div className="profile-content">
        <div className="info-card">
          <h3>Info</h3>
          <p><strong>Email:</strong> {displayUser.email}</p>
          <p><strong>Phone:</strong> {displayUser.phone}</p>
          <p><strong>Location:</strong> {displayUser.location}</p>
          {displayUser.role === 'worker' && <p><strong>Profession:</strong> Painter</p>}
        </div>
        <div className='stats-section'>
          <h3>{displayUser.role === 'client' ? 'Frequently Services' : 'Quick Stats'}</h3>
          <div className="stats-grid">
            {displayUser.stats && displayUser.stats.map((stat, index) => (
              <div key={index} className="stat-box">
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;