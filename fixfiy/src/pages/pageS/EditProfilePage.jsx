import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Save } from 'lucide-react';

const EditProfilePage = ({ userData }) => {
  const navigate = useNavigate();
const [password, setPassword] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
     
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  return (
   
    <div className="account-card">
  <h2 className="settings-title">Account Setting</h2>

  <div className="profile-upload-section">
    <div 
      className="photo-preview-circle" 
      onClick={() => fileInputRef.current.click()}
      style={{ 
        backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        cursor: 'pointer'
      }}
    >
      {!imagePreview && <Camera size={30} color="#94a3b8" />}
    </div>

    <input 
      type="file" 
      ref={fileInputRef} 
      style={{ display: 'none' }} 
      accept="image/*" 
      onChange={handleImageChange} 
    />

    <span 
      className="change-photo-text" 
      onClick={() => fileInputRef.current.click()}
    >
      Change Photo
    </span>
  </div>

  <form className="settings-form-grid">
    <div className="input-group">
      <label>Full Name</label>
      <input 
        type="text" 
        defaultValue={userData?.name || ""} 
        placeholder="Enter your full name" 
      />
    </div>

    <div className="input-group">
      <label>Current Password</label>
      <input 
        type="password" 
        placeholder="********" 
        maxLength="10" 
      />
    </div>

    <div className="input-group">
      <label>Email</label>
      <input 
        type="email" 
        defaultValue={userData?.email || ""} 
        placeholder="email@example.com" 
      />
    </div>

    <div className="input-group">
      <label>New Password</label>
      <input 
        type="password" 
        placeholder="********" 
        maxLength="10"
      />
      <small style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>
        Max 10 characters
      </small>
    </div>

    <div className="form-actions">
      <button type="submit" className="btn-save">
        <Save size={18} /> Save Changes
      </button>
      <button 
        type="button" 
        className="btn-cancel" 
        onClick={() => navigate('/profile')}
      >
        Cancel
      </button>
    </div>
  </form>
</div>
  );
};
export default EditProfilePage;