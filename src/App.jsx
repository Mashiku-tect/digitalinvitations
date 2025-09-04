import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './components/pages/Home';
import AllEvents from './components/pages/AllEvents';
import CreateEvent from './components/pages/CreateEvent';
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
import ForgotPassword from './components/auth/ForgotPassword';
import ProtectedRoute from './components/auth/ProtectedRoutes';
import Logout from './components/pages/Logout';
import EventDetails from './components/pages/EventDetails';
import EditEvent from './components/pages/EventEdit';

import './App.css';


function App() {
  

  const handleRegister = () => {
    console.log('User registered!');
    // Redirect logic will be added later with navigation
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login  />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register onRegister={handleRegister} />} />
          <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute><AllEvents /></ProtectedRoute>} />
          <Route path="/events/create" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
          <Route path="/invitations/generate" element={<ProtectedRoute><InvitationCardGenerator /></ProtectedRoute>} />
          <Route path="/invitations/send" element={<ProtectedRoute><SendInvitations /></ProtectedRoute>} />
          <Route path="/invitations/status" element={<ProtectedRoute><InvitationStatus /></ProtectedRoute>} />
          <Route path="/templates" element={<ProtectedRoute><CardTemplates /></ProtectedRoute>} />
          <Route path="/templates/create" element={<ProtectedRoute><CreateTemplate /></ProtectedRoute>} />
          <Route path="/qr/logs" element={<ProtectedRoute><CheckInLogs /> </ProtectedRoute>} />
          <Route path="/reports/events" element={<ProtectedRoute><EventReports /> </ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/users/add" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
          <Route path="users/roles" element={<ProtectedRoute><RolesAndPermissions /></ProtectedRoute>} />
          <Route path="/logout" element={<ProtectedRoute><Logout /></ProtectedRoute>} />
          <Route path="/viewevents/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
          <Route path="/editevents/:id/edit" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
        


          <Route path="/" element={<Login  />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;