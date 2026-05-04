
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

  });

  // GET USER DATA
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
          availability_status: profileData.availability_status || "",
          role: profileData.role || "",
        }));

        if (profileData.profileImage) {
          const imageUrl = profileData.profileImage.startsWith("http")
            ? profileData.profileImage
            : `${API.defaults.baseURL}${profileData.profileImage}`;
          setImagePreview(imageUrl);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchUser();
  }, []);

  // HANDLE INPUT CHANGE

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  // IMAGE CHANGE
 
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };


  // SUBMIT FORM
const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. تحضير البيانات الأساسية
      const profileData = {
        name: formData.name,
        email: formData.email,
        governorate: formData.governorate,
        city: formData.city,
        street: formData.street,
      };

      // 2. إضافة بيانات الفني (Technician) إذا كان الدور فني
      if (formData.role === "technician") {
        profileData.experience_years = Number(formData.experience_years);
        profileData.specialty = formData.specialty;
        // تحويل القيمة النصية إلى Boolean ليقبلها السيرفر
        profileData.availability_status = formData.availability_status === "true" || formData.availability_status === true;
      }

      // 3. التعامل مع إرسال الصورة أو البيانات العادية
      if (imageFile) {
        const data = new FormData();
        // إلحاق كافة البيانات داخل FormData
        Object.keys(profileData).forEach((key) => {
          data.append(key, profileData[key]);
        });
        data.append("profilePicture", imageFile); // تأكدي أن السيرفر يتوقع اسم الحقل "image"
        
        await API.put("/profile/me", data);
      } else {
        // إرسال كائن JSON عادي في حال عدم وجود صورة
        await API.put("/profile/me", profileData);
      }

      // 4. تغيير كلمة المرور إذا تم إدخالها
      if (formData.currentPassword && formData.newPassword) {
        await API.put("/profile/change-password", {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
      }

      alert("Profile updated successfully");
      navigate("/home");
    } catch (err) {
      console.error("Update Error:", err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || "Error updating profile";
      alert(errorMsg);
    }
  };
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //     if (imageFile) {
  //       const data = new FormData();
  //       data.append("name", formData.name);
  //       data.append("email", formData.email);
  //       data.append("image", imageFile);
  //       await API.put("/profile/me", data);
  //     } else {
  //       await API.put("/profile/me", {
  //         name: formData.name,
  //         email: formData.email,
  //       });
  //     }

  //     // change password if provided
  //     if (formData.currentPassword && formData.newPassword) {
  //       await API.put("/profile/change-password", {
  //         currentPassword: formData.currentPassword,
  //         newPassword: formData.newPassword,
  //       });
  //     }

  //     alert("Profile updated successfully");
  //     navigate("/profile");
  //   } catch (err) {
  //     console.error(err.response.data);
  //     alert("Error updating profile");
  //   }
  // };

  return (
    <div className="account-card">
      {/* <h2 className="settings-title">Account Setting</h2> */}

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
          <input
            type="text"
            name="governorate"
            value={formData.governorate}
            onChange={handleChange}
            placeholder="Enter your governorate"
          />
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
         {/* <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.street}
            onChange={handleChange}
            placeholder="email@example.com"
          />
        </div> */}
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
         {/* <div className="input-group">
          <label>Availability Status</label>
          <input
            type="text"
            name="availability_status"
            value={formData.availability_status}
            onChange={handleChange}
            placeholder="Enter your availability status"
          />
        </div> */}
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
        </>)}

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
  // console.log("cancel clicked");
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


