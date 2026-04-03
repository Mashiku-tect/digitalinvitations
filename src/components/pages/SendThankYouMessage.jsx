import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Search, Send, Loader } from 'lucide-react';
//import api from '../../services/api'; // Adjust this import based on your API service
import Layout from '../layout/Layout';
import api from "../../utils/api";

const SendThankYouMessage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [thankYouMessage, setThankYouMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch events from backend
  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter events based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(event =>
        event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [searchTerm, events]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Adjust this API endpoint based on your backend
      const response = await api.get('/api/scannedevents');
      //console.log('Fetched events:', response.data);
      setEvents(response.data);
      setFilteredEvents(response.data);
    } catch (error) {
     // console.error('Error fetching events:', error);
      toast.error('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setSearchTerm(event.eventName);
    setShowDropdown(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
    if (e.target.value === '') {
      setSelectedEvent(null);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedEvent) {
      toast.error('Please select an event first');
      return;
    }

    if (!thankYouMessage.trim()) {
      toast.error('Please enter a thank you message');
      return;
    }

    setSending(true);
    try {
      // Adjust this API endpoint based on your backend
     const response = await api.post(`/api/events/${selectedEvent.id}/send-thank-you`, {
        message: thankYouMessage
      });

      const responsemessage= response.data.message || 'Thank you message sent successfully!';
      //console.log('response message is',responsemessage)
      toast.success(responsemessage);
     
      
      //toast.success(`Thank you message sent successfully for "${selectedEvent.eventName}"!`);
      setThankYouMessage('');
      setSelectedEvent(null);
      setSearchTerm('');
    } catch (error) {
     // console.error('Error sending thank you message:', error);
      toast.error('Failed to send thank you message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
     <Layout>
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Send Thank You Message
        </h1>
        
        {/* Event Selection Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Event
          </label>
          <div className="relative">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search for an event..."
                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            
            {/* Dropdown for event selection */}
            {showDropdown && (loading ? (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                <div className="p-4 text-center text-gray-500">
                  <Loader className="animate-spin inline-block mr-2" size={16} />
                  Loading events...
                </div>
              </div>
            ) : (
              filteredEvents.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEventSelect(event)}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="font-medium text-gray-800">{event.eventName}</div>
                      {event.date && (
                        <div className="text-sm text-gray-500">
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ))}
          </div>
          
          {/* Selected event display */}
          {selectedEvent && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Selected Event:</strong> {selectedEvent.eventName}
              </p>
              {selectedEvent.eventDate && (
                <p className="text-sm text-blue-600 mt-1">
                  Date: {new Date(selectedEvent.eventDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Thank You Message Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thank You Message
          </label>
          <textarea
            value={thankYouMessage}
            onChange={(e) => setThankYouMessage(e.target.value)}
            rows="6"
            placeholder="Type your thank you message here..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="mt-1 text-sm text-gray-500">
            Characters: {thankYouMessage.length}
          </p>
        </div>

        {/* Message Preview (Optional) */}
        {/* {thankYouMessage && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview:</h3>
            <div className="text-gray-600 whitespace-pre-wrap">
              {thankYouMessage}
            </div>
          </div>
        )} */}

        {/* Send Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSendMessage}
            disabled={!selectedEvent || !thankYouMessage.trim() || sending}
            className={`
              flex items-center px-6 py-2 rounded-lg transition-colors
              ${(!selectedEvent || !thankYouMessage.trim() || sending)
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            {sending ? (
              <>
                <Loader className="animate-spin mr-2" size={18} />
                Sending...
              </>
            ) : (
              <>
                <Send size={18} className="mr-2" />
                Send Thank You Message
              </>
            )}
          </button>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default SendThankYouMessage;