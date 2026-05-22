import React, { useState } from 'react';
import "./Sidebar.css";
import {
  useLocation,
  useNavigate
} from 'react-router-dom';

import {
  Home,
  User,
  Users,
  Briefcase,
  FileText,
  CreditCard,
  LogOut,
  ClipboardList,
  ShieldCheck,
  MessageCircle,
  Star,
  Menu,
  X
} from 'lucide-react';

const Sidebar = ({
  userRole
}) => {

  const [isOpen, setIsOpen] =
    useState(false);

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const isActive =
    (path) =>
      location.pathname ===
      path
        ? 'active'
        : '';

  // ================= LOGOUT =================

const handleLogout = () => {

  localStorage.removeItem("userRole");

  localStorage.removeItem("token");

  localStorage.removeItem("userId");

  setIsOpen(false);

  navigate("/welcome");

  window.location.reload();

};

  return (
    <>

      {/* MOBILE MENU BUTTON */}

      <button
        className="mobile-menu-btn"
        onClick={() =>
          setIsOpen(true)
        }
      >
        <Menu size={25} />
      </button>

      {/* OVERLAY */}

      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() =>
            setIsOpen(false)
          }
        ></div>
      )}

      <div className={`sidebar-container ${isOpen ? 'show-sidebar' : ''}`}>

        {/* CLOSE BUTTON */}

        <button
          className="close-sidebar-btn"
          onClick={() =>
            setIsOpen(false)
          }
        >
          <X size={24} />
        </button>

        {/* LOGO */}

        <div
          className="sidebar-logo"
          onClick={() =>
            navigate('/home')
          }
          style={{
            cursor:
              "pointer"
          }}
        >

          <ShieldCheck
            size={50}
            color="#2563eb"
          />

          <span className="logo-text">
            fixfiy
          </span>

        </div>

        {/* MENU */}

        <div className="sidebar-menu">

          {/* HOME */}

          <div
            className={`menu-item ${isActive('/home')}`}
            onClick={() => {
              navigate('/home');
              setIsOpen(false);
            }}
          >

            <Home size={20} />

            <span>
              Home
            </span>

          </div>

          {/* ================= CLIENT ================= */}

          {userRole ===
            'client' && (
              <>

                <div
                  className={`menu-item ${isActive('/booking')}`}
                  onClick={() => {
                    navigate('/booking');
                    setIsOpen(false);
                  }}
                >

                  <ClipboardList size={20} />

                  <span>
                    Create Job
                  </span>

                </div>

                <div
                  className={`menu-item ${isActive('/my-bookings')}`}
                  onClick={() => {
                    navigate('/my-bookings');
                    setIsOpen(false);
                  }}
                >

                  <FileText size={20} />

                  <span>
                    My Jobs
                  </span>

                </div>

                <div
                  className={`menu-item ${isActive('/messages')}`}
                  onClick={() => {
                    navigate('/messages');
                    setIsOpen(false);
                  }}
                >

                  <MessageCircle size={20} />

                  <span>
                    Messages
                  </span>

                </div>

                <div
                  className={`menu-item ${isActive('/client-profile')}`}
                  onClick={() => {
                    navigate('/client-profile');
                    setIsOpen(false);
                  }}
                >

                  <User size={20} />

                  <span>
                    Profile
                  </span>

                </div>

              </>
            )}

          {/* ================= TECHNICIAN ================= */}

          {userRole ===
            'technician' && (
              <>

                <div
                  className={`menu-item ${isActive('/open-jobs')}`}
                  onClick={() => {
                    navigate('/open-jobs');
                    setIsOpen(false);
                  }}
                >

                  <Briefcase size={20} />

                  <span>
                    Open Jobs
                  </span>

                </div>

                <div
                  className={`menu-item ${isActive('/my-proposals')}`}
                  onClick={() => {
                    navigate('/my-proposals');
                    setIsOpen(false);
                  }}
                >

                  <FileText size={20} />

                  <span>
                    My Proposals
                  </span>

                </div>

                <div
                  className={`menu-item ${isActive('/technician-jobs')}`}
                  onClick={() => {
                    navigate('/technician-jobs');
                    setIsOpen(false);
                  }}
                >

                  <ClipboardList size={20} />

                  <span>
                    My Jobs
                  </span>

                </div>

                <div
                  className={`menu-item ${isActive('/messages')}`}
                  onClick={() => {
                    navigate('/messages');
                    setIsOpen(false);
                  }}
                >

                  <MessageCircle size={20} />

                  <span>
                    Messages
                  </span>

                </div>

                <div
                  className={`menu-item ${isActive('/worker-profile')}`}
                  onClick={() => {
                    navigate('/worker-profile');
                    setIsOpen(false);
                  }}
                >

                  <User size={20} />

                  <span>
                    Profile
                  </span>

                </div>

                <div
                  className={`menu-item ${isActive('/wallet')}`}
                  onClick={() => {
                    navigate('/wallet');
                    setIsOpen(false);
                  }}
                >

                  <CreditCard size={20} />

                  <span>
                    Wallet
                  </span>

                </div>

              </>
            )}

          {/* ================= ADMIN ================= */}

          {userRole ===
            'admin' && (
              <>

                <div
                  className={`menu-item ${isActive('/admin/clients')}`}
                  onClick={() => {
                    navigate('/admin/clients');
                    setIsOpen(false);
                  }}
                >

                  <Users size={20} />

                  <span>
                    Clients
                  </span>

                </div>

                <div
                  className={`menu-item ${isActive('/admin/workers')}`}
                  onClick={() => {
                    navigate('/admin/workers');
                    setIsOpen(false);
                  }}
                >

                  <Briefcase size={20} />

                  <span>
                    Workers
                  </span>

                </div>

                <div
                  className={`menu-item ${isActive('/admin/service-management')}`}
                  onClick={() => {
                    navigate('/admin/service-management');
                    setIsOpen(false);
                  }}
                >

                  <FileText size={20} />

                  <span>
                    Services
                  </span>

                </div>

                <div
                  className={`menu-item ${isActive('/admin/reviews')}`}
                  onClick={() => {
                    navigate('/admin/reviews');
                    setIsOpen(false);
                  }}
                >

                  <Star size={20} />

                  <span>
                    Reviews
                  </span>

                </div>

                <div
                  className={`menu-item ${isActive('/withdraw-admin')}`}
                  onClick={() => {
                    navigate('/withdraw-admin');
                    setIsOpen(false);
                  }}
                >

                  <CreditCard size={20} />

                  <span>
                    Withdrawal Requests
                  </span>

                </div>

              </>
            )}

        </div>

        {/* FOOTER */}

        <div className="sidebar-footer">

          <div
            className="menu-item logout"
            onClick={
              handleLogout
            }
          >

            <LogOut size={20} />

            <span>
              Log out
            </span>

          </div>

        </div>

      </div>
    </>
  );
};

export default Sidebar;