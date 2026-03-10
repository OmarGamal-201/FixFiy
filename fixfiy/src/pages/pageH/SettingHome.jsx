import React from 'react';
import { useNavigate } from 'react-router-dom';
import './settinghome.css';

const SettingsOverview = () => {
  const navigate = useNavigate();

  const settingOptions = [
    {
      id: 'account',
      title: 'Account Setting',
      description: 'Change your name, email and password',
      path: '/edit-profile'
    },
    {
      id: 'system',
      title: 'System Setting',
      description: 'Change language, colors and logo',
      path: '/system-setting'
    },
    {
      id: 'user-control',
      title: 'User Control',
      description: 'Enable, disable and manage users accounts',
      path: '/admin/worker-management'
    },
    {
      id: 'system-management',
      title: 'System Management',
      description: 'Add, edit and remove services',
      path: '/admin/service-management'
    }
  ];

  return (
    <div className="settings-overview-container">
      <h2 className="settings-title">Settings</h2>
      
      <div className="options-list">
        {settingOptions.map((option) => (
          <div 
            key={option.id} 
            className="setting-option-card"
            onClick={() => navigate(option.path)}
          >
            <div className="option-info">
              <h3>{option.title}</h3>
              <p>{option.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsOverview;