import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react'; 
import "./systemsetting.css"
const SettingsContent = () => {
  const [darkMode, setDarkMode] = useState(false);
const [language, setLanguage] = useState('English');
  const [primaryColor, setPrimaryColor] = useState('#0078E5');
  const handleDarkMode = () => {
    setDarkMode(!darkMode);
    
    document.body.classList.toggle('dark-theme');
  };

return (
    <div className="settings-main-content">
      <div className="settings-card">
        
       
        <section className="settings-group">
          <h3 className="group-label">Color & Theme</h3>
          <div className="theme-box">
            <div className="primary-color-section">
           
              <input 
                type="color" 
                value={primaryColor} 
                onChange={(e) => setPrimaryColor(e.target.value)}
                id="colorPicker"
                style={{ display: 'none' }} 
              />
              <label htmlFor="colorPicker" className="color-square" style={{ backgroundColor: primaryColor, cursor: 'pointer' }}></label>
              
              <div className="color-text">
                <p className="main-p">Primary color</p>
                <p className="sub-p">{primaryColor}</p>
              </div>
            </div>
            
            <div className="dark-mode-section">
              <span>Dark Mode</span>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={darkMode} 
                  onChange={handleDarkMode} 
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </section>

        
        <section className="settings-group">
          <h3 className="group-label">System Language</h3>
          <div className="language-selector">
            <button 
              className={`lang-option ${language === 'English' ? 'active' : ''}`}
              onClick={() => setLanguage('English')}
            >
              English
            </button>
            <button 
              className={`lang-option ${language === 'Arabic' ? 'active' : ''}`}
              onClick={() => setLanguage('Arabic')}
            >
              Arabic
            </button>
          </div>
        </section>
        <section className="settings-group">
           <h3 className="group-label">Logo</h3>
          <div className="logo-upload-box">
             <p className="upload-hint">Recommended size: 5MB</p>
             <label className="custom-file-upload">
               <input type="file" />
               chose image
             </label>
           </div>
        </section>
      </div>
    </div>
)
};

export default SettingsContent;