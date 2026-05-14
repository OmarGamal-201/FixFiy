import React, {
  useState,
  useEffect,
} from "react";

import "./App.css";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

/* ================= COMPONENTS ================= */

import Sidebar from "./componants/Sidebar";
import Navbar from "./componants/Navbar";

/* ================= AUTH ================= */

import Login from "./pages/pageA/Login";
import ForgotPassword from "./pages/pageA/ForgotPassword";
import RestNewPassword from "./pages/pageA/ResetNewPassword";

import SignInAdmin from "./pages/pageA/SignInAdmin";
import SignInClient from "./pages/pageA/SignInClient";
import SignInWorker from "./pages/pageA/SignInWorker";

/* ================= HOME ================= */

import WelcomePage from "./pages/pageH/WelcomPage";

import AdminHomePage from "./pages/pageN/AdminHomePage";
import ClientHomePage from "./pages/pageN/ClientHomePage";
import WorkerHomePage from "./pages/pageN/WorkerHomePage";

/* ================= ADMIN ================= */

import ClientManagementPage from "./pages/pageN/ClientManagementPage";
import WorkerManagement from "./pages/pageN/WorkerManagement";
import ServicesManagementPage from "./pages/pageN/ServicesManagementPage";

/* ================= PROFILE ================= */

import MyWorkerProfile from "./pages/pageN/MyWorkerProfile";
import MyClientProfile from "./pages/pageN/MyClientProfile";
import ClientProfile from "./pages/pageN/ClientProfile";
import WorkerProfile from "./pages/pageN/WorkerProfile";
import WorkerPage from "./pages/pageS/Workerpage";
import Client from "./pages/pageS/Client";

import EditProfilePage from "./pages/pageS/EditProfilePage";

/* ================= JOBS ================= */

import Booking from "./pages/pageA/Booking";
import MyBookings from "./pages/pageA/MyBookings";

import OpenJobs from "./pages/pageA/OpenJobs";
import MyProposals from "./pages/pageA/MyProposals";
import JobProposals from "./pages/pageA/JobProposals";
import TechnicianJobs from "./pages/pageA/TechnicianJobs";

/* ================= PAYMENTS ================= */

import Payments from "./pages/pageA/Payments";
import PaymentCallback from "./pages/pageA/PaymentCallback";

import Waallet from "./pages/pageA/WorkerWallet";
import AdminWithdraws
from "./pages/pageA/AdminWithdraws";


/* ================= CHAT ================= */

import Chat from "./pages/pageA/Chat";
import MessagesPage from "./pages/messages/MessagesPage";

/* ================= SERVICES ================= */

import ServiceWorkersPage from "./pages/pageH/ServiceWorkers";

/* ================= REVIEWS ================= */

import CreateReview from "./pages/CreateReview/CreateReview";

function AppContent() {

  const [role, setRole] =
    useState(
      localStorage.getItem(
        "userRole"
      )
    );

  const [
    currentUser,
    setCurrentUser,
  ] = useState({
    role: "",
    name: "",
    email: "",
  });

  const location =
    useLocation();

  /* ================= USER ================= */

  useEffect(() => {

    if (role) {

      setCurrentUser({
        role,
        name:
          role
            .charAt(0)
            .toUpperCase() +
          role.slice(1),

        email:
          `${role}@fixfiy.com`,
      });
    }

  }, [role]);

  /* ================= LOGIN ================= */

  const handleLogin =
    (userType) => {

      localStorage.setItem(
        "userRole",
        userType
      );

      setRole(userType);
    };

  /* ================= AUTH PAGES ================= */

  const authPaths = [
    "/",
    "/welcome",
    "/login",
    "/signin-client",
    "/signin-worker",
    "/signin-admin",
    "/forgot-password",
  ];

  const isAuthPage =
    authPaths.includes(
      location.pathname
    ) ||
    location.pathname.startsWith(
      "/reset-password"
    );

  return (

    <div
      className="app-container"
      style={{
        display: "flex",
      }}
    >

      {/* ================= SIDEBAR ================= */}

      {!isAuthPage &&
        role && (

          <Sidebar
            userRole={role}
          />
        )}

      <div
        className="main-wrapper"
        style={{
          flex: 1,

          marginLeft:
            !isAuthPage &&
            role
              ? "260px"
              : "0px",

          transition:
            "margin .3s",
        }}
      >

        {/* ================= NAVBAR ================= */}

        {!isAuthPage &&
          role && (

            <Navbar
              user={
                currentUser
              }
            />
          )}

        <main className="main-content">

          <Routes>

            {/* ================= WELCOME ================= */}

            <Route
              path="/"
              element={
                <WelcomePage />
              }
            />

            <Route
              path="/welcome"
              element={
                <WelcomePage />
              }
            />

            {/* ================= AUTH ================= */}

            <Route
              path="/login"
              element={
                <Login
                  onLogin={
                    handleLogin
                  }
                />
              }
            />

            <Route
              path="/signin-client"
              element={
                <SignInClient
                  onLogin={
                    handleLogin
                  }
                />
              }
            />

            <Route
              path="/signin-worker"
              element={
                <SignInWorker
                  onLogin={
                    handleLogin
                  }
                />
              }
            />

            <Route
              path="/signin-admin"
              element={
                <SignInAdmin
                  onLogin={() =>
                    handleLogin(
                      "admin"
                    )
                  }
                />
              }
            />

            <Route
              path="/forgot-password"
              element={
                <ForgotPassword />
              }
            />

            <Route
              path="/reset-password/:token"
              element={
                <RestNewPassword />
              }
            />

            {/* ================= HOME ================= */}

            <Route
              path="/home"
              element={
                role === "admin" ? (
                  <AdminHomePage />
                ) : role ===
                  "technician" ? (
                  <WorkerHomePage />
                ) : role ===
                  "client" ? (
                  <ClientHomePage />
                ) : (
                  <Navigate to="/welcome" />
                )
              }
            />

            {/* ================= ADMIN ================= */}

            <Route
              path="/admin/workers"
              element={
                role ===
                "admin" ? (
                  <WorkerManagement />
                ) : (
                  <Navigate to="/home" />
                )
              }
            />

            <Route
              path="/admin/clients"
              element={
                role ===
                "admin" ? (
                  <ClientManagementPage />
                ) : (
                  <Navigate to="/home" />
                )
              }
            />

            <Route
              path="/admin/service-management"
              element={
                role ===
                "admin" ? (
                  <ServicesManagementPage />
                ) : (
                  <Navigate to="/home" />
                )
              }
            />

            {/* ================= CLIENT PROFILE ================= */}

            <Route
              path="/client-profile"
              element={
                <MyClientProfile />
              }
            />

            {/* PUBLIC CLIENT PROFILE */}

<Route
  path="/client/:id"
  element={<ClientProfile />}
/>

            {/* ================= WORKER PROFILE ================= */}

            <Route
              path="/worker-profile"
              element={
                <MyWorkerProfile />
              }
            />

            {/* PUBLIC WORKER PROFILE */}

            <Route
              path="/worker/:id"
              element={
                <WorkerProfile />
              }
            />

            <Route
              path="/worker-profile/:id"
              element={
                <WorkerPage
                  userData={
                    currentUser
                  }
                />
              }
            />

            {/* ================= BOOKINGS ================= */}

            <Route
              path="/booking"
              element={
                <Booking />
              }
            />

            <Route
              path="/my-bookings"
              element={
                <MyBookings />
              }
            />

            <Route
              path="/open-jobs"
              element={
                role ===
                "technician" ? (
                  <OpenJobs />
                ) : (
                  <Navigate to="/home" />
                )
              }
            />

            <Route
              path="/my-proposals"
              element={
                role ===
                "technician" ? (
                  <MyProposals />
                ) : (
                  <Navigate to="/home" />
                )
              }
            />

            <Route
              path="/jobs/:id/proposals"
              element={
                role ===
                "client" ? (
                  <JobProposals />
                ) : (
                  <Navigate to="/home" />
                )
              }
            />

            <Route
              path="/technician-jobs"
              element={
                <TechnicianJobs />
              }
            />

            {/* ================= PAYMENTS ================= */}

            <Route
              path="/payments"
              element={
                <Payments />
              }
            />

            <Route
              path="/payment-callback"
              element={
                <PaymentCallback />
              }
            />

            <Route
              path="/wallet"
              element={
                <Waallet />
              }
            />

            <Route
              path="/withdraw-admin"
              element={
                <AdminWithdraws />
              }
            />

          
            {/* ================= CHAT ================= */}

            <Route
              path="/chat"
              element={<Chat />}
            />

            <Route
              path="/chat/:conversationId"
              element={<Chat />}
            />

            <Route
              path="/messages"
              element={
                <MessagesPage />
              }
            />

            {/* ================= SERVICES ================= */}

            <Route
              path="/workers/:serviceId"
              element={
                <ServiceWorkersPage />
              }
            />

            {/* ================= REVIEWS ================= */}

            <Route
              path="/review/:jobId"
              element={
                <CreateReview />
              }
            />

            {/* ================= EDIT PROFILE ================= */}

            <Route
              path="/edit-profile"
              element={
                <EditProfilePage
                  userData={
                    currentUser
                  }
                />
              }
            />

            {/* ================= FALLBACK ================= */}

            <Route
              path="*"
              element={
                <Navigate to="/" />
              }
            />

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