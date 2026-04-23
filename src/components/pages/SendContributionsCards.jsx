// app/contributions/send/page.jsx or pages/contributions/send.jsx
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  Users, 
  Send,
  MessageSquare,
  CheckCircle,
  X,
  ChevronDown,
  DollarSign
} from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from "../../utils/api";
import Layout from '../layout/Layout';

export default function SendContributionPage() {
  const router = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [sending, setSending] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/api/contributions/eventsforsendingcontributions', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const eventsData = response.data.events || [];
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } catch (error) {
        const errormessage = error.response?.data?.message || 'Failed to load events';
        toast.error(errormessage);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  // Update page title
  useEffect(() => {
    document.title = "Send Contribution Requests";
  }, []);

  // Filter events based on search
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEvents(events);
    } else {
      const filtered = events.filter(event => 
        event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEvents(filtered);
    }
  }, [searchTerm, events]);

  // Fetch event details when selected
  const handleEventSelect = async (event) => {
    setSelectedEvent(event);
    setIsDropdownOpen(false);
    setSearchTerm(event.eventName);
    
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/api/events/eventdetails/${event.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setEventDetails(response.data.event);
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Failed to load event details');
    }
  };

  // Clear selected event
  const clearSelectedEvent = () => {
    setSelectedEvent(null);
    setSearchTerm("");
    setEventDetails(null);
  };

  // Handle send contribution requests
  const handleSendContributions = async () => {
    if (!selectedEvent) {
      toast.error('Please select an event');
      return;
    }

    if (!customMessage.trim()) {
      toast.error('Please enter a custom message');
      return;
    }

    setSending(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        eventId: selectedEvent.id,
        message: customMessage.trim()
      };
      
       const response=await api.post(
        '/api/contributions/send-requests',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const sentcount=response.data?.summary?.sent || 0;
      toast.success(`Contribution requests sent successfully to ${sentcount} guests!`);
      
      // Clear form after successful send
      setTimeout(() => {
        clearSelectedEvent();
        setCustomMessage("");
      }, 2000);
      
    } catch (error) {
      const errormessage = error.response?.data?.message || 'Failed to send contribution requests';
      toast.error(errormessage);
    } finally {
      setSending(false);
    }
  };

  // Message templates
  const messageTemplates = [
    {
      name: "Friendly",
      message: "Hi! We're excited to invite you to contribute to our event. Your support means the world to us!"
    },
    {
      name: "Professional",
      message: "Dear guest, we would be honored if you would consider making a contribution to our event. Thank you for your support."
    },
    {
      name: "Casual",
      message: "Hey there! Want to chip in for our upcoming event? Every contribution helps make it amazing!"
    }
  ];

  const applyTemplate = (template) => {
    setCustomMessage(template.message);
  };

  return (
    <Layout>
         <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
          <button
  onClick={() => router(-1)}
  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
>
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Send Contribution Requests</h1>
              <p className="text-sm text-gray-500 mt-1">
                Select an event and craft a message to request contributions from guests
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Event Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Event <span className="text-red-500">*</span>
            </label>
            
            {!selectedEvent ? (
              <div className="relative">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for an event..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                  />
                  <ChevronDown 
                    size={18} 
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </div>
                
                {/* Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {loadingEvents ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-sm">Loading events...</p>
                      </div>
                    ) : filteredEvents.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <Calendar size={24} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm">No events found</p>
                      </div>
                    ) : (
                      filteredEvents.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => handleEventSelect(event)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{event.eventName}</p>
                              {/* <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <Calendar size={12} />
                                <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                              </div> */}
                            </div>
                            <ChevronDown size={16} className="text-gray-400 -rotate-90" />
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedEvent.eventName}</h3>
                      
                    </div>
                  </div>
                  <button
                    onClick={clearSelectedEvent}
                    className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Custom Message */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Custom Message <span className="text-red-500">*</span>
            </label>
            
            {/* Message Templates */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Quick Templates:</p>
              <div className="flex flex-wrap gap-2">
                {messageTemplates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => applyTemplate(template)}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Type your message to request contributions from guests..."
                rows={6}
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 resize-none"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {customMessage.length} characters
              </div>
            </div>
            
            {/* Message Tips */}
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>💡 Tip:</strong> Your message will be sent to all guests of the selected event. 
                Make it personal and clear about how they can contribute.
              </p>
            </div>
          </div>


       

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendContributions}
              disabled={sending || !selectedEvent || !customMessage.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Contribution Requests
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
    </Layout>
   
  );
}