
import React, { useState } from 'react'; 
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import './ClientManagementPage.css';

const ClientManagementPage = () => {
  
  const [showAll, setShowAll] = useState(false);

  
  const [clients] = useState([
    { id: 1, name: 'Ahmed', email: 'ahmed@example.com', service: 'plumber', status: 'Active' },
    { id: 2, name: 'Sami', email: 'sami@example.com', service: 'carpenter', status: 'Not Active' },
    { id: 3, name: 'Ali', email: 'ali@example.com', service: 'painter', status: 'Active' },
    { id: 4, name: 'Mona', email: 'mona@example.com', service: 'electrician', status: 'Active' },
    { id: 5, name: 'Sara', email: 'sara@example.com', service: 'plumber', status: 'Active' },
  ]);

 
  const displayedClients = showAll ? clients : clients.slice(0, 3);

  return (
    <div className="management-container">
     
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 className="management-title">Client Management</h2>
        
       
        <span 
          className="view-all-link" 
          onClick={() => setShowAll(!showAll)}
          style={{ cursor: 'pointer', color: '#1976d2', fontWeight: 'bold', fontSize: '14px' }}
        >
          {showAll ? "Show less" : "View all"}
        </span>
      </div>

      <div className="management-table-card">
        <table className="management-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Service</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
          
            {displayedClients.map((client) => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td className="email-cell">{client.email}</td>
                <td>{client.service}</td>
                <td>
                  <span className={`status-badge ${client.status === 'Active' ? 'active' : 'not-active'}`}>
                    {client.status}
                  </span>
                </td>
                <td className="action-cells">
                  <button className="action-btn edit"><Edit size={18} /></button>
                  <button className="action-btn delete"><Trash2 size={18} /></button>
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