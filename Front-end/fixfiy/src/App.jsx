import React, { useState } from 'react';
import "./App.css"
import Sidebar from './componants/Sidebar';
import Navbar from './componants/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route,Navigate, useLocation  } from 'react-router-dom';
import EditProfilePage from './pages/pageS/EditProfilePage';
import ProfilePage from './pages/pageS/ProfilePage';
import WorkerPage from './pages/pageS/Workerpage';
import Client from './pages/pageS/Client'
import Booking from './pages/pageA/Booking'
import  Contact  from './pages/pageA/Contact';
import LogIn from './pages/pageA/LogIn'
import Payments from './pages/pageA/Payments'
import RestNewPassword from './pages/pageA/ResetNewPassword'
import SignInAdmin from './pages/pageA/SignInAdmin'
import SignInClient from './pages/pageA/SignInClient'
import SignInWorker from './pages/pageA/SignInWorker'
import AdminHomePage from './pages/pageN/AdminHomePage'
import ClientHomePage from './pages/pageN/ClientHomePage';
import WorkerHomePage from './pages/pageN/WorkerHomePage'
import ClientManagementPage from './pages/pageN/ClientManagementPage'
import WorkerManagement from './pages/pageN/WorkerManagement';
import ServicesManagementPage from './pages/pageN/ServicesManagementPage'
import SystemSetting from './pages/pageH/SystemSetting'
import SettingHome from './pages/pageH/SettingHome'
import WelcomePage from './pages/pageH/WelcomPage';
import ServiceWorkersPage from './pages/pageH/ServiceWorkers';
import LogInClient from './pages/pageA/LogInClient'
import LogInWorker from './pages/pageA/LogInWorker';
// import Client from './pages/pageS/Client'


import  './pages/pageA/Booking.css'
import  './pages/pageA/Contact.css'
import  './pages/pageA/LogIn.css'
import  './pages/pageA/Payments.css'
import  './pages/pageA/ResetNewPassword.css'
import  './pages/pageA/SignInAdmin.css'
import  './pages/pageA/SignInClient.css'
import  './pages/pageA/SignInWorker.css'
import  './pages/pageN/AdminHomePage.css'
import  './pages/pageN/ClientHomePage.css'
import  './pages/pageN/ClientManagementPage.css'
import  './pages/pageN/ServicesManagementPage.css'
import  './pages/pageN/WorkerHomePage.css'
import  './pages/pageN/WorkerManagement.css'
import  './pages/pageS/Worker.css'
import  './pages/pageS/client.css'
import   './pages/pageH/systemsetting.css'
import   './pages/pageH/settinghome.css'
import  './pages/pageH/welcomepage.css'
import './pages/pageH/serviceworkers.css'
import './pages/pageA/loginclient.css'
import './pages/pageA/loginworker.css'

function AppContent(){
  const handleLogin = (userType) => {
    
    if (userType === 'admin') setCurrentUser(adminData);
    else if (userType === 'worker') setCurrentUser(workerData);
    else if (userType === 'client') setCurrentUser(clientData);
   
  };
   const adminData = { role: "admin", name: "Admin Name", email: "admin@example.com", stats: [{ label: "Requests", value: "150" }, { label: "Workers", value: "450" }, { label: "Clients", value: "1,200" }] };
  const workerData = { role: "worker", name: "احمد محمد (عامل)", email: "worker@fixfiy.com", stats: [{ label: "Completed", value: "85" }, { label: "Rating", value: "4.9" }, { label: "Tasks", value: "12" }] };
  const clientData = { role: "client", name: "سارة محمود (عميل)", email: "sara@client.com", stats: [{ label: "Orders", value: "10" }, { label: "Points", value: "300" }, { label: "Active", value: "1" }] };
  const [currentUser, setCurrentUser] = useState({role:""});
  const location = useLocation();
  const authPaths = ['/', '/welcome', '/login', '/login-worker', '/signin-client', '/signin-worker', '/signin-admin', '/reset-password'];
  const isAuthPage = authPaths.includes(location.pathname);
  return (
  
  <div className="app-container" style={{ display: 'flex' }}>
    {!isAuthPage && (
    <Sidebar
    userRole={currentUser?.role}
      onAdminClick={() => setCurrentUser(adminData)}
      onWorkerClick={() => setCurrentUser(workerData)}
      onClientClick={() => setCurrentUser(clientData)}
    />)}
    
    <div className="main-wrapper" style={{ flex: 1, marginLeft: '260px' }}>
      {!isAuthPage &&<Navbar user={currentUser} />}
      
      <main className="main-content" style={{ padding: '20px' }}>
        
        <Routes>
          <Route path='/' element={<WelcomePage/>} />
          <Route path="/home" element={
            currentUser ?(
          currentUser.role === "admin" ? <AdminHomePage /> : 
          currentUser.role === "worker" ? <WorkerHomePage /> : 
          <ClientHomePage />
  ):<Navigate to="/login" />
} />
          
          <Route path="/admin/worker-management" element={<WorkerManagement />}/>
          <Route path="/admin/client-management" element={<ClientManagementPage />}/>
          <Route path="/admin/service-management" element={<ServicesManagementPage />}/>
          <Route path="/profile" element={<ProfilePage userData={currentUser} />} />
          <Route path="/edit-profile" element={<EditProfilePage userData={currentUser} />} />
          <Route path="/worker-profile/:id" element={<WorkerPage userData={currentUser} />} />{/* */}
          <Route path="/client-profile/:id" element={<Client userData={currentUser} />} />{/* */}

          <Route path="/booking" element={<Booking />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/reset-password" element={<RestNewPassword />} />
          <Route path="/signin-admin" element={<SignInAdmin />} />
          <Route path="/signin-client" element={<SignInClient />} />
          <Route path="/signin-worker" element={<SignInWorker />} />
          {/* <Route path='login-client'element={<LogInClient onLogin={() => handleLogin('client')}/>} />
          <Route path="/login-worker" element={<LogInWorker onLogin={() => handleLogin('worker')} />} /> */}
             <Route path='login-client'element={<LogInClient onLogin={() => setCurrentUser(clientData)}/>} />
          <Route path="/login-worker" element={<LogInWorker onLogin={() =>setCurrentUser(workerData)} />} />

          {/* <Route path="/admin-home" element={<AdminHomePage/>}/>
          <Route path="/client-home" element={<ClientHomePage/>}/> */}
          <Route path="/client-management" element={<ClientManagementPage/>}/>
          <Route path="/services-management" element={<ServicesManagementPage/>}/>
          {/* <Route path="/worker-home" element={<WorkerHomePage/>}/> */}
          <Route path="/worker-management" element={<WorkerManagement/>}/>
          <Route path="/admin/clients" element={<ClientManagementPage/>}/>
          <Route path="/admin/workers" element={<WorkerManagement/>}/>

          <Route path="/system-setting" element={<SystemSetting/>}/>
          <Route path='/setting-home' element={<SettingHome/>}/>
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/workers/:serviceName" element={<ServiceWorkersPage />} />

        </Routes>
      </main>
    </div>
  </div>

  );
}
function App() {
 return(
  <Router>
    <AppContent></AppContent>
  </Router>
 )
}

export default App;