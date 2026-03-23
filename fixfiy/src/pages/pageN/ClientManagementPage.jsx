import React, { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import API from "../../services/api";
import './ClientManagementPage.css';

const ClientManagementPage = () => {

  const [clients, setClients] = useState([]);
  const [showAll, setShowAll] = useState(false);

  // ✅ fetch clients
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

  // ✅ suspend
  const suspendUser = async (id) => {
    await API.patch(`/admin/users/${id}/suspend`);
    setClients(prev =>
      prev.map(c => c._id === id ? { ...c, status: "SUSPENDED" } : c)
    );
  };

  // ✅ restore
  const restoreUser = async (id) => {
    await API.patch(`/admin/users/${id}/restore`);
    setClients(prev =>
      prev.map(c => c._id === id ? { ...c, status: "ACTIVE" } : c)
    );
  };

  const displayedClients = showAll ? clients : clients.slice(0, 5);

  return (
    <div className="management-container">

      <div className="header">
        <h2>Client Management</h2>
        <span onClick={() => setShowAll(!showAll)}>
          {showAll ? "Show less" : "View all"}
        </span>
      </div>

      <div className="management-table-card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {displayedClients.map((client) => (
              <tr key={client._id}>
                <td>{client.name}</td>
                <td>{client.email}</td>
                <td>{client.status || "ACTIVE"}</td>

                <td>
                  {client.status === "SUSPENDED" ? (
                    <button onClick={() => restoreUser(client._id)}>
                      Restore
                    </button>
                  ) : (
                    <button onClick={() => suspendUser(client._id)}>
                      Suspend
                    </button>
                  )}
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