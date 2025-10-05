import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import axios from 'axios';

const CheckInLogs = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
      totalEvents: 0,
      activeEvents: 0,
      completeEvents: 0,
      events: []
    });

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
       const res = await axios.get("http://localhost:5000/api/getallevents", {
    headers: {
      Authorization: `Bearer ${token}`, // 👈 send token here
    },
  }); 
   const { totalEvents, activeEvents, completeEvents, events } = res.data;
        console.log(res.data);

        setStats({
          totalEvents,
          activeEvents,
          completeEvents,
          events
        });
        setEvents(events);
        //console.log(res.data);
        setFilteredEvents(events);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      }
    };
    fetchEvents();
  }, []);

  // Filter events based on search term
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(event =>
        event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [searchTerm, events]);

  const handleEventSelect = async (event) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/events/checkins/${event.id}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // 👈 send token here
        },
      }); // 👈 fetch check-ins
      setSelectedEvent({ ...event, checkIns: res.data });
    } catch (error) {
      console.error('Failed to fetch check-ins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEvents = () => {
    setSelectedEvent(null);
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timestamp) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(timestamp).toLocaleTimeString(undefined, options);
  };

  if (selectedEvent) {
    return (
      <EventCheckInDetail 
        event={selectedEvent} 
        onBack={handleBackToEvents}
        formatDate={formatDate}
        formatTime={formatTime}
        isLoading={isLoading}
      />
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Event Check-in Logs</h1>
            <p className="mt-3 text-xl text-gray-500">Select an event to view check-in details</p>
          </header>
          
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search events by title or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onSelect={handleEventSelect}
                  formatDate={formatDate}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No events found</h3>
                <p className="mt-1 text-gray-500">No events match your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};




const EventCard = ({ event, onSelect, formatDate }) => {
  return (
    <div 
      className="flex flex-col rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 bg-white"
      onClick={() => onSelect(event)}
    >
      <div className="flex-shrink-0 bg-blue-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">{event.eventName}</h3>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-800 text-blue-100">
            {event.totalGuests || 0} attendees
          </span>
        </div>
      </div>
      <div className="flex-1 px-6 py-5 flex flex-col justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-600">
            {formatDate(event.eventDate)}
          </p>
          <p className="text-xl font-semibold text-gray-900 mt-2">
            {event.location}
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {event.scannedGuestsCount || 0} check-ins recorded
            </span>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex justify-between items-center">
            <span className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
              View check-in logs
              <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventCheckInDetail = ({ event, onBack, formatDate, formatTime, isLoading }) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-lg text-gray-600">Loading check-in data...</p>
      </div>
    );
  }

  return (
    <Layout>
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-6"
        >
          <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Events
        </button>

        <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">{event.eventName}</h1>
            <p className="mt-1 text-lg text-gray-600">
              {formatDate(event.eventDate)} • {event.location}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-10">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Total Attendees</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{event.totalGuests}</dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Check-ins Recorded</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">{event.scannedGuestsCount || 0}</dd>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">Check-in Rate</dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {Math.round((event.scannedGuestsCount / event.totalGuests) * 100)}%
              </dd>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Check-in Logs</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">All recorded check-ins for this event</p>
          </div>
          
          {event.checkIns.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {event.checkIns.map(log => (
                <CheckInLogCard 
                  key={log.id} 
                  log={log} 
                  formatTime={formatTime}
                />
              ))}
            </ul>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No check-ins</h3>
              <p className="mt-1 text-sm text-gray-500">No check-ins have been recorded for this event yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </Layout>
    
  );
};

const CheckInLogCard = ({ log, formatTime }) => {
  // Compute status message
  let statusMessage = '';
  if (log.type === 'single') {
    statusMessage = log.remainednumberofscans === 0 ? '✅ Completed' : '⏳ Not yet scanned';
  } else if (log.type === 'double') {
    if (log.remainednumberofscans === 1) {
      statusMessage = '🔁 1 scan remaining';
    } else if (log.remainednumberofscans === 0) {
      statusMessage = '✅ Completed';
    } else {
      statusMessage = `⏳ ${log.remainednumberofscans} scans remaining`;
    }
  } else {
    statusMessage = 'Unknown guest type';
  }

  return (
    <li className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors duration-150 border border-gray-100 rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-800 font-medium">
              {log.firstName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{log.firstName + " " + log.lastName}</div>
            <div className="text-sm text-gray-500">{log.phone}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">{new Date(log.scannedAt).toLocaleString()}</div>
          <div className="text-sm text-gray-500">Scanned by: {log.scannedByUser.firstName+" "+log.scannedByUser.lastName}</div>
        </div>
      </div>
      
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-gray-500">Type: {log.type.charAt(0).toUpperCase()+log.type.slice(1)}</span>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            statusMessage.includes('Completed')
              ? 'bg-green-100 text-green-800'
              : statusMessage.includes('remaining')
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {statusMessage}
        </span>
      </div>
    </li>
  );
};


export default CheckInLogs;