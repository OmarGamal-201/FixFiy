
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, User, Users, Briefcase, FileText, CreditCard, Settings, LogOut, ClipboardList, ShieldCheck } from 'lucide-react';

const Sidebar = ({ userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();

  //  دالة تحدد إذا الصفحة دي هي الصفحة الحالية
  const getActiveClass = (path) => location.pathname === path ? 'active' : '';

  return (
    
    <div className="sidebar-container">
      <div className="sidebar-logo">
        <ShieldCheck size={55} color='#2563eb'/>
        <span className="logo-text">fixfiy</span>
      </div>

      <div className="sidebar-menu">

        {/*  زرار Home - لكل المستخدمين */}
        <div className={`menu-item ${getActiveClass('/home')}`} onClick={() => navigate('/home')}>
          <Home size={20} /> <span>Home</span>
        </div>

        {/*  قائمة الأدمن فقط */}
        {userRole === 'admin' && (
          <>
          <div className={`menu-item ${getActiveClass('/profile')}`} onClick={() => navigate('/profile')}>
          <User size={20} /> <span>Profile</span>
        </div>

            <div className={`menu-item ${getActiveClass('/admin/clients')}`} onClick={() => navigate('/admin/clients')}>
              <Users size={20} /> <span>Clients</span>
            </div>
            <div className={`menu-item ${getActiveClass('/admin/workers')}`} onClick={() => navigate('/admin/workers')}>
              <Briefcase size={20} /> <span>Workers</span>
            </div>
            <div className={`menu-item ${getActiveClass('/admin/service-management')}`} onClick={() => navigate('/admin/service-management')}>
              <FileText size={20} /> <span>Services</span>
            </div>
            <div className={`menu-item ${getActiveClass('/payments')}`} onClick={() => navigate('/payments')}>
              <CreditCard size={20} /> <span>Payments</span>
            </div>
          </>
        )}

        {/*  قائمة العامل فقط */}
        {userRole === 'worker' && (
          <>
            {/* <div className={`menu-item ${getActiveClass('/home')}`} onClick={() => navigate('/home')}>
              <ClipboardList size={20} /> <span>My Tasks</span>
            </div> */}
            <div className={`menu-item ${getActiveClass('/worker-profile')}`} onClick={() => navigate('/worker-profile')}>
          <User size={20} /> <span>Profile</span>
        </div>

            {/* <div className={`menu-item ${getActiveClass('/payments')}`} onClick={() => navigate('/payments')}>
              <CreditCard size={20} /> <span>Earnings</span>
            </div> */}
          </>
        )}

        {/*  قائمة العميل فقط */}
        {userRole === 'client' && (
          <>
            <div className={`menu-item ${getActiveClass('/booking')}`} onClick={() => navigate('/booking')}>
              <FileText size={20} /> <span>My Bookings</span>
            </div>
            <div className={`menu-item ${getActiveClass('/client-profile')}`} onClick={() => navigate('/client-profile')}>
          <User size={20} /> <span>Profile</span>
        </div>

          </>
        )}

        {/* البروفايل لكل المستخدمين */}
        {/* <div className={`menu-item ${getActiveClass('/profile')}`} onClick={() => navigate('/profile')}>
          <User size={20} /> <span>Profile</span>
        </div> */}

      </div>

      <div className="sidebar-footer">
        <div className={`menu-item ${getActiveClass('/setting-home')}`} onClick={() => navigate('/setting-home')}>
          <Settings size={20} /> <span>Settings</span>
        </div>

        {/*  تسجيل الخروج */}
        <div className="menu-item logout" onClick={() => {
          localStorage.removeItem('userRole');
          window.location.href = '/welcome';
        }}>
          <LogOut size={20} /> <span>Log out</span>
        </div>
      </div>
    </div>
    
    

  );
};

export default Sidebar;