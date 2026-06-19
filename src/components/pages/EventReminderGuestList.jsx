import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  MessageSquare,
  Phone,
  Search,
  Send,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../layout/Layout";
import api from "../../utils/api";

const ITEMS_PER_PAGE = 10;

const normalizeStatus = (guest) => {
  const rawStatus = String(
    guest.deliveryStatus ||
      guest.status ||
      guest.reminderStatus ||
      guest.receivedStatus ||
      ""
  ).toLowerCase();

  if (
    rawStatus === "received" ||
    rawStatus === "delivered" ||
    guest.received === true ||
    guest.isReceived === true
  ) {
    return "received";
  }

  if (
    rawStatus === "failed" ||
    rawStatus === "not_received" ||
    rawStatus === "not sent" ||
    rawStatus === "not_sent" ||
    guest.received === false ||
    guest.isReceived === false
  ) {
    return "not_received";
  }

  return "pending";
};

const normalizeGuest = (guest, index) => ({
  id:
    guest.id ||
    guest.guestId ||
    guest._id ||
    guest.phone ||
    guest.phoneNumber ||
    index,
  name:
    guest.name ||
    guest.fullName ||
    `${guest.firstName || ""} ${guest.lastName || ""}`.trim() ||
    "Guest",
  phone: guest.phone || guest.phoneNumber || guest.mobile || "",
  email: guest.email || "",
  channel: guest.channel || guest.sentThrough || guest.deliveryChannel || "-",
  deliveryStatus:
    guest.deliveryStatus ||
    guest.providerStatus ||
    guest.statusMessage ||
    guest.messageStatus ||
    "",
  statusText: guest.statusText || "",
  message: guest.message || "",
  sentAt: guest.sentAt || guest.sent_at || guest.createdAt || guest.created_at,
  status: normalizeStatus(guest),
});

const normalizeSummary = (summary, guests) => ({
  totalGuests: summary?.numberOfGuests ?? summary?.totalGuests ?? guests.length,
  delivered: summary?.deliveredReminders ?? summary?.delivered ?? 0,
  pending: summary?.pendingReminders ?? summary?.pending ?? 0,
  failed: summary?.failedReminders ?? summary?.failed ?? 0,
});

const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatLabel = (value) => {
  if (!value) return "-";

  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getStatusColor = (status) => {
  switch (status) {
    case "received":
      return "bg-green-100 text-green-700 border-green-200";
    case "not_received":
      return "bg-red-100 text-red-700 border-red-200";
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "received":
      return <CheckCircle size={14} />;
    case "not_received":
      return <XCircle size={14} />;
    default:
      return <MessageSquare size={14} />;
  }
};

export default function EventReminderGuestList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId, reminderId } = useParams();
  const [guests, setGuests] = useState([]);
  const [eventName, setEventName] = useState(
    location.state?.eventName || "Contribution Event"
  );
  const [reminderNumber, setReminderNumber] = useState(
    location.state?.reminderNumber || reminderId
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalGuests: 0,
    delivered: 0,
    pending: 0,
    failed: 0,
  });

  useEffect(() => {
    document.title = "Reminder Guest Status";

    const fetchReminderGuests = async () => {
      setIsLoading(true);

      try {
        const response = await api.get(
          `/api/reminders/events/${eventId}/reminders/${reminderId}/guests`
        );

        //console.log("Fetched reminder guests:", response.data);

        const responseEvent = response.data?.event || {};
        const guestsData =
          responseEvent.guests ||
          response.data?.guests ||
          response.data?.recipients ||
          [];
        const normalizedGuests = Array.isArray(guestsData)
          ? guestsData.map(normalizeGuest)
          : [];

        setGuests(normalizedGuests);
        setSummary(normalizeSummary(responseEvent.summary, normalizedGuests));
        setEventName(
          responseEvent.eventName ||
            responseEvent.name ||
            response.data?.eventName ||
            location.state?.eventName ||
            "Event"
        );
        setReminderNumber(
          response.data?.reminder?.reminderNumber ||
            response.data?.reminder?.reminder_number ||
            location.state?.reminderNumber ||
            reminderId
        );
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to load reminder guests";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReminderGuests();
  }, [eventId, reminderId, location.state]);

  const filteredGuests = guests.filter((guest) => {
    const searchValue = searchTerm.toLowerCase();
    const matchesSearch =
      guest.name.toLowerCase().includes(searchValue) ||
      guest.phone.toLowerCase().includes(searchValue) ||
      guest.email.toLowerCase().includes(searchValue);
    const matchesStatus =
      statusFilter === "all" || guest.status === statusFilter;
    const matchesChannel =
      channelFilter === "all" ||
      String(guest.channel).toLowerCase() === channelFilter;

    return matchesSearch && matchesStatus && matchesChannel;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, channelFilter]);

  const channels = Array.from(
    new Set(
      guests
        .map((guest) => String(guest.channel || "").toLowerCase())
        .filter((channel) => channel && channel !== "-")
    )
  );
  const totalPages = Math.max(1, Math.ceil(filteredGuests.length / ITEMS_PER_PAGE));
  const pageStartIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGuests = filteredGuests.slice(
    pageStartIndex,
    pageStartIndex + ITEMS_PER_PAGE
  );
  const receivedCount = summary.delivered;
  const notReceivedCount = summary.failed;
  const pendingCount = summary.pending;

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const handleExportPdf = () => {
    if (filteredGuests.length === 0) {
      toast.error("There are no guests to export");
      return;
    }

    const generatedAt = new Date().toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    const rows = filteredGuests
      .map(
        (guest, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(guest.name)}</td>
            <td>${escapeHtml(guest.phone || "-")}</td>
            <td>${escapeHtml(formatLabel(guest.channel))}</td>
            <td>${escapeHtml(formatLabel(guest.deliveryStatus || guest.status))}</td>
            <td>${escapeHtml(formatDate(guest.sentAt))}</td>
          </tr>
        `
      )
      .join("");
    const reportWindow = window.open("", "_blank", "width=1100,height=800");

    if (!reportWindow) {
      toast.error("Please allow pop-ups to export the PDF");
      return;
    }

    reportWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${escapeHtml(eventName)} - Reminder ${escapeHtml(
            reminderNumber
          )}</title>
          <style>
            @page { size: A4 landscape; margin: 14mm; }
            * { box-sizing: border-box; }
            body {
              color: #111827;
              font-family: Arial, sans-serif;
              margin: 0;
            }
            .header {
              align-items: center;
              border-bottom: 2px solid #d1d5db;
              display: flex;
              gap: 14px;
              justify-content: space-between;
              margin-bottom: 18px;
              padding-bottom: 12px;
            }
            .brand {
              align-items: center;
              display: flex;
              gap: 12px;
            }
            .brand-logo {
              height: 48px;
              object-fit: contain;
              width: 48px;
            }
            .brand-name {
              font-size: 18px;
              font-weight: 700;
              letter-spacing: 0;
            }
            .brand-product {
              color: #4b5563;
              font-size: 12px;
              margin-top: 2px;
            }
            .brand-contact {
              color: #6b7280;
              font-size: 10px;
              line-height: 1.5;
              margin-top: 4px;
            }
            .report-title {
              text-align: right;
            }
            h1 {
              font-size: 22px;
              margin: 0 0 6px;
            }
            .meta {
              color: #4b5563;
              font-size: 12px;
              line-height: 1.6;
            }
            .summary {
              display: grid;
              gap: 10px;
              grid-template-columns: repeat(4, 1fr);
              margin-bottom: 18px;
            }
            .summary-card {
              border: 1px solid #d1d5db;
              border-radius: 8px;
              padding: 10px;
            }
            .summary-label {
              color: #6b7280;
              font-size: 11px;
              margin-bottom: 4px;
            }
            .summary-value {
              font-size: 20px;
              font-weight: 700;
            }
            table {
              border-collapse: collapse;
              font-size: 11px;
              width: 100%;
            }
            th, td {
              border: 1px solid #d1d5db;
              padding: 7px;
              text-align: left;
              vertical-align: top;
            }
            th {
              background: #f3f4f6;
              color: #374151;
              font-size: 10px;
              text-transform: uppercase;
            }
            tr:nth-child(even) td { background: #f9fafb; }
            .footer {
              align-items: center;
              border-top: 1px solid #d1d5db;
              color: #4b5563;
              display: flex;
              gap: 10px;
              justify-content: space-between;
              margin-top: 18px;
              padding-top: 10px;
            }
            .footer-brand {
              align-items: center;
              display: flex;
              gap: 8px;
            }
            .footer-logo {
              height: 24px;
              object-fit: contain;
              width: 24px;
            }
            .footer-text {
              font-size: 11px;
              font-weight: 600;
            }
            .footer-contact {
              color: #6b7280;
              font-size: 10px;
              margin-top: 2px;
            }
            .footer-note {
              color: #6b7280;
              font-size: 10px;
            }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">
              <img class="brand-logo" src="/mashikutechlogo.png" alt="MashikuTech logo" />
              <div>
                <div class="brand-name">MashikuTech</div>
                <div class="brand-product">Event Management Solution</div>
                <div class="brand-contact">
                  Phone: 0626779507<br />
                  Email: mashikuallen@gmail.com
                </div>
              </div>
            </div>
            <div class="report-title">
              <h1>Reminder ${escapeHtml(reminderNumber)} Guest Status</h1>
              <div class="meta">
                <div><strong>Event:</strong> ${escapeHtml(eventName)}</div>
                <div><strong>Generated:</strong> ${escapeHtml(generatedAt)}</div>
                <div><strong>Records:</strong> ${filteredGuests.length}</div>
              </div>
            </div>
          </div>

          <div class="summary">
            <div class="summary-card">
              <div class="summary-label">Total Guests</div>
              <div class="summary-value">${summary.totalGuests}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Received</div>
              <div class="summary-value">${receivedCount}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Not Received</div>
              <div class="summary-value">${notReceivedCount}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Pending</div>
              <div class="summary-value">${pendingCount}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Guest</th>
                <th>Phone</th>
                <th>Channel</th>
                <th>Delivery Status</th>
                <th>Sent At</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div class="footer">
            <div class="footer-brand">
              <img class="footer-logo" src="/mashikutechlogo.png" alt="MashikuTech logo" />
              <div>
                <div class="footer-text">Powered by Mashiku-Tech — where technology meets celebration.</div>
                <div class="footer-contact">Phone: 0626779507 | Email: mashikuallen@gmail.com</div>
              </div>
            </div>
            <div class="footer-note">Reminder guest status report</div>
          </div>

          <script>
            window.onload = function () {
              setTimeout(function () {
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    reportWindow.document.close();
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
                  Reminder {reminderNumber}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {eventName} guest delivery status
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Guests</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {summary.totalGuests}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users size={20} className="text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Received</p>
                  <p className="text-2xl font-semibold text-green-700 mt-1">
                    {receivedCount}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Not Received</p>
                  <p className="text-2xl font-semibold text-red-700 mt-1">
                    {notReceivedCount}
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle size={20} className="text-red-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-semibold text-yellow-700 mt-1">
                    {pendingCount}
                  </p>
                </div>
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Send size={20} className="text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, phone, or email..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="all">All Status</option>
              <option value="received">Received</option>
              <option value="not_received">Not Received</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={channelFilter}
              onChange={(event) => setChannelFilter(event.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="all">All Channels</option>
              {channels.map((channel) => (
                <option key={channel} value={channel}>
                  {formatLabel(channel)}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={isLoading || filteredGuests.length === 0}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              Export PDF
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {isLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12">
              <div className="flex justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            </div>
          ) : filteredGuests.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12">
              <div className="text-center">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No guests found
                </h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "all" || channelFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "This reminder does not have any guest delivery records yet"}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Channel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delivery Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sent At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedGuests.map((guest) => (
                      <tr key={guest.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                              <User size={16} className="text-gray-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {guest.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {guest.phone && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Phone size={14} />
                                <span>{guest.phone}</span>
                              </div>
                            )}
                            {guest.email && (
                              <p className="text-sm text-gray-500">{guest.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                              guest.status
                            )}`}
                          >
                            {getStatusIcon(guest.status)}
                            {formatLabel(guest.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatLabel(guest.channel)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div>
                            <p>{formatLabel(guest.deliveryStatus || guest.status)}</p>
                            {/* {guest.statusText && (
                              <p className="text-xs text-gray-400 mt-1">
                                {guest.statusText}
                              </p>
                            )} */}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(guest.sentAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-gray-500">
                  Showing {pageStartIndex + 1}-
                  {Math.min(
                    pageStartIndex + paginatedGuests.length,
                    filteredGuests.length
                  )}{" "}
                  of {filteredGuests.length} guests
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(page + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
