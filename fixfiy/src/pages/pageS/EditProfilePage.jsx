

// =============================
// EditProfilePage.jsx
// FRONTEND ONLY FIXED VERSION
// =============================
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
    governorate: "",
    city: "",
    street: "",
    experience_years: "",
    specialty: "",
    availability_status: "",
    role: "",
  });

  // ================= GET USER DATA =================
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/profile/me");
        const profileData = res.data.data || res.data;

        setFormData((prev) => ({
          ...prev,
          name: profileData.name || "",
          email: profileData.email || "",
          governorate: profileData.address?.governorate || "",
          city: profileData.address?.city || "",
          street: profileData.address?.street || "",
          experience_years: profileData.experience_years || "",
          specialty: profileData.specialty || "",
          availability_status:
            profileData.availability_status?.toString() || "true",
          role: profileData.role || "",
        }));

        // FIXED IMAGE PREVIEW
        if (
          profileData.profilePicture &&
          profileData.profilePicture.length > 0
        ) {
          const imageUrl = profileData.profilePicture[0].url.startsWith("http")
            ? profileData.profilePicture[0].url
            : `${API.defaults.baseURL}/${profileData.profilePicture[0].url}`;

          setImagePreview(imageUrl);
        }
      } catch (err) {
        console.error("Fetch User Error:", err);
      }
    };

    fetchUser();
  }, []);

  // ================= HANDLE INPUT CHANGE =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= HANDLE IMAGE CHANGE =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ================= SUBMIT FORM =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Basic profile data
      const profileData = {
        name: formData.name,
        email: formData.email,
        governorate: formData.governorate,
        city: formData.city,
        street: formData.street,
      };

      // Technician-specific fields
      if (formData.role === "technician") {
        profileData.experience_years = Number(formData.experience_years);
        profileData.specialty = formData.specialty;
        profileData.availability_status =
          formData.availability_status === "true";
      }

      // ================= UPDATE PROFILE =================
      if (imageFile) {
        const data = new FormData();

        Object.keys(profileData).forEach((key) => {
          data.append(key, profileData[key]);
        });

        // Backend expected field name
        data.append("profilePicture", imageFile);

        await API.put("/profile/me", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await API.put("/profile/me", profileData);
      }
      window.dispatchEvent(new Event("profileUpdate")); 

      alert("Profile updated successfully");

      // ================= CHANGE PASSWORD =================
      if (formData.currentPassword && formData.newPassword) {
        await API.put("/profile/change-password", {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
      }

      alert("Profile updated successfully");

      // Navigate based on role
      if (formData.role === "technician") {
        navigate("/worker-profile");
      } else {
        navigate("/client-profile");
      }
    } catch (err) {
console.log(err.response.data.errors);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.errors?.join(", ") ||
        "Error updating profile";

      alert(errorMsg);
    }
  };

  return (
    <div className="account-card">
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
          <label>Governorate</label>
          {/* <input
            type="text"
            name="governorate"
            value={formData.governorate}
            onChange={handleChange}
            placeholder="Enter your governorate"
          /> */}
          <select
  name="governorate"
  value={formData.governorate}
  onChange={handleChange}
>
  <option value="">Select Governorate</option>
  <option value="Cairo">Cairo</option>
  <option value="Giza">Giza</option>
  <option value="Alexandria">Alexandria</option>
  <option value="Dakahlia">Dakahlia</option>
  <option value="Red Sea">Red Sea</option>
  <option value="Beheira">Beheira</option>
  <option value="Fayoum">Fayoum</option>
  <option value="Gharbia">Gharbia</option>
  <option value="Ismailia">Ismailia</option>
  <option value="Monufia">Monufia</option>
  <option value="Minya">Minya</option>
  <option value="Qalyubia">Qalyubia</option>
  <option value="New Valley">New Valley</option>
  <option value="Suez">Suez</option>
  <option value="Aswan">Aswan</option>
  <option value="Assiut">Assiut</option>
  <option value="Beni Suef">Beni Suef</option>
  <option value="Port Said">Port Said</option>
  <option value="Damietta">Damietta</option>
  <option value="Sharqia">Sharqia</option>
  <option value="South Sinai">South Sinai</option>
  <option value="Kafr El Sheikh">Kafr El Sheikh</option>
  <option value="Matrouh">Matrouh</option>
  <option value="Luxor">Luxor</option>
  <option value="Qena">Qena</option>
  <option value="North Sinai">North Sinai</option>
  <option value="Sohag">Sohag</option>
</select>
        </div>

        <div className="input-group">
          <label>City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter your city"
          />
        </div>

        <div className="input-group">
          <label>Street</label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="Enter your street"
          />
        </div>

        {/* ================= TECHNICIAN FIELDS ================= */}
        {formData.role === "technician" && (
          <>
            <div className="input-group">
              <label>Experience Years</label>
              <input
                type="number"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                placeholder="Enter your experience years"
              />
            </div>

            <div className="input-group">
              <label>Specialty</label>
              <input
                type="text"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                placeholder="Enter your specialty"
              />
            </div>

            <div className="input-group">
              <label>Availability Status</label>
              <select
                name="availability_status"
                value={formData.availability_status}
                onChange={handleChange}
                className="form-control"
              >
                <option value="true">Available</option>
                <option value="false">Busy / Not Available</option>
              </select>
            </div>
          </>
        )}

        {/* ================= PASSWORD ================= */}
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
            Save
          </button>

          <button
            type="button"
            className="btn-cancel"
            onClick={() => {
              const role = formData.role || localStorage.getItem("userRole");

              if (role === "technician") {
                navigate("/worker-profile");
              } else {
                navigate("/client-profile");
              }
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