import React, { useState, useEffect } from 'react';
import "./App.css";
import Sidebar from './componants/Sidebar';
import Navbar from './componants/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import EditProfilePage from './pages/pageS/EditProfilePage';
// import ProfilePage from './pages/pageS/ProfilePage';
import WorkerPage from './pages/pageS/Workerpage';
import Client from './pages/pageS/Client';
import Booking from './pages/pageA/Booking';
import Contact from './pages/pageA/Contact';
import Login from "./pages/pageA/Login";
import Payments from './pages/pageA/Payments';
import Waallet from "./pages/pageA/Waallet";
import WithdrawAdmin from './pages/pageA/WithdrawAdmin';
import Withdrawworker from './pages/pageA/withdrawworker';
import RestNewPassword from './pages/pageA/ResetNewPassword';
import ForgotPassword from './pages/pageA/ForgotPassword';
import SignInAdmin from './pages/pageA/SignInAdmin';
import SignInClient from './pages/pageA/SignInClient';
import SignInWorker from './pages/pageA/SignInWorker';
import AdminHomePage from './pages/pageN/AdminHomePage';
import ClientHomePage from './pages/pageN/ClientHomePage';
import WorkerHomePage from './pages/pageN/WorkerHomePage';
import ClientManagementPage from './pages/pageN/ClientManagementPage';
import WorkerManagement from './pages/pageN/WorkerManagement';
import ServicesManagementPage from './pages/pageN/ServicesManagementPage';
// import SystemSetting from './pages/pageH/SystemSetting';
// import SettingHome from './pages/pageH/SettingHome';
import WelcomePage from './pages/pageH/WelcomPage';
import ServiceWorkersPage from './pages/pageH/ServiceWorkers';
import MyBookings from './pages/pageA/MyBookings';

function AppContent() {

  //  نخلي role في state (مش localStorage بس)
  const [role, setRole] = useState(localStorage.getItem("userRole"));

  const [currentUser, setCurrentUser] = useState({
    role: "",
    name: "",
    email: ""
  });

  const location = useLocation();

  const updateUserData = (role) => {
    setCurrentUser({
      role: role,
      name: role.charAt(0).toUpperCase() + role.slice(1),
      email: `${role}@fixfiy.com`
    });
  };

  //  لما role يتغير → يحدث البيانات
  useEffect(() => {
    if (role) {
      updateUserData(role);
    }
  }, [role]);

  //  عند login
  const handleLogin = (userType) => {
    localStorage.setItem('userRole', userType);
    setRole(userType); 
  };

  // صفحات بدون Navbar / Sidebar
  const authPaths = [
    '/',
    '/welcome',
    '/login',
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
      
      {/* Sidebar */}
      {!isAuthPage && role && (
        <Sidebar userRole={role} />
      )}

      <div
        className="main-wrapper"
        style={{
          flex: 1,
          marginLeft: (!isAuthPage && role) ? '260px' : '0px',
          transition: 'margin 0.3s'
        }}
      >
        
        {/* Navbar */}
        {!isAuthPage && role && (
          <Navbar user={currentUser} />
        )}

        <main className="main-content">
          <Routes>

            {/* Welcome */}
            <Route path='/' element={<WelcomePage />} />
            <Route path='/welcome' element={<WelcomePage />} />

            {/* Sign up */}
            <Route path="/signin-client" element={<SignInClient onLogin={handleLogin} />} />
            <Route path="/signin-worker" element={<SignInWorker onLogin={handleLogin} />} />
            <Route path="/signin-admin" element={<SignInAdmin onLogin={() => handleLogin('admin')} />} />

            {/* Login */}
            <Route path="/login" element={<Login onLogin={handleLogin} />} />

            {/* Forgot + Reset */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<RestNewPassword />} />

            {/*  Home FIXED */}
            <Route
              path="/home"
              element={
                role === "admin" ? <AdminHomePage /> :
                role === "technician" ? <WorkerHomePage /> :
                role === "client" ? <ClientHomePage /> :
                <Navigate to="/welcome" />
              }
            />

            {/* Admin */}
            <Route path="/admin/workers" element={role === 'admin' ? <WorkerManagement /> : <Navigate to="/home" />} />
            <Route path="/admin/clients" element={role === 'admin' ? <ClientManagementPage /> : <Navigate to="/home" />} />
            <Route path="/admin/service-management" element={role === 'admin' ? <ServicesManagementPage /> : <Navigate to="/home" />} />
            {/* <Route path="/system-setting" element={role === 'admin' ? <SystemSetting /> : <Navigate to="/home" />} /> */}

            {/* Profiles */}
            <Route path='/client-profile' element={<Client />} />
            <Route path='/worker-profile' element={<WorkerPage />} />

            {/* General */}
            {/* <Route path="/profile" element={<ProfilePage userData={currentUser} />} /> */}
            <Route path="/edit-profile" element={<EditProfilePage userData={currentUser} />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/wallet" element={<Waallet />} />
            <Route path="/withdraw-admin" element={<WithdrawAdmin />} />
            <Route path="/withdraw-worker" element={<Withdrawworker />} />
            <Route path="/contact" element={<Contact />} />
            {/* <Route path="/setting-home" element={<SettingHome />} /> */}
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