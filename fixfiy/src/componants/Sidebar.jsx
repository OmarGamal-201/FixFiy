import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  User,
  Users,
  Briefcase,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  ClipboardList,
  ShieldCheck
} from 'lucide-react';

const Sidebar = ({ userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    location.pathname === path ? 'active' : '';

  // 🔥 logout function
  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    window.location.href = '/welcome';
  };

  return (
    <div className="sidebar-container">

      {/* 🔵 Logo */}
      <div className="sidebar-logo" onClick={() => navigate('/home')} style={{ cursor: "pointer" }}>
        <ShieldCheck size={50} color="#2563eb" />
        <span className="logo-text">fixfiy</span>
      </div>

      {/* 🔹 MENU */}
      <div className="sidebar-menu">

        {/* 🏠 Home */}
        <div className={`menu-item ${isActive('/home')}`} onClick={() => navigate('/home')}>
          <Home size={20} />
          <span>Home</span>
        </div>

        {/* ================= CLIENT ================= */}
        {userRole === 'client' && (
          <>
            <div className={`menu-item ${isActive('/booking')}`} onClick={() => navigate('/booking')}>
              <ClipboardList size={20} />
              <span>Book Service</span>
            </div>

            <div className={`menu-item ${isActive('/my-bookings')}`} onClick={() => navigate('/my-bookings')}>
              <FileText size={20} />
              <span>My Bookings</span>
            </div>

            <div className={`menu-item ${isActive('/client-profile')}`} onClick={() => navigate('/client-profile')}>
              <User size={20} />
              <span>Profile</span>
            </div>
          </>
        )}

        {/* ================= WORKER ================= */}
        {userRole === 'technician' && (
          <>
            <div className={`menu-item ${isActive('/home')}`} onClick={() => navigate('/home')}>
              <ClipboardList size={20} />
              <span>My Jobs</span>
            </div>

            <div className={`menu-item ${isActive('/worker-profile')}`} onClick={() => navigate('/worker-profile')}>
              <User size={20} />
              <span>Profile</span>
            </div>

            <div className={`menu-item ${isActive('/payments')}`} onClick={() => navigate('/payments')}>
              <CreditCard size={20} />
              <span>Earnings</span>
            </div>
          </>
        )}

        {/* ================= ADMIN ================= */}
        {userRole === 'admin' && (
          <>
            <div className={`menu-item ${isActive('/profile')}`} onClick={() => navigate('/profile')}>
              <User size={20} />
              <span>Profile</span>
            </div>

            <div className={`menu-item ${isActive('/admin/clients')}`} onClick={() => navigate('/admin/clients')}>
              <Users size={20} />
              <span>Clients</span>
            </div>

            <div className={`menu-item ${isActive('/admin/workers')}`} onClick={() => navigate('/admin/workers')}>
              <Briefcase size={20} />
              <span>Workers</span>
            </div>

            <div className={`menu-item ${isActive('/admin/service-management')}`} onClick={() => navigate('/admin/service-management')}>
              <FileText size={20} />
              <span>Services</span>
            </div>

            <div className={`menu-item ${isActive('/payments')}`} onClick={() => navigate('/payments')}>
              <CreditCard size={20} />
              <span>Payments</span>
            </div>
          </>
        )}
      </div>

      {/* 🔻 FOOTER */}
      <div className="sidebar-footer">

        <div className={`menu-item ${isActive('/setting-home')}`} onClick={() => navigate('/setting-home')}>
          <Settings size={20} />
          <span>Settings</span>
        </div>

        <div className="menu-item logout" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Log out</span>
        </div>

      </div>
    </div>
  );
};

export default Sidebar;