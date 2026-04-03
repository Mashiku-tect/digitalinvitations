import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../layout/Layout';
import { useNavigate } from 'react-router-dom';
import api from "../../utils/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    completedEvents: {
      week: 0,
      month: 0,
      year: 0
    },
    completionRate: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    cancellationRate: 0,
    notDealtEvents: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [hasAccess, setHasAccess] = useState(null);

  const isDatePast = (dateString) => {
    const eventDate = new Date(dateString);
    const currentDate = new Date();
    eventDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    return eventDate < currentDate;
  };

  const isDateFuture = (dateString) => {
    const eventDate = new Date(dateString);
    const currentDate = new Date();
    eventDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    return eventDate > currentDate;
  };

  const isDateToday = (dateString) => {
    const eventDate = new Date(dateString);
    const currentDate = new Date();
    eventDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    return eventDate.getTime() === currentDate.getTime();
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch dashboard statistics
      const statsResponse = await api.get('/api/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if(statsResponse.data.message==='Invalid token'){
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (statsResponse.data.success) {
        setStats(statsResponse.data);
      } 

      // Fetch recent activity
      const activityResponse = await api.get('/api/dashboard/recent-activity', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (activityResponse.data.success) {
        const activities = activityResponse.data.data;
        setRecentActivity(activities);

        // Calculate not dealt events count from recent activity
        const notDealtCount = activities.filter(activity => 
          activity.active && 
          !activity.completed && 
          !activity.cancelled && 
          isDatePast(activity.eventDate)
        ).length;

        // Calculate proper active events count (upcoming events)
        const properActiveCount = activities.filter(activity => 
          activity.active && 
          !activity.completed && 
          !activity.cancelled && 
          (isDateFuture(activity.eventDate) || isDateToday(activity.eventDate))
        ).length;

        // Update stats with calculated counts
        setStats(prevStats => ({
          ...prevStats,
          notDealtEvents: notDealtCount,
          activeEvents: properActiveCount // Override with proper count
        }));
      }
      setHasAccess(true);

    } catch (err) {
      if(err.response?.data?.canAccess === false){
        setHasAccess(false);
        return;
      }
      
      // Set error message but continue to render UI
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Some data may not be available.');
      } else if (!err.response) {
        setError('Unable to connect to server. Displaying cached or default data.');
      } else if (err.response?.status >= 500) {
        setError('Server error. Some features may be limited.');
      } else {
        setError('Failed to load dashboard data. Some information may be outdated.');
      }
      
      // Log error for debugging
      //console.error('Dashboard fetch error:', err);
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Dashboard - eCards";
    fetchDashboardData();
  }, [navigate]);

  useEffect(() => {
    if (hasAccess === false) {
      navigate("/403", { replace: true });
    }
  }, [hasAccess, navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusFromFlags = (activity) => {
    if (activity.active && !activity.completed && !activity.cancelled && isDatePast(activity.eventDate)) {
      return 'Not Dealt';
    }
    if (activity.active && !activity.completed && !activity.cancelled && 
        (isDateFuture(activity.eventDate) || isDateToday(activity.eventDate))) {
      return 'Upcoming';
    }
    if (activity.cancelled) return 'Cancelled';
    if (activity.completed) return 'Completed';
    if (activity.active) return 'Upcoming';
    return 'Inactive';
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
        return 'px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full';
      case 'completed':
        return 'px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full';
      case 'cancelled':
        return 'px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full';
      case 'not dealt':
        return 'px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full';
      case 'inactive':
      default:
        return 'px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS'
    }).format(amount);
  };

  if (loading || hasAccess === null) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-3 md:p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Event Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Overview of your digital invitation events</p>
          </div>

          {error && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="text-yellow-700 text-sm font-medium">Notice</span>
                    <p className="text-yellow-600 text-sm">{error}</p>
                  </div>
                </div>
                <button
                  onClick={fetchDashboardData}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium ml-2"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-xs font-medium">Total Events</h3>
                  <p className="text-xl font-bold text-gray-800 mt-1">{stats.totalEvents}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">All events created</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-xs font-medium">Upcoming Events</h3>
                  <p className="text-xl font-bold text-gray-800 mt-1">{stats.activeEvents}</p>
                </div>
                <div className="bg-yellow-100 p-2 rounded">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Scheduled for future/today</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-xs font-medium">Not Dealt</h3>
                  <p className="text-xl font-bold text-gray-800 mt-1">{stats.notDealtEvents}</p>
                </div>
                <div className="bg-orange-100 p-2 rounded">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Past due, not completed</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-xs font-medium">Completion Rate</h3>
                  <p className="text-xl font-bold text-gray-800 mt-1">{stats.completionRate}%</p>
                </div>
                <div className="bg-green-100 p-2 rounded">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Events successfully completed</p>
            </div>

            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-xs font-medium">Cancellation Rate</h3>
                  <p className="text-xl font-bold text-gray-800 mt-1">{stats.cancellationRate}%</p>
                </div>
                <div className="bg-red-100 p-2 rounded">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Events cancelled by users</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Revenue Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-1.5 rounded mr-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Revenue</p>
                      <p className="text-lg font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-3 rounded">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-1.5 rounded mr-2">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Pending Payments</p>
                      <p className="text-lg font-bold text-gray-800">{formatCurrency(stats.pendingPayments)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-gray-100 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 h-full rounded-full" 
                  style={{ 
                    width: `${stats.totalRevenue + stats.pendingPayments > 0 
                      ? (stats.totalRevenue / (stats.totalRevenue + stats.pendingPayments)) * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-600">
                <span>Collected</span>
                <span>Pending</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-base font-semibold text-gray-800 mb-3">Completed Events</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">This Week</span>
                  <span className="font-bold text-gray-800 text-sm">{stats.completedEvents.week}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">This Month</span>
                  <span className="font-bold text-gray-800 text-sm">{stats.completedEvents.month}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">This Year</span>
                  <span className="font-bold text-gray-800 text-sm">{stats.completedEvents.year}</span>
                </div>
              </div>
              <div className="mt-4 bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="flex h-full">
                  <div 
                    className="bg-blue-500" 
                    style={{ 
                      width: `${stats.completedEvents.month > 0 
                        ? (stats.completedEvents.week / stats.completedEvents.month) * 100 
                        : 0}%` 
                    }}
                  ></div>
                  <div 
                    className="bg-green-500" 
                    style={{ 
                      width: `${stats.completedEvents.month > 0 
                        ? ((stats.completedEvents.month - stats.completedEvents.week) / stats.completedEvents.month) * 100 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-600">
                <span>Week</span>
                <span>Month</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Recent Activity</h3>
            {recentActivity.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="text-left text-gray-600 border-b border-gray-200">
                      <th className="pb-2 text-xs font-medium uppercase tracking-wide">Event</th>
                      <th className="pb-2 text-xs font-medium uppercase tracking-wide">Date</th>
                      <th className="pb-2 text-xs font-medium uppercase tracking-wide">Status</th>
                      <th className="pb-2 text-xs font-medium uppercase tracking-wide">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentActivity.map((activity) => {
                      const status = getStatusFromFlags(activity);
                      return (
                        <tr key={activity.id} className="hover:bg-gray-50">
                          <td className="py-2 text-sm">{activity.eventName}</td>
                          <td className="py-2 text-sm">{formatDate(activity.eventDate)}</td>
                          <td className="py-2">
                            <span className={getStatusBadge(status)}>
                              {status}
                            </span>
                          </td>
                          <td className="py-2 text-sm font-medium">{formatCurrency(activity.revenue)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-sm">No recent activity found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;