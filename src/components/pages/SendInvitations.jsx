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
  const [sendMethod, setSendMethod] = useState('both'); // 'sms', 'whatsapp', 'both'

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
        'http://localhost:5000/api/invitations/send',
        {
          eventId: selectedEvent,
          message: message,
          method: sendMethod
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

  // Preview message with guest name
  const previewMessage = (guestName = 'Guest') => {
    return message.replace(/{name}/g, guestName);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Send Invitations</h1>
            <p className="text-gray-600">Send personalized invitations via SMS and WhatsApp</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Event Selection & Message</h2>
            
            {/* Event Selection */}
            <div className="mb-6">
              <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-2">
                Select Event *
              </label>
              <select
                id="event"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <p className="text-sm text-gray-500 mt-2">Loading events...</p>
              )}
            </div>
            
            {/* Message Composition */}
            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Invitation Message *
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Write your invitation message here..."
              />
              <p className="text-sm text-gray-500 mt-2">
                Use <code className="bg-gray-100 px-1 py-0.5 rounded">{'{name}'}</code> to personalize with guest names
              </p>
            </div>

            {/* Send Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send Via *
              </label>
              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sendMethod"
                    value="both"
                    checked={sendMethod === 'both'}
                    onChange={() => setSendMethod('both')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">Both SMS & WhatsApp</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sendMethod"
                    value="sms"
                    checked={sendMethod === 'sms'}
                    onChange={() => setSendMethod('sms')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">SMS Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="sendMethod"
                    value="whatsapp"
                    checked={sendMethod === 'whatsapp'}
                    onChange={() => setSendMethod('whatsapp')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">WhatsApp Only</span>
                </label>
              </div>
            </div>

            {/* Message Preview */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Message Preview:</h3>
              <p className="text-blue-700">{previewMessage()}</p>
            </div>
          </div>

          {/* Send Button */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div>
                <h3 className="font-medium text-gray-800">
                  Send invitations for selected event
                </h3>
                <p className="text-sm text-gray-600">
                  {sendMethod === 'both' && 'Via SMS and WhatsApp'}
                  {sendMethod === 'sms' && 'Via SMS only'}
                  {sendMethod === 'whatsapp' && 'Via WhatsApp only'}
                </p>
              </div>
              <button
                onClick={sendInvitations}
                disabled={sending || !selectedEvent}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                    Send Invitations
                  </>
                )}
              </button>
            </div>

            {sending && (
              <div className="mt-6">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Sending progress</span>
                  <span>{sendProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${sendProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Sending invitations to all guests of the selected event...
                </p>
              </div>
            )}
          </div>

          {/* Information Card */}
          <div className="bg-blue-50 rounded-2xl shadow-lg p-6 mt-6">
            <h3 className="font-semibold text-blue-800 mb-3">How it works</h3>
            <ul className="text-blue-700 space-y-2 text-sm">
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Select an event to send invitations for</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Customize your invitation message</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Choose how to send (SMS, WhatsApp, or both)</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Invitations will be sent to all guests of the selected event</span>
              </li>
              <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>WhatsApp: Message + Invitation Card | SMS: Message + Download Link</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SendInvitations;