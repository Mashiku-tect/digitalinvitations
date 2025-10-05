import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import axios from 'axios';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState([]);
  const [updating, setUpdating] = useState(false);
  
  // New states for scan permissions management
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [scanners, setScanners] = useState([]);
  const [availableTenants, setAvailableTenants] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/events/eventdetails/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setEvent(response.data.event);
        setGuests(response.data.event.Guests || response.data.guests || []);
        console.log('Fetched guests:', response.data.event.Guests || response.data.guests || []);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // Fetch scan permissions and tenants
  const fetchScanPermissions = async () => {
    try {
      setLoadingPermissions(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/events/${id}/scan-permissions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setScanners(response.data.scanners || []);
      
      // Also fetch all available tenants
      const tenantsResponse = await axios.get('http://localhost:5000/api/users/tenants', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTenants(tenantsResponse.data.tenants || []);
      
      // Filter out tenants who are already scanners
      const scannerIds = response.data.scanners.map(scanner => scanner.tenant_id);
      const available = tenantsResponse.data.tenants.filter(tenant => 
        !scannerIds.includes(tenant.id)
      );
      setAvailableTenants(available);
      
    } catch (error) {
      console.error('Error fetching scan permissions:', error);
      alert('Failed to load scanner permissions');
    } finally {
      setLoadingPermissions(false);
    }
  };

  // Open permission management modal
  const openPermissionModal = async () => {
    setShowPermissionModal(true);
    await fetchScanPermissions();
  };

  // Add tenant as scanner
  const addScanner = async (tenantId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:5000/api/events/${id}/scan-permissions`, 
        { tenant_id: tenantId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Refresh the lists
      await fetchScanPermissions();
      alert('Tenant added as scanner successfully!');
    } catch (error) {
      console.error('Error adding scanner:', error);
      alert('Failed to add tenant as scanner');
    }
  };

  // Remove tenant from scanners
  const removeScanner = async (scannerId) => {
    if (window.confirm('Are you sure you want to remove this tenant\'s scan permission?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/events/${id}/scan-permissions/${scannerId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Refresh the lists
        await fetchScanPermissions();
        alert('Scan permission removed successfully!');
      } catch (error) {
        console.error('Error removing scanner:', error);
        alert('Failed to remove scan permission');
      }
    }
  };

  // Cancel event function
  const cancelEvent = async () => {
    if (window.confirm('Are you sure you want to cancel this event? This action cannot be undone.')) {
      setUpdating(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
          `http://localhost:5000/api/events/cancel/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        // Update the event state with cancelled status
        setEvent({ ...event, active: false, cancelled: true });
        alert('Event cancelled successfully!');
      } catch (error) {
        console.error('Error cancelling event:', error);
        alert('Failed to cancel event');
      } finally {
        setUpdating(false);
      }
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentGuests = guests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(guests.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Get page numbers to display (max 6 at a time)
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 6;
    
    if (totalPages <= maxVisiblePages) {
      // If total pages is less than max visible, show all
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);
      
      // Adjust if we're near the beginning
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, maxVisiblePages - 1);
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - (maxVisiblePages - 2));
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always include last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const deleteEvent = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/events/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        navigate('/events');
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event');
      }
    }
  };

  const markAsCompleted = async () => {
    if (window.confirm('Are you sure you want to mark this event as completed?')) {
      setUpdating(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
          `http://localhost:5000/api/events/complete/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        // Update the event state with the completed status
        setEvent({ ...event, active: false });
        alert('Event marked as completed successfully!');
      } catch (error) {
        console.error('Error marking event as completed:', error);
        alert('Failed to mark event as completed');
      } finally {
        setUpdating(false);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Not Found</h2>
            <Link to="/events" className="text-blue-600 hover:text-blue-800">
              Back to Events
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const pageNumbers = getPageNumbers();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <Link 
              to="/events" 
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Events
            </Link>
            
            <div className="flex space-x-3">
              {/* Manage Scanners Button */}
              <Link
                to={`/events/${id}/scan-permissions`}
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Manage Scanners
              </Link>

              {/* View Report Button */}
              <Link
                to={`/events/reports/${id}`}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                View Report
              </Link>

              {event.active && !event.cancelled && (
                <>
                  {/* Cancel Event Button */}
                  <button
                    onClick={cancelEvent}
                    disabled={updating}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center disabled:opacity-50"
                  >
                    {updating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Cancel Event
                      </>
                    )}
                  </button>

                  {/* Mark as Completed Button */}
                  <button
                    onClick={markAsCompleted}
                    disabled={updating}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center disabled:opacity-50"
                  >
                    {updating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Marking...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Mark as Completed
                      </>
                    )}
                  </button>
                </>
              )}
              
              <Link
                to={`/editevents/${id}/edit`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.380-8.379-2.83-2.828z" />
                </svg>
                Edit Event
              </Link>
              
              <button
                onClick={deleteEvent}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete
              </button>
            </div>
          </div>

          {/* Event Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{event.eventName}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  event.cancelled ? 'bg-red-100 text-red-800' : 
                  event.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {event.cancelled ? 'Cancelled' : event.active ? 'Upcoming' : 'Completed'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium">Date</p>
                      <p>{new Date(event.eventDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium">Time</p>
                      <p>{event.eventTime}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium">Location</p>
                      <p>{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      <path fillRule="evenodd" d="M2 10a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4zm2 2h12v-2H4v2z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium">Category</p>
                      <p className="capitalize">{event.category}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancelled Event Notice */}
              {event.cancelled && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="text-lg font-semibold text-red-800">Event Cancelled</h3>
                      <p className="text-red-700">This event has been cancelled and is no longer active.</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{event.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Guest List ({event.totalGuests} guests)</h3>
                {guests.length > 0 ? (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                      <table className="w-full min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 text-gray-700 font-medium">S/N</th>
                            <th className="text-left py-2 text-gray-700 font-medium">First Name</th>
                            <th className="text-left py-2 text-gray-700 font-medium">Last Name</th>
                            <th className="text-left py-2 text-gray-700 font-medium">Phone Number</th>
                            <th className="text-left py-2 text-gray-700 font-medium">Type</th>
                            <th className="text-left py-2 text-gray-700 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentGuests.map((guest, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-100">
                              <td className="py-3 text-gray-700">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                              <td className="py-3 text-gray-700">{guest.firstName || 'N/A'}</td>
                              <td className="py-3 text-gray-700">{guest.lastName || 'N/A'}</td>
                              <td className="py-3 text-gray-700">{guest.phone || 'N/A'}</td>
                              <td className="py-3 text-gray-700 capitalize">{guest.type || 'N/A'}</td>
                              <td className="py-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${guest.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {guest.status || 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-gray-700">
                          Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, guests.length)} of {guests.length} Records
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          
                          {pageNumbers.map((page, index) => (
                            page === '...' ? (
                              <span key={`ellipsis-${index}`} className="px-3 py-1 rounded-md border border-transparent">
                                ...
                              </span>
                            ) : (
                              <button
                                key={page}
                                onClick={() => paginate(page)}
                                className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                              >
                                {page}
                              </button>
                            )
                          ))}
                          
                          <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 bg-gray-50 p-4 rounded-lg">No guests added yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scan Permissions Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Manage Scan Permissions</h2>
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loadingPermissions ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Current Scanners */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Scanners</h3>
                    {scanners.length > 0 ? (
                      <div className="space-y-3">
                        {scanners.map((scanner) => (
                          <div key={scanner.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-800">
                                {scanner.tenant?.firstName} {scanner.tenant?.lastName}
                              </p>
                              <p className="text-sm text-gray-600">{scanner.tenant?.email}</p>
                            </div>
                            <button
                              onClick={() => removeScanner(scanner.id)}
                              className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-md text-sm font-medium transition duration-300"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 bg-gray-50 p-4 rounded-lg">No scanners assigned yet.</p>
                    )}
                  </div>

                  {/* Add New Scanner */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Scanner</h3>
                    {availableTenants.length > 0 ? (
                      <div className="space-y-3">
                        {availableTenants.map((tenant) => (
                          <div key={tenant.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-800">
                                {tenant.firstName} {tenant.lastName}
                              </p>
                              <p className="text-sm text-gray-600">{tenant.email}</p>
                            </div>
                            <button
                              onClick={() => addScanner(tenant.id)}
                              className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-md text-sm font-medium transition duration-300"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 bg-gray-50 p-4 rounded-lg">No available tenants to add.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default EventDetails;