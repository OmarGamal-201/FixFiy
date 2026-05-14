import React, {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  MapPin,
  ArrowLeft,
  User,
  Phone,
  Mail,
} from "lucide-react";

import API from "../../services/api";

import "./ClientProfile.css";

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function ClientProfile() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [client, setClient] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    fetchClient();
  }, []);

  const fetchClient = async () => {

    try {

      const res =
        await API.get(
          `/profile/${id}`
        );

      setClient(
        res.data.data
      );

    } catch (err) {

      console.log(err);

    } finally {

      setLoading(false);
    }
  };

  const profileImage =
    client?.profilePicture?.[0]?.url;

  if (loading) {
    return (
      <div className="client-profile-page">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="client-profile-page">
        <h2>Client not found</h2>
      </div>
    );
  }

  return (

    <div className="client-profile-page">

      <div className="client-profile-card">

        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="client-header">

          <div className="client-avatar-large">

            {profileImage ? (

              <img
                src={profileImage}
                alt={client.name}
              />

            ) : (

              getInitials(client.name)

            )}

          </div>

          <div>

            <h1>
              {client.name}
            </h1>

            <div className="client-badge">

              <User size={15} />

              Client Account

            </div>

          </div>

        </div>

        <div className="client-info-grid">

          <div className="info-box">

            <Mail size={18} />

            <div>

              <span>Email</span>

              <strong>
                {client.email}
              </strong>

            </div>

          </div>

          <div className="info-box">

            <Phone size={18} />

            <div>

              <span>Phone</span>

              <strong>
                {client.phone}
              </strong>

            </div>

          </div>

          <div className="info-box">

            <MapPin size={18} />

            <div>

              <span>Location</span>

              <strong>
                {client.address?.city}
                {" - "}
                {client.address?.governorate}
              </strong>

            </div>

          </div>

        </div>

        <div className="client-about">

          <h3>
            About
          </h3>

          <p>

            {client.bio ||
              "No bio added yet."}

          </p>

        </div>

      </div>

    </div>
  );
}