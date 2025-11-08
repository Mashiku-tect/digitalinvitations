import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import axios from 'axios';

const SendInvitations = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState(`You're invited to our special event! We can't wait to celebrate with you.`);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/getallevents', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setEvents(response.data.events || []);
      } catch (error) {
          if (error.response && error.response.status === 403) {
        // Handle unauthorized access, maybe redirect to login
        alert('You Need Event Viwer Permission to load events');
       // console.log('Unauthorized access to event details');
        return;
      }
        console.error('Error fetching events:', error);
        alert('Failed to load events');
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  // Send invitations
  const sendInvitations = async () => {
    if (!selectedEvent) {
      alert('Please select an event to send invitations for.');
      return;
    }

    setSending(true);
    setSendProgress(0);
    
    try {
      const token = localStorage.getItem('token');
      
      // Call the backend API to send invitations
      const response = await axios.post(
        'http://localhost:5000/api/invitations/send/SMS',
        {
          eventId: selectedEvent,
          message: message
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setSendProgress(percentCompleted);
          }
        }
      );
      
      alert('Invitations sent successfully!');
    } catch (error) {
      console.error('Error sending invitations:', error);
      alert('Failed to send invitations. Please try again.');
    } finally {
      setSending(false);
      setSendProgress(100);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Send Invitations</h1>
            <p className="text-gray-600 text-sm">Send personalized invitations to your guests</p>
          </div>

          {/* Combined Form Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Event Invitation</h2>
            
            <div className="space-y-4">
              {/* Event Selection */}
              <div>
                <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Event *
                </label>
                <select
                  id="event"
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={loadingEvents}
                >
                  <option value="">-- Select an Event --</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.eventName} - {new Date(event.eventDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {loadingEvents && (
                  <p className="text-xs text-gray-500 mt-1">Loading events...</p>
                )}
              </div>
              
              {/* Message Composition */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Invitation Message *
                  </label>
                  <span className="text-xs text-gray-500">
                    {message.length} characters
                  </span>
                </div>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-vertical"
                  placeholder="Write your invitation message here..."
                />
             
              </div>

              {/* Send Button Section */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 text-sm">
                      Ready to send invitations
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Invitations will be sent to all guests of "{events.find(e => e.id === selectedEvent)?.eventName || 'selected event'}"
                    </p>
                  </div>
                  <button
                    onClick={sendInvitations}
                    disabled={sending || !selectedEvent}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center text-sm whitespace-nowrap"
                  >
                    {sending ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                        Send Invitations
                      </>
                    )}
                  </button>
                </div>

                {/* Progress Bar */}
                {sending && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Sending progress</span>
                      <span>{sendProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${sendProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Sending invitations to all guests...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

         
        </div>
      </div>
    </Layout>
  );
};

export default SendInvitations;