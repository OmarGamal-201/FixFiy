import React, {
  useEffect,
  useState,
} from "react";

import {
  Star,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import API from "../../services/api";

import "./MyWorkerProfile.css";

const governorates = [
  "Cairo",
  "Giza",
  "Alexandria",
  "Dakahlia",
  "Red Sea",
  "Beheira",
  "Fayoum",
  "Gharbia",
  "Ismailia",
  "Monufia",
  "Minya",
  "Qalyubia",
  "New Valley",
  "Suez",
  "Aswan",
  "Assiut",
  "Beni Suef",
  "Port Said",
  "Damietta",
  "Sharqia",
  "South Sinai",
  "Kafr El Sheikh",
  "Matrouh",
  "Luxor",
  "Qena",
  "North Sinai",
  "Sohag",
];

const specialties = [
  "Plumber",
  "Electricity",
  "Painter",
  "Carpinter",
  "hvac",
  "appliance_repair",
  "general",
];

export default function MyWorkerProfile() {

  const navigate =
    useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    availabilityLoading,
    setAvailabilityLoading,
  ] = useState(false);

  const [preview, setPreview] =
    useState("");

  const [imageFile, setImageFile] =
    useState(null);

  const [formData, setFormData] =
    useState({

      name: "",

      phone: "",

      city: "",

      governorate: "",

      specialty: "",

      experience_years: 0,

      bio: "",

      availability_status: true,
    });

  useEffect(() => {

    fetchProfile();

  }, []);

  const fetchProfile = async () => {

    try {

      const res =
        await API.get(
          "/profile/me"
        );

      const user =
        res.data.data;

      setFormData({

        name:
          user.name || "",

        phone:
          user.phone || "",

        city:
          user.address?.city || "",

        governorate:
          user.address?.governorate || "",

        specialty:
          user.specialty || "",

        experience_years:
          user.experience_years || 0,

        bio:
          user.bio || "",

        availability_status:
          user.availability?.isAvailable ?? true,
      });

      if (
        user.profilePicture?.length > 0
      ) {

        setPreview(
          user.profilePicture[0].url
        );
      }

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);
    }
  };

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setFormData({

      ...formData,

      [name]: value,
    });
  };

  const handleImageChange = (e) => {

    const file =
      e.target.files[0];

    if (!file) return;

    setImageFile(file);

    setPreview(
      URL.createObjectURL(file)
    );
  };

  /* ================= SAVE PROFILE ================= */

  const handleSave = async () => {

    try {

      setSaving(true);

      const data =
        new FormData();

      data.append(
        "name",
        formData.name
      );

      data.append(
        "phone",
        formData.phone
      );

      data.append(
        "city",
        formData.city
      );

      data.append(
        "governorate",
        formData.governorate
      );

      data.append(
        "specialty",
        formData.specialty
      );

      data.append(
        "experience_years",
        formData.experience_years
      );

      data.append(
        "bio",
        formData.bio
      );

      if (imageFile) {

        data.append(
          "profilePicture",
          imageFile
        );
      }

      await API.put(
        "/profile/me",
        data,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      alert(
        "Profile updated successfully"
      );

      fetchProfile();

    } catch (err) {

      console.log(err);

      alert(
        err.response?.data?.message ||
        "Failed to update profile"
      );

    } finally {

      setSaving(false);
    }
  };

  /* ================= TOGGLE AVAILABILITY ================= */

  const toggleAvailability =
    async () => {

      try {

        setAvailabilityLoading(
          true
        );

        const newValue =
          !formData.availability_status;

        await API.put(
          "/profile/availability",
          {
            availability_status:
              newValue,
          }
        );

        setFormData({

          ...formData,

          availability_status:
            newValue,
        });

      } catch (err) {

        console.log(err);

        alert(
          "Failed to update availability"
        );

      } finally {

        setAvailabilityLoading(
          false
        );
      }
    };

  if (loading) {

    return (

      <div className="worker-profile-page">

        Loading...

      </div>
    );
  }

  return (

    <div className="worker-profile-page">

      <div className="worker-profile-card">

        {/* TOP */}

        <div className="profile-top">

          <div className="profile-image-section">

            <img
              src={
                preview ||
                "https://ui-avatars.com/api/?name=Worker"
              }
              alt=""
              className="profile-image"
            />

            <label className="upload-btn">

              Change Photo

              <input
                type="file"
                hidden
                accept="image/*"
                onChange={
                  handleImageChange
                }
              />

            </label>

          </div>

          <div className="profile-basic">

            <h2>
              Worker Profile
            </h2>

            <p>
              Manage your account and work status
            </p>

          </div>

        </div>

        {/* AVAILABILITY */}
<div className="availability-box">

  <div className="availability-content">

    <div>

      <p className="availability-title">

        {formData.availability_status
          ? "Available for work"
          : "Unavailable"}

      </p>

      <span className="availability-subtitle">

        {formData.availability_status
          ? "Clients can book you now"
          : "You are hidden from nearby workers"}

      </span>

    </div>

    <button
      className={`availability-btn ${
        formData.availability_status
          ? "on"
          : "off"
      }`}
      onClick={
        toggleAvailability
      }
      disabled={
        availabilityLoading
      }
    >

      {availabilityLoading
        ? "Updating..."
        : formData.availability_status
        ? "Turn Off"
        : "Turn On"}

    </button>

  </div>

</div>
        {/* FORM */}

        <div className="profile-grid">

          <div className="input-group">

            <label>
              Name
            </label>

            <input
              type="text"
              name="name"
              value={
                formData.name
              }
              onChange={
                handleChange
              }
            />

          </div>

          <div className="input-group">

            <label>
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={
                formData.phone
              }
              onChange={
                handleChange
              }
            />

          </div>

          <div className="input-group">

            <label>
              City
            </label>

            <input
              type="text"
              name="city"
              value={
                formData.city
              }
              onChange={
                handleChange
              }
            />

          </div>

          <div className="input-group">

            <label>
              Governorate
            </label>

            <select
              name="governorate"
              value={
                formData.governorate
              }
              onChange={
                handleChange
              }
            >

              <option value="">
                Select Governorate
              </option>

              {governorates.map(
                (gov) => (

                  <option
                    key={gov}
                    value={gov}
                  >
                    {gov}
                  </option>
                )
              )}

            </select>

          </div>

          <div className="input-group">

            <label>
              Specialty
            </label>

            <select
              name="specialty"
              value={
                formData.specialty
              }
              onChange={
                handleChange
              }
            >

              <option value="">
                Select Specialty
              </option>

              {specialties.map(
                (item) => (

                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}

            </select>

          </div>

          <div className="input-group">

            <label>
              Experience
            </label>

            <input
              type="number"
              name="experience_years"
              value={
                formData.experience_years
              }
              onChange={
                handleChange
              }
            />

          </div>

        </div>

        {/* BIO */}

        <div className="input-group full">

          <label>
            Bio
          </label>

          <textarea
            rows="5"
            name="bio"
            value={
              formData.bio
            }
            onChange={
              handleChange
            }
          />

        </div>

        {/* BUTTONS */}

        <div className="profile-actions">

          <button
            className="reviews-profile-btn"
            onClick={() =>
              navigate(
                `/worker-reviews/${localStorage.getItem("userId")}`
              )
            }
          >

            <Star size={18} />

            View My Reviews

          </button>

          <button
            className="save-btn"
            onClick={
              handleSave
            }
            disabled={saving}
          >

            {
              saving
                ? "Saving..."
                : "Save Changes"
            }

          </button>

        </div>

      </div>

    </div>
  );
}