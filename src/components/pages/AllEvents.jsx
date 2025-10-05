import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from '../layout/Layout';

const EventManager = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    completeEvents: 0,
    cancelledEvents: 0,
    events: []
  });

  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/getallevents", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { totalEvents, activeEvents, completeEvents, events,cancelledEvents } = res.data;

        setStats({
          totalEvents,
          activeEvents,
          completeEvents,
          cancelledEvents,
          events
        });
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, []);

  const deleteEvent = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5000/api/events/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(prev => ({
          ...prev,
          events: prev.events.filter(event => event.id !== id)
        }));
      } catch (err) {
        console.error("Error deleting event:", err);
      }
    }
  };

  const filteredEvents = (stats.events || []).filter(event => {
    // Filter by status
    const isActive = Boolean(event.active);
    let statusMatch = true;
    if (filter === 'upcoming') statusMatch = isActive;
    if (filter === 'past') statusMatch = !isActive;
    if (filter === 'cancelled') statusMatch = !isActive;
    
    // Filter by search term
    const nameMatch = event.eventName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && nameMatch;
  });

  const handleViewEvent = (eventId) => navigate(`/viewevents/${eventId}`);
  const handleEditEvent = (eventId) => navigate(`/editevents/${eventId}/edit`);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-2 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Event Manager</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage all your events in one place. Create, edit, and track your events with ease.
            </p>
          </header>

          {/* Stats and Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex space-x-4 mb-4 md:mb-0">
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-medium">
                  Total Events: {stats.totalEvents || 0}
                </div>
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                  Upcoming: {stats.activeEvents || 0}
                </div>
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-medium">
                  Past: {stats.completeEvents || 0}
                </div>
                 <div className="bg-red-100 text-red-700 px-4 py-2 rounded-full font-medium">
                  Cancelled: {stats.cancelledEvents || 0}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <select 
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Events</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                
                </select>
                
                <input
                  type="text"
                  placeholder="Search events..."
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <Link
                  to="/events/create"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 items-center inline-flex"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create New Event
                </Link>
              </div>
            </div>
          </div>

          {/* Search Results Info */}
          {searchTerm && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} matching "{searchTerm}"
                <button 
                  onClick={() => setSearchTerm('')}
                  className="ml-3 text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  Clear search
                </button>
              </p>
            </div>
          )}

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{event.eventName}</h2>
                   <span
  className={`px-3 py-1 rounded-full text-xs font-semibold ${
    event.cancelled
      ? 'bg-red-100 text-red-700'
      : event.active
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800'
  }`}
>
  {event.cancelled ? 'Cancelled' : event.active ? 'Upcoming' : 'Past'}
</span>

                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      {new Date(event.eventDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {event.location}
                    </div>

                    <div className="flex items-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      {event.totalGuests || 0} guests
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                    <button 
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                      onClick={() => handleViewEvent(event.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      View
                    </button>
                    
                    <div className="flex space-x-4">
                      <button 
                        className="text-yellow-600 hover:text-yellow-800"
                        onClick={() => handleEditEvent(event.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      
                      <button 
                        className="text-red-600 hover:text-red-800"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                {searchTerm ? 'No events found matching your search' : 'No events found'}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try a different search term or ' : 'Try changing your filters or '}
                create a new event.
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EventManager;