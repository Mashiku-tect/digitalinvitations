import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Loader,
  MessageSquare,
  Search,
  Send,
  X,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../layout/Layout";
import api from "../../utils/api";

const getEventName = (event) => event.eventName || event.name || "Untitled Event";

const formatDate = (dateString) => {
  if (!dateString) return null;

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function SendReminders() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    document.title = "Send Reminders";

    const fetchEvents = async () => {
      setLoadingEvents(true);

      try {
        const response = await api.get(
          "/api/reminders/getallevents"
        );

        console.log("Fetched events response:", response.data);
        const eventsData = response.data?.events || response.data || [];
        const normalizedEvents = Array.isArray(eventsData) ? eventsData : [];

        setEvents(normalizedEvents);
        setFilteredEvents(normalizedEvents);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to load events";
        toast.error(errorMessage);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const nextFilteredEvents = events.filter((event) =>
      getEventName(event).toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredEvents(nextFilteredEvents);
  }, [events, searchTerm]);

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearchTerm(value);
    setIsDropdownOpen(true);

    if (!value.trim()) {
      setSelectedEvent(null);
    }
  };

  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    setSearchTerm(getEventName(event));
    setIsDropdownOpen(false);
  };

  const clearSelectedEvent = () => {
    setSelectedEvent(null);
    setSearchTerm("");
  };

  const handleSendReminder = async () => {
    if (!selectedEvent) {
      toast.error("Please select an event");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a reminder message");
      return;
    }

    setSending(true);

    try {
      const response = await api.post("/api/reminders/send", {
        eventId: selectedEvent.id,
        message: message.trim(),
      });

      toast.success(response.data?.message || "Reminder sent successfully");
      clearSelectedEvent();
      setMessage("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to send reminder";
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const selectedEventDate = formatDate(
    selectedEvent?.eventDate || selectedEvent?.date || selectedEvent?.createdAt
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Send Reminders
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Select an event and send a reminder message to its guests
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Event <span className="text-red-500">*</span>
              </label>

              {!selectedEvent ? (
                <div className="relative">
                  <div className="relative">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder="Search and select an event..."
                      className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                    />
                    <ChevronDown
                      size={18}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {loadingEvents ? (
                        <div className="p-4 text-center text-gray-500">
                          <Loader
                            size={20}
                            className="animate-spin mx-auto text-blue-600"
                          />
                          <p className="mt-2 text-sm">Loading events...</p>
                        </div>
                      ) : filteredEvents.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Calendar size={24} className="mx-auto mb-2" />
                          <p className="text-sm">No events found</p>
                        </div>
                      ) : (
                        filteredEvents.map((event) => {
                          const eventDate = formatDate(
                            event.eventDate || event.date || event.createdAt
                          );

                          return (
                            <button
                              type="button"
                              key={event.id}
                              onClick={() => handleEventSelect(event)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                            >
                              <p className="font-medium text-gray-900">
                                {getEventName(event)}
                              </p>
                              {eventDate && (
                                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                                  <Calendar size={12} />
                                  <span>{eventDate}</span>
                                </div>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                        <Calendar size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {getEventName(selectedEvent)}
                        </h3>
                        {selectedEventDate && (
                          <p className="text-sm text-blue-700 mt-1">
                            {selectedEventDate}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={clearSelectedEvent}
                      className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                      aria-label="Clear selected event"
                    >
                      <X size={18} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={18} className="text-gray-500" />
                <label className="block text-sm font-medium text-gray-700">
                  Reminder Message <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={7}
                  placeholder="Type the reminder message you want to send to this event's guests..."
                  className="w-full p-4 pb-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 resize-none"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {message.length} characters
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendReminder}
                disabled={sending || !selectedEvent || !message.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Send Reminder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {isDropdownOpen && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </Layout>
  );
}
