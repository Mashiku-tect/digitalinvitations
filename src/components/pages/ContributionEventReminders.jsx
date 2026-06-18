import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  Loader,
  MessageSquare,
  Search,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../layout/Layout";
import api from "../../utils/api";

const getEventName = (event) => event.eventName || event.name || "Untitled Event";

const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const normalizeReminder = (reminder, index) => {
  const reminderLabel = reminder.reminderText || reminder.title || "";
  const reminderNumber =
    reminder.reminderNumber ||
    reminder.reminder_number ||
    reminder.number ||
    String(reminderLabel).match(/\d+/)?.[0] ||
    index + 1;

  return {
    id: reminder.id || reminder.reminderId || reminder._id || reminderNumber,
    number: reminderNumber,
    title: reminderLabel || `Reminder ${reminderNumber}`,
    message: reminder.message || reminder.reminderMessage || "",
    sentAt:
      reminder.sentAt ||
      reminder.sent_at ||
      reminder.createdAt ||
      reminder.created_at ||
      reminder.scheduled_at,
    totalGuests:
      reminder.totalGuests ??
      reminder.numberOfGuests ??
      reminder.guestsCount ??
      reminder.recipientCount ??
      reminder.summary?.total ??
      0,
    sentCount:
      reminder.sentCount ??
      reminder.deliveredReminders ??
      reminder.summary?.sent ??
      reminder.receivedCount ??
      0,
    pendingCount:
      reminder.pendingCount ??
      reminder.pendingReminders ??
      reminder.summary?.pending ??
      0,
    failedCount:
      reminder.failedCount ??
      reminder.failedReminders ??
      reminder.notSentCount ??
      reminder.summary?.failed ??
      0,
  };
};

export default function ContributionEventReminders() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingReminders, setLoadingReminders] = useState(false);

  useEffect(() => {
    document.title = "Contribution Event Reminders";

    const fetchEvents = async () => {
      setLoadingEvents(true);

      try {
        const response = await api.get(
          "/api/reminders/getallevents"
        );

        //console.log("API Response for events:", response.data);
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
    setFilteredEvents(
      events.filter((event) =>
        getEventName(event).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [events, searchTerm]);

  const fetchReminders = async (event) => {
    setSelectedEvent(event);
    setLoadingReminders(true);
    setReminders([]);

    try {
      const response = await api.get(
        `/api/reminders/events/${event.id}/get-event-reminders`
      );

      console.log("API Response for reminders:", response.data);
      const remindersData =
        response.data?.reminders ||
        response.data?.data ||
        response.data?.event?.reminders ||
        response.data ||
        [];

      setReminders(
        Array.isArray(remindersData)
          ? remindersData.map(normalizeReminder)
          : []
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to load reminders";
      toast.error(errorMessage);
    } finally {
      setLoadingReminders(false);
    }
  };

  const openReminder = (reminder) => {
    navigate(
      `/reminders/view/${selectedEvent.id}/${reminder.id}`,
      {
        state: {
          eventName: getEventName(selectedEvent),
          reminderNumber: reminder.number,
          reminder,
        },
      }
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                  View Reminders
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Select a contribution event to view reminders sent to guests
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Events
                </label>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search event..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="max-h-[640px] overflow-y-auto">
                {loadingEvents ? (
                  <div className="p-8 text-center text-gray-500">
                    <Loader size={24} className="animate-spin mx-auto text-blue-600" />
                    <p className="mt-2 text-sm">Loading events...</p>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Calendar size={36} className="mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">No events found</p>
                  </div>
                ) : (
                  filteredEvents.map((event) => {
                    const isSelected = selectedEvent?.id === event.id;

                    return (
                      <button
                        type="button"
                        key={event.id}
                        onClick={() => fetchReminders(event)}
                        className={`w-full px-4 py-3 text-left border-b border-gray-100 transition-colors ${
                          isSelected
                            ? "bg-blue-50"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900">
                          {getEventName(event)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(event.eventDate || event.date || event.createdAt)}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Selected Event</p>
                    <h2 className="text-xl font-semibold text-gray-900 mt-1">
                      {selectedEvent ? getEventName(selectedEvent) : "No event selected"}
                    </h2>
                  </div>
                  <div className="w-11 h-11 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare size={22} className="text-blue-600" />
                  </div>
                </div>
              </div>

              {!selectedEvent ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Choose an event
                  </h3>
                  <p className="text-gray-500">
                    Select an event from the list to see its sent reminders.
                  </p>
                </div>
              ) : loadingReminders ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Loader size={28} className="animate-spin mx-auto text-blue-600" />
                  <p className="mt-3 text-sm text-gray-500">Loading reminders...</p>
                </div>
              ) : reminders.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No reminders found
                  </h3>
                  <p className="text-gray-500">
                    No reminders have been sent for this event yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reminders.map((reminder) => (
                    <button
                      type="button"
                      key={reminder.id}
                      onClick={() => openReminder(reminder)}
                      className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {reminder.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                            <Clock size={15} />
                            <span>{formatDate(reminder.sentAt)}</span>
                          </div>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                      </div>

                      {reminder.message && (
                        <p className="text-sm text-gray-600 mt-4">
                          {reminder.message}
                        </p>
                      )}

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-5">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Guests</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {reminder.totalGuests}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                          <p className="text-xs text-green-700">Sent</p>
                          <p className="text-lg font-semibold text-green-700">
                            {reminder.sentCount}
                          </p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3">
                          <p className="text-xs text-red-700">Failed</p>
                          <p className="text-lg font-semibold text-red-700">
                            {reminder.failedCount}
                          </p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-3">
                          <p className="text-xs text-yellow-700">Pending</p>
                          <p className="text-lg font-semibold text-yellow-700">
                            {reminder.pendingCount}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
