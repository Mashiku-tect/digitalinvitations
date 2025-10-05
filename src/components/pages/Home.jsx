import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../layout/Layout';

const Dashboard = () => {
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
    cancellationRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch dashboard statistics
        const statsResponse = await axios.get('http://localhost:5000/api/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
       

        

          if (statsResponse.data.success) {

          setStats(statsResponse.data);
         
        } 

        // Fetch recent activity
        const activityResponse = await axios.get('http://localhost:5000/api/dashboard/recent-activity', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        

        if (activityResponse.data.success) {
          setRecentActivity(activityResponse.data.data);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusFromFlags = (activity) => {
  if (activity.cancelled) return 'Cancelled';
  if (activity.completed) return 'Completed';
  if (activity.active) return 'Upcoming';
  return 'Inactive';
};

  // Get status badge style
  const getStatusBadge = (status) => {
  switch (status.toLowerCase()) {
    case 'upcoming':
      return 'px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full';
    case 'completed':
      return 'px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full';
    case 'cancelled':
      return 'px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full';
    case 'inactive':
    default:
      return 'px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full';
  }
};


  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Event Dashboard</h1>
            <p className="text-gray-600 mt-2">Overview of your digital invitation events</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {/* Total Events Card */}
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Total Events</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalEvents}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">All events created</p>
            </div>

            {/* Active Events Card */}
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Active Events</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.activeEvents}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">Waiting for completion</p>
            </div>

            {/* Completion Rate Card */}
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Completion Rate</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.completionRate}%</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">Events successfully completed</p>
            </div>

            {/* Cancellation Rate Card */}
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium">Cancellation Rate</h3>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stats.cancellationRate}%</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">Events cancelled by users</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Card */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-xl font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pending Payments</p>
                      <p className="text-xl font-bold text-gray-800">{formatCurrency(stats.pendingPayments)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 bg-gray-100 h-4 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 h-full rounded-full" 
                  style={{ 
                    width: `${stats.totalRevenue + stats.pendingPayments > 0 
                      ? (stats.totalRevenue / (stats.totalRevenue + stats.pendingPayments)) * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>Collected</span>
                <span>Pending</span>
              </div>
            </div>

            {/* Completed Events Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Completed Events</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-bold text-gray-800">{stats.completedEvents.week}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-bold text-gray-800">{stats.completedEvents.month}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Year</span>
                  <span className="font-bold text-gray-800">{stats.completedEvents.year}</span>
                </div>
              </div>
              <div className="mt-6 bg-gray-200 h-3 rounded-full overflow-hidden">
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
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>Week</span>
                <span>Month</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
            {recentActivity.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="pb-2">Event</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentActivity.map((activity) => {
  const status = getStatusFromFlags(activity);

  return (
    <tr key={activity.id}>
      <td className="py-3">{activity.eventName}</td>
      <td className="py-3">{formatDate(activity.eventDate)}</td>
      <td className="py-3">
        <span className={getStatusBadge(status)}>
          {status}
        </span>
      </td>
      <td className="py-3">{formatCurrency(activity.revenue)}</td>
    </tr>
  );
})}

                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2">No recent activity found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;