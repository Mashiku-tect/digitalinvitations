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


  if (isLoading) return <div>Loading...</div>;

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
        <Route path="/reports/events" element={<ProtectedRoute><EventReports /></ProtectedRoute>} />

        <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        <Route path="/users/add" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
        <Route path="/users/roles" element={<ProtectedRoute><RolesAndPermissions /></ProtectedRoute>} />

        <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default AppWrapper;
