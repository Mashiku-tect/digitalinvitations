import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from '../layout/Layout';
import { usePermissions } from '../../context/PermissionContext';
import { hasPermission } from '../../utils/Permission';

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
  const [loading,setLoading]=useState(false);

  const [hasAccess, setHasAccess] = useState(null); // <-- NEW

  //dealing with permissions
   const { permissions } = usePermissions();
   const canDeleteEvent = hasPermission(permissions, 'event_delete');
    const canEditEvent = hasPermission(permissions, 'event_edit');
    const canViewEvent = hasPermission(permissions, 'event_view');
    const canAddEvent = hasPermission(permissions, 'event_add');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/getallevents", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { totalEvents, activeEvents, completeEvents, events,cancelledEvents } = res.data;
        //console.log("event Details",events)

        setStats({
          totalEvents,
          activeEvents,
          completeEvents,
          cancelledEvents,
          events
        });
        setHasAccess(true);
      } catch (err) {
        if(err.response && err.response.status === 403){
          //handle unauthorized access, maybe redirect to login
          //navigate('/403');
          setHasAccess(false);
        }
       // console.error("Error fetching events:", err);
      }finally{
        setLoading(false);
      }
    };
    fetchEvents();
  }, [navigate]);


   // 🔒 Handle redirect cleanly before rendering page content
  useEffect(() => {
    if (hasAccess === false) {
      navigate("/403", { replace: true });
    }
  }, [hasAccess, navigate]);

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
  const handleEditEvent = (eventId,cancelledstatus,completedstatus) => {
    if(cancelledstatus){
      alert("Cancelled events can not be edited");
      return;
    }
    else if(completedstatus){
       alert("Completed events can not be edited");
      return;
    }
    navigate(`/editevents/${eventId}/edit`);

  }

   if (loading || hasAccess === null) {
       return (
        <Layout>
          <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Events....</p>
            </div>
          </div>
        </Layout>
      );
    }

     if (!hasAccess) {
    return null; // Nothing renders before navigation
  }

  return (
    <Layout>
      <div className="min-h-screen  p-2 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-2 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Event Manager</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage all your events in one place. Create, edit, and track your events with ease.
            </p>
          </header>

          {/* Stats and Actions */}
   <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
  <div className="flex flex-row items-center justify-between gap-4">
    {/* Stats Section */}
    <div className="flex items-center gap-2 md:gap-3 flex-1">
      <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
        <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7-1.274 5.057-5.542 7-8.268-2.943-9.542-7zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
        </svg>
        <span className="text-sm font-semibold">{stats.totalEvents || 0} Total</span>
      </div>
      <div className="flex items-center bg-green-50 text-green-700 px-3 py-2 rounded-lg">
        <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
        </svg>
        <span className="text-sm font-semibold">{stats.activeEvents || 0} Upcoming</span>
      </div>
      <div className="flex items-center bg-gray-50 text-gray-700 px-3 py-2 rounded-lg">
        <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
        </svg>
        <span className="text-sm font-semibold">{stats.completeEvents || 0} Past</span>
      </div>
      <div className="flex items-center bg-red-50 text-red-700 px-3 py-2 rounded-lg">
        <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
        </svg>
        <span className="text-sm font-semibold">{stats.cancelledEvents || 0} Cancelled</span>
      </div>
    </div>

    {/* Controls Section */}
    <div className="flex items-center gap-2 flex-shrink-0">
      <select 
        className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
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
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 md:w-40"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      {canAddEvent && (
        <Link
          to="/events/create"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center text-sm whitespace-nowrap"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Event
        </Link>
      )}
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
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {filteredEvents.map((event) => (
    <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
      <div className="p-4">
        {/* Header with event name and status */}
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-lg font-semibold text-gray-800 truncate pr-2">{event.eventName}</h2>
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
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
        
        {/* Event details - more compact */}
        <div className="space-y-2">
          <div className="flex items-center text-gray-600 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="truncate">
              {new Date(event.eventDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>

          <div className="flex items-center text-gray-600 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            {event.totalGuests || 0} guests
          </div>
        </div>
        
        {/* Actions - more compact */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
          {canViewEvent && (
            <button 
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center text-sm"
              onClick={() => handleViewEvent(event.id)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              View
            </button>
          )}
          
          <div className="flex space-x-3">
            {canEditEvent && (
              <button 
                className="text-yellow-600 hover:text-yellow-800 p-1 rounded hover:bg-yellow-50"
                onClick={() => handleEditEvent(event.id, event.cancelled, event.completed)}
                title="Edit Event"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
            
            {canDeleteEvent && (
              <button 
                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                onClick={() => deleteEvent(event.id)}
                title="Delete Event"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
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