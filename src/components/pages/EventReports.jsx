import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from 'react-router-dom';
import Layout from '../layout/Layout';

const EventReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/events/reports/${id}`);
        setReport(res.data);
      } catch (err) {
        console.error("Error fetching report:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const handleDownloadPDF = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/events/report/pdf/${id}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `event-report-${report.eventName}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Error downloading PDF:", err);
    }
  };

  if (loading) return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    </Layout>
  );
  
  if (!report) return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No Report Available</h2>
            <p className="text-gray-600">Sorry, we couldn't find a report for this event.</p>
          </div>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white rounded-2xl shadow-lg p-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{report.eventName} – Event Report</h1>
              <p className="text-gray-600 mt-1">Detailed analytics and insights for your event</p>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="mt-4 md:mt-0 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Download PDF Report
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Total Invited</p>
                  <h3 className="text-2xl font-bold text-gray-800">{report.totalInvited}</h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Checked In</p>
                  <h3 className="text-2xl font-bold text-gray-800">{report.totalCheckedIn}</h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-100 p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Attendance Rate</p>
                  <h3 className="text-2xl font-bold text-gray-800">{report.attendanceRate}%</h3>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center">
                <div className="rounded-full bg-yellow-100 p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Event Date</p>
                  <h3 className="text-lg font-bold text-gray-800">{report.date}</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Guest Statistics */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                Guest Statistics
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Single Invitations</p>
                  <p className="text-lg font-semibold text-gray-800">{report.singleInvites}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Double Invitations</p>
                  <p className="text-lg font-semibold text-gray-800">{report.doubleInvites}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Single Checked-in</p>
                  <p className="text-lg font-semibold text-gray-800">{report.singleCheckedIn}</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Double (Partial)</p>
                  <p className="text-lg font-semibold text-gray-800">{report.doublePartial}</p>
                </div>
                <div className="bg-indigo-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">Double (Full)</p>
                  <p className="text-lg font-semibold text-gray-800">{report.doubleFull}</p>
                </div>
              </div>
            </div>

            {/* Check-in Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Check-in Timeline
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="pb-2">Time Slot</th>
                      <th className="pb-2 text-right">Guests Checked-in</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.timeline.map((slot, idx) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-0">
                        <td className="py-3 text-gray-700">{slot.time}</td>
                        <td className="py-3 text-right font-medium">{slot.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Guest List Preview */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 4a1 1 0 00-1 1v10a1 1 0 001 1h10a1 1 0 001-1V5a1 1 0 00-1-1H5zm0-2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V5a3 3 0 00-3-3H5z" clipRule="evenodd" />
                </svg>
                Guest List Preview
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-600 border-b">
                      <th className="pb-2">Name</th>
                      <th className="pb-2">Type</th>
                      <th className="pb-2">RSVP</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Check-in Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.guestList.slice(0, 5).map((guest, idx) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="py-3 text-gray-700">{guest.name}</td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                            {guest.type}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${guest.rsvp === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {guest.rsvp}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${guest.status === 'Checked In' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {guest.status}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500">{guest.scannedAt || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {report.guestList.length > 5 && (
                  <p className="text-gray-500 text-sm mt-4 text-center">Showing first 5 guests. Download the full report for complete list.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventReport;