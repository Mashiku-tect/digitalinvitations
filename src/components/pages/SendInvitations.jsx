import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const SendInvitations = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState(`You're invited to our special event! We can't wait to celebrate with you.`);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

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
        //console.log("events data",response.data.events)
        setEvents(response.data.events || []);
      } catch (error) {
        const errormessage=error.response.data.message;
          if (error.response && error.response.status === 403) {
            toast.error('You Need Event Viewing  Permission to load events')
        // Handle unauthorized access, maybe redirect to login
        //alert('You Need Event Viwer Permission to load events');
       // console.log('Unauthorized access to event details');
        return;
      }
       // console.error('Error fetching events:', error);
        //alert('Failed to load events');
        toast.error(errormessage);
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
      
      // Set summary data and show modal
      setSummaryData(response.data);
      setShowSummary(true);
      
    } catch (error) {
      //console.error('Error sending invitations:', error);
      const errormessage=error?.response?.data.message;
      toast.error(errormessage);
      //alert(`Failed to send invitations ${errormessage}`);
    } finally {
      setSending(false);
      setSendProgress(100);
    }
  };

  const closeSummary = () => {
    setShowSummary(false);
    setSummaryData(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <ToastContainer position="top-right" autoClose={3000} />
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
{events
  .filter(event => event.isInitialMessageSent === false)
  .map(event => (
    <option key={event.id} value={event.id}>
      {event.eventName} - {new Date(event.eventDate).toLocaleDateString()}
    </option>
  ))}

                </select>
                {loadingEvents && (
                  <p className="text-xs text-gray-500 mt-1">Loading events...</p>
                )}
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

      {/* Summary Modal */}
      {showSummary && summaryData && (
  <div className="fixed inset-0 bg-gray-500 bg-opacity-10 backdrop-blur-[1px] flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 transform transition-all duration-200 scale-100">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Invitations Sent Successfully!</h3>
          <button
            onClick={closeSummary}
            className="text-gray-400 hover:text-gray-600 transition duration-200 hover:bg-gray-100 rounded-full p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success Message */}
        <div className="mb-6">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-green-600 text-center font-medium">{summaryData.message}</p>
        </div>

        {/* Summary Section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3 text-center">Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-blue-600">{summaryData.summary.sent}</div>
              <div className="text-xs text-gray-600 mt-1">Sent</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-yellow-600">{summaryData.summary.skipped}</div>
              <div className="text-xs text-gray-600 mt-1">Skipped</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
              <div className="text-2xl font-bold text-green-600">{summaryData.summary.remindersCreated}</div>
              <div className="text-xs text-gray-600 mt-1">Reminders</div>
            </div>
          </div>
        </div>

        {/* Reminders Section */}
        {summaryData.reminders && summaryData.reminders.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3">Scheduled Reminders</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {summaryData.reminders.map((reminder, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Reminder {reminder.reminder_number}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {formatDate(reminder.scheduled_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={closeSummary}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </Layout>
  );
};

export default SendInvitations;