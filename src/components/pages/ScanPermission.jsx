import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import axios from 'axios';

const ScanPermissions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanners, setScanners] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch event details
        const eventResponse = await axios.get(`http://localhost:5000/api/events/eventdetails/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvent(eventResponse.data.event);
       // console.log('Event data:', eventResponse.data.event);

        // Fetch current scanners and all users
        await fetchScanPermissions();
        await fetchAllUsers();
        
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const fetchScanPermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/events/${id}/scan-permissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setScanners(response.data.scanners || []);
    } catch (error) {
      console.error('Error fetching scan permissions:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllUsers(response.data || []);
     // console.log('All users fetched:', response.data);
      setFilteredUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(allUsers);
    } else {
      const filtered = allUsers.filter(user =>
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, allUsers]);

  // Check if user is already a scanner
  const isUserScanner = (userId) => {
    return scanners.some(scanner => scanner.tenant_id === userId);
  };

  const addScanner = async (userId) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
     const response= await axios.post(`http://localhost:5000/api/events/${id}/scan-permissions`, 
        { tenant_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if(response.data.success){
        alert(response.data.message);
        
      }
   
      await fetchScanPermissions();
    } catch (error) {
       // If status is outside 2xx range, axios throws and you land here
  if (error.response && error.response.data) {
    const { success, message } = error.response.data;
    //console.error('Error:', message);

    // Display message depending on `success`
    if (success === false) {
      // Show the error message in your UI
      alert(message); // Replace with your UI handler
    }
  } else {
    //console.error('Unexpected error:', error.message);
    // Show generic error
    alert('An unexpected error occurred.');
  }
    } finally {
      setUpdating(false);
    }
  };

  const removeScanner = async (permissionId) => {
    if (window.confirm('Are you sure you want to remove this user\'s scan permission?')) {
      try {
        setUpdating(true);
        const token = localStorage.getItem('token');
        const response=await axios.delete(`http://localhost:5000/api/events/${id}/scan-permissions/${permissionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
         if(response.data.success){
        alert(response.data.message);
        
      }
        
        await fetchScanPermissions();
      } catch (error) {
        console.error('Error removing scanner:', error);
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message);
        }
        //alert('Failed to remove scan permission');
        else {
          alert('An unexpected error occurred.');
        }
      } finally {
        setUpdating(false);
      }
    }
  };

  const getScannerPermissionId = (userId) => {
    const scanner = scanners.find(scanner => scanner.tenant_id === userId);
    return scanner ? scanner.id : null;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
            <Link to="/events" className="text-blue-600 hover:text-blue-800">
              Back to Events
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              
              <Link 
                to="/events" 
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                All Events
              </Link>
              <Link 
                to={`/viewevents/${id}`} 
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Event
              </Link>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 text-center">
              Manage Scan Permissions
            </h1>
            <div className="w-32"></div> {/* Spacer for balance */}
          </div>

          {/* Event Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{event.eventName}</h2>
                <p className="text-gray-600">
                  {new Date(event.eventDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} at {event.eventTime}
                </p>
                <p className="text-gray-600">{event.location}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${event.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {event.active ? 'Upcoming' : 'Completed'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Scanners Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Current Scanners</h3>
              <p className="text-gray-600 mb-4">
                Users who have permission to scan tickets for this event
              </p>
              
              {scanners.length > 0 ? (
                <div className="space-y-3">
                  {scanners.map((scanner) => (
                    <div key={scanner.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {scanner.tenant?.firstName?.charAt(0)}{scanner.tenant?.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {scanner.tenant?.firstName} {scanner.tenant?.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{scanner.tenant?.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeScanner(scanner.id)}
                        disabled={updating}
                        className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg text-sm font-medium transition duration-300 disabled:opacity-50 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <p className="text-gray-500">No scanners assigned yet.</p>
                  <p className="text-gray-400 text-sm mt-1">Add users from the list on the right</p>
                </div>
              )}
            </div>

            {/* Add Scanners Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Add Scanners</h3>
              <p className="text-gray-600 mb-4">
                Search and add users who can scan tickets for this event
              </p>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Users List */}
              {loadingUsers ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredUsers.map((user) => {
                    const isScanner = isUserScanner(user.id);
                    const permissionId = getScannerPermissionId(user.id);
                    
                    return (
                      <div key={user.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                          </div>
                        </div>
                        
                        {isScanner ? (
                          <button
                            onClick={() => removeScanner(permissionId)}
                            disabled={updating}
                            className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg text-sm font-medium transition duration-300 disabled:opacity-50 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={() => addScanner(user.id)}
                            disabled={updating}
                            className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-lg text-sm font-medium transition duration-300 disabled:opacity-50 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                            </svg>
                            Add Scanner
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500">No users found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {searchTerm ? 'Try a different search term' : 'No users available to add'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ScanPermissions;