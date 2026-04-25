// import React, { useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Camera, Save } from 'lucide-react';

// const EditProfilePage = ({ userData }) => {
//   const navigate = useNavigate();
// const [password, setPassword] = useState("");
//   const [imagePreview, setImagePreview] = useState(null);
//   const fileInputRef = useRef(null);

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
     
//       const imageUrl = URL.createObjectURL(file);
//       setImagePreview(imageUrl);
//     }
//   };

//   return (
   
//     <div className="account-card">
//   <h2 className="settings-title">Account Setting</h2>

//   <div className="profile-upload-section">
//     <div 
//       className="photo-preview-circle" 
//       onClick={() => fileInputRef.current.click()}
//       style={{ 
//         backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
//         backgroundSize: 'cover',
//         backgroundPosition: 'center',
//         cursor: 'pointer'
//       }}
//     >
//       {!imagePreview && <Camera size={30} color="#94a3b8" />}
//     </div>

//     <input 
//       type="file" 
//       ref={fileInputRef} 
//       style={{ display: 'none' }} 
//       accept="image/*" 
//       onChange={handleImageChange} 
//     />

//     <span 
//       className="change-photo-text" 
//       onClick={() => fileInputRef.current.click()}
//     >
//       Change Photo
//     </span>
//   </div>

//   <form className="settings-form-grid">
//     <div className="input-group">
//       <label>Full Name</label>
//       <input 
//         type="text" 
//         defaultValue={userData?.name || ""} 
//         placeholder="Enter your full name" 
//       />
//     </div>

//     <div className="input-group">
//       <label>Current Password</label>
//       <input 
//         type="password" 
//         placeholder="********" 
//         maxLength="10" 
//       />
//     </div>

//     <div className="input-group">
//       <label>Email</label>
//       <input 
//         type="email" 
//         defaultValue={userData?.email || ""} 
//         placeholder="email@example.com" 
//       />
//     </div>

//     <div className="input-group">
//       <label>New Password</label>
//       <input 
//         type="password" 
//         placeholder="********" 
//         maxLength="10"
//       />
//       <small style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>
//         Max 10 characters
//       </small>
//     </div>

//     <div className="form-actions">
//       <button type="submit" className="btn-save">
//         <Save size={18} /> Save Changes
//       </button>
//       <button 
//         type="button" 
//         className="btn-cancel" 
//         onClick={() => navigate('/profile')}
//       >
//         Cancel
//       </button>
//     </div>
//   </form>
// </div>
//   );
// };
// export default EditProfilePage;


import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import API from "../../services/api";
const EditProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });

  // ======================
  // GET USER DATA
  // ======================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/users/me");

        setFormData((prev) => ({
          ...prev,
          name: res.data.name || "",
          email: res.data.email || "",
        }));
      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, []);

  // ======================
  // HANDLE INPUT CHANGE
  // ======================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ======================
  // IMAGE CHANGE
  // ======================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ======================
  // SUBMIT FORM
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("email", formData.email);

      if (imageFile) {
        data.append("image", imageFile);
      }

      await API.put("/users/me", data);

      // change password if provided
      if (formData.currentPassword && formData.newPassword) {
        await API.put("/users/change-password", {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
      }

      alert("Profile updated successfully");
      navigate("/profile");
    } catch (err) {
      console.log(err);
      alert("Error updating profile");
    }
  };

  return (
    <div className="account-card">
      <h2 className="settings-title">Account Setting</h2>

      {/* ================= PHOTO ================= */}
      <div className="profile-upload-section">
        <div
          className="photo-preview-circle"
          onClick={() => fileInputRef.current.click()}
          style={{
            backgroundImage: imagePreview ? `url(${imagePreview})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            cursor: "pointer",
          }}
        >
          {!imagePreview && <Camera size={30} color="#94a3b8" />}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
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

      {/* ================= FORM ================= */}
      <form className="settings-form-grid" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
          />
        </div>

        <div className="input-group">
          <label>Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            placeholder="********"
            maxLength="10"
          />
        </div>

        <div className="input-group">
          <label>New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="********"
            maxLength="10"
          />
          <small style={{ color: "#94a3b8", fontSize: "11px" }}>
            Max 10 characters
          </small>
        </div>

        {/* ================= BUTTONS ================= */}
        <div className="form-actions">
          <button type="submit" className="btn-save">
            {/* <Save size={18} /> Save Changes */}
            Save
          </button>

          <button
            type="button"
            className="btn-cancel"
           onClick={() => {
  console.log("cancel clicked");
  navigate("/profile");
}}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;
