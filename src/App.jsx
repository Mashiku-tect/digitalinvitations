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
          <Route path="/register" element={<Register onRegister={handleRegister} />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/events" element={<AllEvents />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/invitations/generate" element={<InvitationCardGenerator />} />
          <Route path="/invitations/send" element={<SendInvitations />} />
          <Route path="/invitations/status" element={<InvitationStatus />} />
          <Route path="/templates" element={<CardTemplates />} />
          <Route path="/templates/create" element={<CreateTemplate />} />
          <Route path="/qr/logs" element={<CheckInLogs />} />
          <Route path="/reports/events" element={<EventReports />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/users/add" element={<AddUser />} />
          <Route path="users/roles" element={<RolesAndPermissions />} />
        


          <Route path="/" element={<Login  />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;