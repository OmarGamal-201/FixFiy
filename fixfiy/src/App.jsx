import React, { useState, useEffect } from 'react';
import "./App.css";
import Sidebar from './componants/Sidebar';
import Navbar from './componants/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import EditProfilePage from './pages/pageS/EditProfilePage';
import ProfilePage from './pages/pageS/ProfilePage';
import WorkerPage from './pages/pageS/Workerpage';
import Client from './pages/pageS/Client';
import Booking from './pages/pageA/Booking';
import Contact from './pages/pageA/Contact';
import LogIn from './pages/pageA/LogIn';
import Payments from './pages/pageA/Payments';
import RestNewPassword from './pages/pageA/ResetNewPassword';
import ForgotPassword from './pages/pageA/ForgotPassword'; // ✅ جديد
import SignInAdmin from './pages/pageA/SignInAdmin';
import SignInClient from './pages/pageA/SignInClient';
import SignInWorker from './pages/pageA/SignInWorker';
import AdminHomePage from './pages/pageN/AdminHomePage';
import ClientHomePage from './pages/pageN/ClientHomePage';
import WorkerHomePage from './pages/pageN/WorkerHomePage';
import ClientManagementPage from './pages/pageN/ClientManagementPage';
import WorkerManagement from './pages/pageN/WorkerManagement';
import ServicesManagementPage from './pages/pageN/ServicesManagementPage';
import SystemSetting from './pages/pageH/SystemSetting';
import SettingHome from './pages/pageH/SettingHome';
import WelcomePage from './pages/pageH/WelcomPage';
import ServiceWorkersPage from './pages/pageH/ServiceWorkers';
import LogInClient from './pages/pageA/LogInClient';
import LogInWorker from './pages/pageA/LogInWorker';

function AppContent() {
  const [currentUser, setCurrentUser] = useState({ role: "", name: "", email: "" });
  const location = useLocation();

  const updateUserData = (role) => {
    setCurrentUser({
      role: role,
      name: role.charAt(0).toUpperCase() + role.slice(1),
      email: `${role}@fixfiy.com`
    });
  };

  // load from localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      updateUserData(savedRole);
    }
  }, []);

  const handleLogin = (userType) => {
    localStorage.setItem('userRole', userType);
    updateUserData(userType);
  };

  // ✅ auth pages
  const authPaths = [
    '/',
    '/welcome',
    '/login',
    '/login-worker',
    '/login-client',
    '/signin-client',
    '/signin-worker',
    '/signin-admin',
    '/forgot-password'
  ];

  const isAuthPage =
    authPaths.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password");

  return (
    <div className="app-container" style={{ display: 'flex' }}>
      {!isAuthPage && currentUser.role && <Sidebar userRole={currentUser.role} />}

      <div
        className="main-wrapper"
        style={{
          flex: 1,
          marginLeft: (!isAuthPage && currentUser.role) ? '260px' : '0px',
          transition: 'margin 0.3s'
        }}
      >
        {!isAuthPage && currentUser.role && <Navbar user={currentUser} />}

        <main className="main-content">
          <Routes>

            {/* Welcome */}
            <Route path='/' element={<WelcomePage />} />
            <Route path='/welcome' element={<WelcomePage />} />

            {/* Sign up */}
            <Route path="/signin-client" element={<SignInClient onLogin={(role) => handleLogin(role)} />} />
            <Route path="/signin-worker" element={<SignInWorker onLogin={(role) => handleLogin(role)} />} />
            <Route path="/signin-admin" element={<SignInAdmin onLogin={() => handleLogin('admin')} />} />

            {/* Login */}
            <Route path="/login" element={<LogIn onLogin={() => handleLogin('admin')} />} />
            <Route path="/login-client" element={<LogInClient onLogin={() => handleLogin('client')} />} />
            <Route path="/login-worker" element={<LogInWorker onLogin={() => handleLogin('worker')} />} />

            {/* ✅ Forgot + Reset */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<RestNewPassword />} />

            {/* Home */}
            <Route
              path="/home"
              element={
                currentUser.role || localStorage.getItem("userRole") ? (
                  currentUser.role === "admin" ? <AdminHomePage /> :
                  currentUser.role === "worker" ? <WorkerHomePage /> :
                  <ClientHomePage />
                ) : <Navigate to="/welcome" />
              }
            />

            {/* Admin */}
            <Route path="/admin/workers" element={currentUser.role === 'admin' ? <WorkerManagement /> : <Navigate to="/home" />} />
            <Route path="/admin/clients" element={currentUser.role === 'admin' ? <ClientManagementPage /> : <Navigate to="/home" />} />
            <Route path="/admin/service-management" element={currentUser.role === 'admin' ? <ServicesManagementPage /> : <Navigate to="/home" />} />
            <Route path="/system-setting" element={currentUser.role === 'admin' ? <SystemSetting /> : <Navigate to="/home" />} />

            {/* Profiles */}
            <Route path='/client-profile' element={<Client />} />
            <Route path='/worker-profile' element={<WorkerPage />} />

            {/* General */}
            <Route path="/profile" element={<ProfilePage userData={currentUser} />} />
            <Route path="/edit-profile" element={<EditProfilePage userData={currentUser} />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/setting-home" element={<SettingHome />} />
            <Route path="/workers/:serviceName" element={<ServiceWorkersPage />} />
            <Route path="/worker-profile/:id" element={<WorkerPage userData={currentUser} />} />
            <Route path="/client-profile/:id" element={<Client userData={currentUser} />} />

            {/* fallback */}
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}