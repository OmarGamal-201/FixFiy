

import React, { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import API from "../../services/api";
import './ClientManagementPage.css';

const ClientManagementPage = () => {

  const [clients, setClients] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await API.get("/admin/users?role=client");
        setClients(res.data.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchClients();
  }, []);

  const suspendUser = async (id) => {
    await API.patch(`/admin/users/${id}/suspend`);
    setClients(prev =>
      prev.map(c => c._id === id ? { ...c, status: "SUSPENDED" } : c)
    );
  };

  const restoreUser = async (id) => {
    await API.patch(`/admin/users/${id}/restore`);
    setClients(prev =>
      prev.map(c => c._id === id ? { ...c, status: "ACTIVE" } : c)
    );
  };

  const displayedClients = showAll ? clients : clients.slice(0, 5);

  return (
    <div className="management-container">

      {/* <h2 className="management-title">Client Management</h2>

      {/* 🔍 Search + Button */}
      {/* <div className="table-controls">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="table-search-input"
            placeholder="Search clients..."
          />
        </div>

        <button className="add-new-btn">
          + Add New
        </button>
      </div> */} 


{/* 🔽 Show more */}
      {/* <div style={{ marginTop: "15px", cursor: "pointer" }}>
        <span onClick={() => setShowAll(!showAll)}>
          {showAll ? "Show less" : "View all"}
        </span>
      </div> */}
<div className="view-toggle">
  <span onClick={() => setShowAll(!showAll)}>
    {showAll ? "Show less" : "View all"}
  </span>
</div>

      {/* 📊 TABLE */}
      <div className="management-table-card">
        <table className="management-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {displayedClients.map((client) => (
              <tr key={client._id}>
                <td>{client.name}</td>

                <td className="email-cell">
                  {client.email}
                </td>

              <td className="address-cell">
{client.address?.city}, {client.address?.governorate}
              </td>
                

                {/*  Status Badge */}
                <td>
                  <span
                    className={`status-badge ${
                      client.status === "SUSPENDED"
                        ? "not-active"
                        : "active"
                    }`}
                  >
                    {client.status || "ACTIVE"}
                  </span>
                </td>

                {/*  Actions */}
                <td>
                  <div className="action-cells">

                    {client.status === "SUSPENDED" ? (
                      <button
                        className="action-btn edit"
                        onClick={() => restoreUser(client._id)}
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        className="action-btn delete"
                        onClick={() => suspendUser(client._id)}
                      >
                        Suspend
                      </button>
                    )}

                    {/* Icons لو حابة */}
                    {/* <button className="action-btn edit">
                      <Edit size={16} />
                    </button>

                    <button className="action-btn delete">
                      <Trash2 size={16} />
                    </button> */}

                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      

    </div>
  );
};

export default ClientManagementPage;