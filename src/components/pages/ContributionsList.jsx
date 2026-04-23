"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../layout/Layout";
import {
  ArrowLeft,
  Search,
  Phone,
  User,
  Users as UsersIcon,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../utils/api";

const normalizeContributor = (contributor) => {
  const status = String(contributor.status ?? "not_sent").toLowerCase();

  return {
    id: contributor.id,
    name:
      contributor.name ||
      `${contributor.firstName || ""} ${contributor.lastName || ""}`.trim() ||
      "Contributor",
    email: contributor.email || "-",
    phone: contributor.phone || contributor.phoneNumber || "",
    status,
    channel: contributor.channel || null,
    deliveryStatus: contributor.deliveryStatus || null,
  };
};

const normalizeEvent = (event) => {
  const contributors =
    event.contributors || event.Contributors || event.Guests || event.guests || [];

  return {
    id: event.id,
    name: event.eventName || event.name || "Untitled Event",
    contributors: Array.isArray(contributors)
      ? contributors.map(normalizeContributor)
      : [],
  };
};

export default function ContributionEventDetailsPage() {
  const ITEMS_PER_PAGE = 10;
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [contributors, setContributors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [eventName, setEventName] = useState("Contribution Event");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContributionEvent = async () => {
      setIsLoading(true);

      try {
        const response = await api.get(`/api/contributions/getcontributors/${eventId}`);
        //console.log('returned contributors',response.data?.event)
        const eventData =
          response.data?.event || []
          

        const currentEvent = eventData ? normalizeEvent(eventData) : null;

        if (!currentEvent) {
          toast.error("Contribution event not found");
          setContributors([]);
          setEventName("Contribution Event");
          return;
        }

        setContributors(currentEvent.contributors);
        setEventName(currentEvent.name);
      } catch (error) {
        const errorMessage =
          error.response?.data?.message || "Failed to load contribution data";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributionEvent();
  }, [eventId]);

  const filteredContributors = contributors.filter((contributor) => {
    const matchesSearch =
      contributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contributor.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || contributor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredContributors.length / ITEMS_PER_PAGE)
  );
  const pageStartIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedContributors = filteredContributors.slice(
    pageStartIndex,
    pageStartIndex + ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage((prevPage) => Math.min(prevPage, totalPages));
  }, [totalPages]);

  const getStatusColor = (status) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-700 border-green-200";
      case "not_sent":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "sent":
        return "Sent";
      case "not_sent":
        return "Not Sent";
      default:
        return "Unknown";
    }
  };

  const getChannelLabel = (channel) => {
    switch (String(channel || "").toLowerCase()) {
      case "sms":
        return "SMS";
      case "whatsapp":
        return "WhatsApp";
      default:
        return channel || "-";
    }
  };

  const getDeliveryStatusLabel = (status) => {
    if (!status) return "-";

    return String(status)
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <ToastContainer position="top-right" autoClose={3000} />

        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {eventName}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  View and manage contributors for this event
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Contributors</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {contributors.length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UsersIcon size={20} className="text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="all">All Status</option>
              <option value="not_sent">Not Sent</option>
              <option value="sent">Sent</option>
            </select>
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
          ) : filteredContributors.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12">
              <div className="text-center">
                <UsersIcon size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No contributors found
                </h3>
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "This contribution event does not have any contributors yet"}
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
                        Contributor
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedContributors.map((contributor) => (
                      <tr key={contributor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                              <User size={16} className="text-gray-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {contributor.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {/* <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Mail size={14} />
                              <span>{contributor.email}</span>
                            </div> */}
                            {contributor.phone && (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Phone size={14} />
                                <span>{contributor.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                              contributor.status
                            )}`}
                          >
                            {getStatusLabel(contributor.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {contributor.status === "sent" && contributor.channel
                            ? getChannelLabel(contributor.channel)
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {contributor.status === "sent"
                            ? getDeliveryStatusLabel(contributor.deliveryStatus)
                            : "-"}
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
                    pageStartIndex + paginatedContributors.length,
                    filteredContributors.length
                  )}{" "}
                  of {filteredContributors.length} contributors
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
