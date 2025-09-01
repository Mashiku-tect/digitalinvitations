import React, { useState } from 'react';
import Layout from '../layout/Layout';

// Mock data for events and reports
const mockEvents = [
  {
    id: 1,
    title: "Tech Conference 2023",
    date: "2023-11-15",
    location: "San Francisco Convention Center",
    attendees: 450,
    checkedIn: 420,
    revenue: 125000,
    satisfaction: 4.7,
    checkIns: [
      { time: "09:00", count: 45 },
      { time: "10:00", count: 120 },
      { time: "11:00", count: 85 },
      { time: "12:00", count: 65 },
      { time: "13:00", count: 40 },
      { time: "14:00", count: 35 },
      { time: "15:00", count: 30 },
    ]
  },
  {
    id: 2,
    title: "Product Launch Event",
    date: "2023-10-20",
    location: "New York City Hall",
    attendees: 200,
    checkedIn: 180,
    revenue: 75000,
    satisfaction: 4.5,
    checkIns: [
      { time: "18:00", count: 80 },
      { time: "18:30", count: 60 },
      { time: "19:00", count: 30 },
      { time: "19:30", count: 10 },
    ]
  },
  {
    id: 3,
    title: "Annual Charity Gala",
    date: "2023-12-05",
    location: "Los Angeles Grand Hotel",
    attendees: 300,
    checkedIn: 285,
    revenue: 0,
    donations: 150000,
    satisfaction: 4.8,
    checkIns: [
      { time: "19:00", count: 120 },
      { time: "19:30", count: 100 },
      { time: "20:00", count: 50 },
      { time: "20:30", count: 15 },
    ]
  },
  {
    id: 4,
    title: "Developer Workshop",
    date: "2023-09-10",
    location: "Chicago Tech Hub",
    attendees: 120,
    checkedIn: 115,
    revenue: 25000,
    satisfaction: 4.6,
    checkIns: [
      { time: "10:00", count: 60 },
      { time: "11:00", count: 35 },
      { time: "12:00", count: 15 },
      { time: "13:00", count: 5 },
    ]
  }
];

const EventReports = () => {
  const [selectedEvent, setSelectedEvent] = useState(mockEvents[0]);
  const [timeRange, setTimeRange] = useState('week');

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateCheckInRate = (event) => {
    return Math.round((event.checkedIn / event.attendees) * 100);
  };

  const BarChart = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map(item => item.count));
    
    return (
      <div className="flex items-end justify-between h-64 pt-4 pb-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 mx-1">
            <div 
              className="w-full bg-blue-500 rounded-t-lg hover:bg-blue-600 transition-all duration-300"
              style={{ height: `${(item.count / maxValue) * height}px` }}
            ></div>
            <span className="text-xs text-gray-500 mt-2">{item.time}</span>
          </div>
        ))}
      </div>
    );
  };

  const SatisfactionMeter = ({ rating }) => {
    const percentage = (rating / 5) * 100;
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div 
          className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  };

  return (
    <Layout>
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Event Reports & Analytics</h1>
          <p className="mt-3 text-xl text-gray-600">Detailed insights and metrics for your events</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar with event selection */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Select Event</h2>
              <div className="space-y-3">
                {mockEvents.map(event => (
                  <div 
                    key={event.id}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedEvent.id === event.id 
                        ? 'bg-blue-100 border-l-4 border-blue-500' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Time Range</h2>
                <div className="flex space-x-2">
                  {['day', 'week', 'month', 'year'].map(range => (
                    <button
                      key={range}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        timeRange === range
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      onClick={() => setTimeRange(range)}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Main content with reports */}
          <div className="w-full lg:w-3/4">
            {/* Event summary */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
                <p className="mt-1 text-lg text-gray-600">
                  {formatDate(selectedEvent.date)} • {selectedEvent.location}
                </p>
              </div>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Attendees</p>
                    <p className="text-2xl font-semibold text-gray-900">{selectedEvent.attendees}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Checked In</p>
                    <p className="text-2xl font-semibold text-gray-900">{selectedEvent.checkedIn}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Check-in Rate</span>
                    <span className="text-sm font-medium text-green-600">{calculateCheckInRate(selectedEvent)}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${calculateCheckInRate(selectedEvent)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-purple-100">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      {selectedEvent.revenue > 0 ? 'Revenue' : 'Donations'}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      ${selectedEvent.revenue > 0 ? selectedEvent.revenue.toLocaleString() : selectedEvent.donations.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-yellow-100">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Satisfaction</p>
                    <p className="text-2xl font-semibold text-gray-900">{selectedEvent.satisfaction}/5</p>
                  </div>
                </div>
                <div className="mt-4">
                  <SatisfactionMeter rating={selectedEvent.satisfaction} />
                </div>
              </div>
            </div>

            {/* Charts and detailed metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Check-in timeline */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Check-ins Over Time</h3>
                <BarChart data={selectedEvent.checkIns} height={180} />
              </div>

              {/* Demographic data */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Attendee Demographics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Age Groups</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>18-24</span>
                          <span>25%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>25-34</span>
                          <span>40%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>35-44</span>
                          <span>20%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>45+</span>
                          <span>15%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Gender</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Male</span>
                          <span>55%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '55%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Female</span>
                          <span>42%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Other</span>
                          <span>3%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: '3%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback section */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Attendee Feedback</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <p className="text-gray-800">"This was one of the best conferences I've attended this year. The speakers were knowledgeable and the organization was impeccable."</p>
                  <p className="text-sm text-gray-500 mt-1">- Sarah Johnson, Software Engineer</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <p className="text-gray-800">"The workshop provided practical knowledge that I could immediately apply to my projects. Would definitely recommend to colleagues."</p>
                  <p className="text-sm text-gray-500 mt-1">- Michael Chen, Product Manager</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <p className="text-gray-800">"Great networking opportunities and well-organized sessions. Looking forward to the next edition!"</p>
                  <p className="text-sm text-gray-500 mt-1">- Jessica Williams, UX Designer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default EventReports;