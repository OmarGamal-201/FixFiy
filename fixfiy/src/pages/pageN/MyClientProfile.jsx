
import React, {
  useEffect,
  useState,
} from "react";

import API from "../../services/api";

import {
  Pencil,
  Save,
  Camera,
} from "lucide-react";

import "./MyClientProfile.css";

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

export default function MyClientProfile() {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [editMode, setEditMode] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [selectedImage, setSelectedImage] =
    useState(null);

  const [preview, setPreview] =
    useState("");

  const [formData, setFormData] =
    useState({
      name: "",
      phone: "",
      bio: "",
      street: "",
      city: "",
      governorate: "",
    });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {

    try {

      const res =
        await API.get("/profile/me");

      const data =
        res.data.data;

      setUser(data);

      setFormData({
        name:
          data.name || "",

        phone:
          data.phone || "",

        bio:
          data.bio || "",

        street:
          data.address?.street || "",

        city:
          data.address?.city || "",

        governorate:
          data.address?.governorate || "",
      });

      if (
        data.profilePicture?.length > 0
      ) {

        setPreview(
          data.profilePicture[0].url
        );
      }

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);
    }
  };

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleImageChange = (e) => {

    const file =
      e.target.files[0];

    if (!file) return;

    setSelectedImage(file);

    setPreview(
      URL.createObjectURL(file)
    );
  };

 
const handleSave = async () => {

  try {

    setSaving(true);

    const sendData =
      new FormData();

    // append only non-empty values

    if (formData.name?.trim()) {

      sendData.append(
        "name",
        formData.name
      );
    }

    if (formData.phone?.trim()) {

      sendData.append(
        "phone",
        formData.phone
      );
    }

    if (formData.bio?.trim()) {

      sendData.append(
        "bio",
        formData.bio
      );
    }

    if (
      formData.governorate?.trim()
    ) {

      sendData.append(
        "governorate",
        formData.governorate
      );
    }

    if (formData.city?.trim()) {

      sendData.append(
        "city",
        formData.city
      );
    }

    if (formData.street?.trim()) {

      sendData.append(
        "street",
        formData.street
      );
    }

    if (selectedImage) {

     sendData.append( "picture", selectedImage );
    }

    for (
      let pair of sendData.entries()
    ) {

      console.log(
        pair[0],
        pair[1]
      );
    }

    const res =
      await API.put(
        "/profile/me",
        sendData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    console.log(
      "UPDATED:",
      res.data
    );

    await fetchProfile();

    setEditMode(false);

    alert(
      "Profile updated successfully"
    );

  } catch (err) {

    console.log(
      err.response?.data
    );

    alert(
      err.response?.data
        ?.message ||
      "Failed to update profile"
    );

  } finally {

    setSaving(false);
  }
};


  if (loading) {

    return (
      <div className="profile-loading">
        Loading...
      </div>
    );
  }

  return (

    <div className="client-profile-page">

      

      <div className="client-profile-card">

        <div className="profile-header">

          <div className="profile-image-section">

            <img
              src={
                preview ||
                `https://ui-avatars.com/api/?name=${user?.name}`
              }
              alt=""
              className="profile-image"
            />

            {editMode && (

              <label className="camera-btn">

                <Camera size={18} />

                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={
                    handleImageChange
                  }
                />

              </label>
            )}

          </div>

          <div className="profile-user-info">

            <h1>
              {user.name}
            </h1>

            <p>
              Client Account
            </p>

          </div>

          {!editMode ? (

            <button
              className="edit-profile-btn"
              onClick={() =>
                setEditMode(true)
              }
            >
              <Pencil size={18} />
              Edit
            </button>

          ) : (

            <button
              className="save-profile-btn"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={18} />

              {
                saving
                  ? "Saving..."
                  : "Save"
              }

            </button>
          )}

        </div>

        <div className="profile-grid">

          <div className="profile-box">

            <h3>
              Personal Info
            </h3>

            <div className="form-group">

              <label>
                Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={
                  handleChange
                }
                disabled={!editMode}
              />

            </div>

            <div className="form-group">

              <label>
                Email
              </label>

              <input
                type="email"
                value={user.email}
                disabled
              />

            </div>

            <div className="form-group">

              <label>
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={
                  handleChange
                }
                disabled={!editMode}
              />

            </div>

          </div>

          <div className="profile-box">

            <h3>
              Address
            </h3>

            <div className="form-group">

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
                disabled={!editMode}
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

            <div className="form-group">

              <label>
                City
              </label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={
                  handleChange
                }
                disabled={!editMode}
              />

            </div>

            <div className="form-group">

              <label>
                Street
              </label>

              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={
                  handleChange
                }
                disabled={!editMode}
              />

            </div>

          </div>

          <div className="profile-box full-width">

            <h3>
              About
            </h3>

            <textarea
              rows="5"
              name="bio"
              value={formData.bio}
              onChange={
                handleChange
              }
              disabled={!editMode}
            />

          </div>

        </div>

      </div>

    </div>
  );
}

