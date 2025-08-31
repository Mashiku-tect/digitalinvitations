import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';

const InvitationStatus = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Sample events data
  const events = [
    { id: 1, name: 'Birthday Party', date: '2025-09-10' },
    { id: 2, name: 'Wedding Ceremony', date: '2025-10-05' },
    { id: 3, name: 'Company Conference', date: '2025-08-20' },
  ];

  // Sample invitation status data
  const invitationStatuses = [
    { id: 1, eventId: 1, name: 'John Doe', phone: '+255123456789', sentDate: '2025-07-15', status: 'delivered', deliveryDate: '2025-07-15', channel: 'both' },
    { id: 2, eventId: 1, name: 'Jane Smith', phone: '+255987654321', sentDate: '2025-07-15', status: 'failed', deliveryDate: null, channel: 'sms' },
    { id: 3, eventId: 1, name: 'Robert Johnson', phone: '+255555123456', sentDate: '2025-07-15', status: 'delivered', deliveryDate: '2025-07-15', channel: 'whatsapp' },
    { id: 4, eventId: 1, name: 'Sarah Williams', phone: '+255777888999', sentDate: '2025-07-15', status: 'pending', deliveryDate: null, channel: 'both' },
    { id: 5, eventId: 2, name: 'Michael Brown', phone: '+255444555666', sentDate: '2025-08-01', status: 'delivered', deliveryDate: '2025-08-01', channel: 'both' },
    { id: 6, eventId: 2, name: 'Emily Davis', phone: '+255222333444', sentDate: '2025-08-01', status: 'read', deliveryDate: '2025-08-01', channel: 'whatsapp' },
    { id: 7, eventId: 3, name: 'David Wilson', phone: '+255666777888', sentDate: '2025-07-10', status: 'delivered', deliveryDate: '2025-07-10', channel: 'sms' },
  ];

  // Filter statuses based on selected event, search term, and status filter
  const filteredStatuses = invitationStatuses.filter(status => {
    const matchesEvent = selectedEvent ? status.eventId === parseInt(selectedEvent) : true;
    const matchesSearch = status.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          status.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' ? true : status.status === statusFilter;
    
    return matchesEvent && matchesSearch && matchesStatus;
  });

  // Get stats for the selected event
  const getStats = () => {
    const eventStatuses = selectedEvent 
      ? invitationStatuses.filter(status => status.eventId === parseInt(selectedEvent))
      : invitationStatuses;
    
    const total = eventStatuses.length;
    const delivered = eventStatuses.filter(s => s.status === 'delivered' || s.status === 'read').length;
    const failed = eventStatuses.filter(s => s.status === 'failed').length;
    const pending = eventStatuses.filter(s => s.status === 'pending').length;
    
    return { total, delivered, failed, pending };
  };

  const stats = getStats();

  // Handle resend invitation
  const resendInvitation = (id) => {
    // In a real app, this would call an API to resend the invitation
    alert(`Resending invitation to ${invitationStatuses.find(s => s.id === id)?.name}`);
  };

  // Handle delete status
  const deleteStatus = (id) => {
    // In a real app, this would call an API to delete the status
    if (window.confirm('Are you sure you want to delete this invitation status?')) {
      alert(`Deleting status record ${id}`);
    }
  };

  // Handle status update (simulated)
  const refreshStatuses = () => {
    alert('Refreshing statuses from messaging platforms...');
  };

  return (
    <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Invitation Status</h1>
          <p className="text-gray-600">Track the delivery status of your event invitations</p>
        </div>

        {/* Filters and Stats Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Event Selector */}
            <div>
              <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-2">
                Select Event
              </label>
              <select
                id="event"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Events</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.name} ({event.date})
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Guests
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name or phone number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="delivered">Delivered</option>
                <option value="read">Read</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={refreshStatuses}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Refresh Status
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-800">{stats.total}</div>
              <div className="text-sm text-blue-600">Total Sent</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-800">{stats.delivered}</div>
              <div className="text-sm text-green-600">Delivered</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-800">{stats.pending}</div>
              <div className="text-sm text-yellow-600">Pending</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-800">{stats.failed}</div>
              <div className="text-sm text-red-600">Failed</div>
            </div>
          </div>
        </div>

        {/* Status Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sent Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channel
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStatuses.length > 0 ? (
                  filteredStatuses.map(status => {
                    const event = events.find(e => e.id === status.eventId);
                    return (
                      <tr key={status.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-800 font-medium">
                                {status.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{status.name}</div>
                              <div className="text-sm text-gray-500">{status.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{event?.name}</div>
                          <div className="text-sm text-gray-500">{event?.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {status.sentDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            status.channel === 'sms' ? 'bg-blue-100 text-blue-800' :
                            status.channel === 'whatsapp' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {status.channel === 'sms' ? 'SMS' :
                             status.channel === 'whatsapp' ? 'WhatsApp' : 'Both'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            status.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            status.status === 'read' ? 'bg-purple-100 text-purple-800' :
                            status.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                          </span>
                          {status.deliveryDate && (
                            <div className="text-xs text-gray-500 mt-1">
                              Delivered: {status.deliveryDate}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => resendInvitation(status.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Resend
                            </button>
                            <button
                              onClick={() => deleteStatus(status.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No invitation statuses found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulk Actions */}
        {filteredStatuses.length > 0 && (
          <div className="mt-6 flex justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredStatuses.length} of {invitationStatuses.length} records
            </div>
            <div className="flex space-x-3">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                Export to CSV
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300">
                Print Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
};

export default InvitationStatus;