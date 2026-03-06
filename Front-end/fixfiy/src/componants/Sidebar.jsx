
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; 
import { Home, User, Users, Briefcase, FileText, CreditCard, Settings, LogOut, ClipboardList } from 'lucide-react';

const Sidebar = ({ userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const getActiveClass = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="sidebar-container">
      <div className="sidebar-logo">
        <span className="logo-text">fixfiy</span>
      </div>

      <div className="sidebar-menu">
        
        <div className={`menu-item ${getActiveClass('/home')}`} onClick={() => navigate('/home')}>
          <Home size={20} /> <span>Home</span>
        </div>

       
        {userRole === 'admin' && (
          <>
            <div className={`menu-item ${getActiveClass('/admin/clients')}`} onClick={() => navigate('/admin/clients')}>
              <Users size={20} /> <span>Client Management</span>
            </div>
            <div className={`menu-item ${getActiveClass('/admin/workers')}`} onClick={() => navigate('/admin/workers')}>
              <Briefcase size={20} /> <span>Worker Management</span>
            </div>
            <div className={`menu-item ${getActiveClass('/admin/service-management')}`} onClick={() => navigate('/admin/service-management')}>
              <FileText size={20} /> <span>Services</span>
            </div>
          </>
        )}

        
        {userRole === 'worker' && (
          <>
            <div className={`menu-item ${getActiveClass('/worker-home')}`} onClick={() => navigate('/worker-home')}>
              <ClipboardList size={20} /> <span>My Tasks</span>
            </div>
            <div className={`menu-item ${getActiveClass('/payments')}`} onClick={() => navigate('/payments')}>
              <CreditCard size={20} /> <span>Earnings</span>
            </div>
          </>
        )}

        
        {userRole === 'client' && (
          <>
            <div className={`menu-item ${getActiveClass('/booking')}`} onClick={() => navigate('/booking')}>
              <FileText size={20} /> <span>My Bookings</span>
            </div>
            <div className={`menu-item ${getActiveClass('/payments')}`} onClick={() => navigate('/payments')}>
              <CreditCard size={20} /> <span>Payments</span>
            </div>
          </>
        )}

        
        <div className={`menu-item ${getActiveClass('/profile')}`} onClick={() => navigate('/profile')}>
          <User size={20} /> <span>Profile</span>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className={`menu-item ${getActiveClass('/setting-home')}`} onClick={() => navigate('/setting-home')}>
          <Settings size={20} /> <span>Setting</span>
        </div>
        
      
        <div className="menu-item logout" onClick={() => navigate('/welcome')}>
          <LogOut size={20} /> <span>Log out</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;