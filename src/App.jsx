import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { isTokenValid } from './utils/checktoken';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ProtectedRoute from './components/auth/ProtectedRoutes';

import Home from './components/pages/Home';
import AllEvents from './components/pages/AllEvents';
import CreateEvent from './components/pages/CreateEvent';
import EventDetails from './components/pages/EventDetails';
import EditEvent from './components/pages/EventEdit';
import InvitationCardGenerator from './components/pages/InvitationCardGenerator';
import SendInvitations from './components/pages/SendInvitations';
import InvitationStatus from './components/pages/InvitationStatus';
import CardTemplates from './components/pages/CardTemplate';
import CreateTemplate from './components/pages/CreateTemplate';
import CheckInLogs from './components/pages/CheckInLogs';
import EventReports from './components/pages/EventReports';
import UserManagement from './components/pages/UserManagement';
import AddUser from './components/pages/AddUser';
import RolesAndPermissions from './components/pages/RolesAndPermissions';
import Logout from './components/pages/Logout';
import EditUsers from './components/pages/EditUsers';
import ScanPermissions from './components/pages/ScanPermission';
import NoPermissionsPage from './components/pages/NoPermissions';
import Layout from './components/layout/Layout';
import NotFound from './components/pages/NotFound';
import Forbidden from './components/pages/Forbidden';
import Unauthorized from './components/pages/Unauthorized';

import './App.css';

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const handleRegister = () => {
    console.log('User registered!');
  };

 useEffect(() => {
  const publicPaths = ['/login', '/register', '/forgot-password'];
  const currentPath = window.location.pathname;

  if (!publicPaths.includes(currentPath)) {
    const valid = isTokenValid();
    if (!valid) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }

  setIsLoading(false);
}, [navigate]);


  if (isLoading) {
     return (
          <Layout>
            <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
              </div>
            </div>
          </Layout>
        );
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register onRegister={handleRegister} />} />

        <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><AllEvents /></ProtectedRoute>} />
        <Route path="/events/create" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
        <Route path="/viewevents/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
        <Route path="/editevents/:id/edit" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />

        <Route path="/invitations/generate" element={<ProtectedRoute><InvitationCardGenerator /></ProtectedRoute>} />
        <Route path="/invitations/send" element={<ProtectedRoute><SendInvitations /></ProtectedRoute>} />
        <Route path="/invitations/status" element={<ProtectedRoute><InvitationStatus /></ProtectedRoute>} />

        <Route path="/templates" element={<ProtectedRoute><CardTemplates /></ProtectedRoute>} />
        <Route path="/templates/create" element={<ProtectedRoute><CreateTemplate /></ProtectedRoute>} />

        <Route path="/qr/logs" element={<ProtectedRoute><CheckInLogs /></ProtectedRoute>} />
        <Route path="/events/reports/:id" element={<ProtectedRoute><EventReports /></ProtectedRoute>} />

        <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        <Route path="/users/add" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
        <Route path="/users/permissions/:userId" element={<ProtectedRoute><RolesAndPermissions /></ProtectedRoute>} />
        <Route path="/users/edit/:id" element={<ProtectedRoute><EditUsers /></ProtectedRoute>} />

         <Route path="/events/:id/scan-permissions" element={<ProtectedRoute><ScanPermissions /></ProtectedRoute>} />
        <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
        <Route path="/xx" element={<ProtectedRoute><NoPermissionsPage /></ProtectedRoute>} />

        <Route path="*" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
        <Route path="/403" element={<ProtectedRoute><Forbidden /></ProtectedRoute>} />
        <Route path="/401" element={<ProtectedRoute><Unauthorized /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default AppWrapper;
