import React, { useState } from 'react';
import Layout from '../layout/Layout';

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "Administrator",
    status: "Active",
    lastActive: "2023-11-15T14:30:00",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    department: "Engineering",
    location: "San Francisco, CA"
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@example.com",
    role: "Developer",
    status: "Active",
    lastActive: "2023-11-15T12:45:00",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    department: "Product Development",
    location: "New York, NY"
  },
  {
    id: 3,
    name: "Jessica Williams",
    email: "jessica.williams@example.com",
    role: "Designer",
    status: "Away",
    lastActive: "2023-11-14T16:20:00",
    avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    department: "Design",
    location: "Austin, TX"
  },
  {
    id: 4,
    name: "David Kim",
    email: "david.kim@example.com",
    role: "Marketing",
    status: "Active",
    lastActive: "2023-11-15T10:15:00",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    department: "Marketing",
    location: "Chicago, IL"
  },
  {
    id: 5,
    name: "Emily Rodriguez",
    email: "emily.rodriguez@example.com",
    role: "Support",
    status: "Active",
    lastActive: "2023-11-15T09:30:00",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    department: "Customer Success",
    location: "Miami, FL"
  },
  {
    id: 6,
    name: "James Wilson",
    email: "james.wilson@example.com",
    role: "Developer",
    status: "Offline",
    lastActive: "2023-11-13T17:45:00",
    avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    department: "Engineering",
    location: "Seattle, WA"
  },
  {
    id: 7,
    name: "Sophia Miller",
    email: "sophia.miller@example.com",
    role: "Manager",
    status: "Active",
    lastActive: "2023-11-15T13:20:00",
    avatar: "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    department: "Operations",
    location: "Boston, MA"
  },
  {
    id: 8,
    name: "Daniel Brown",
    email: "daniel.brown@example.com",
    role: "Analyst",
    status: "Away",
    lastActive: "2023-11-14T15:10:00",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    department: "Business Intelligence",
    location: "Denver, CO"
  }
];

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      
      return matchesSearch && matchesStatus && matchesRole;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'lastActive') {
        return new Date(b.lastActive) - new Date(a.lastActive);
      }
      return 0;
    });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Away': return 'bg-yellow-100 text-yellow-800';
      case 'Offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Administrator': return 'bg-purple-100 text-purple-800';
      case 'Developer': return 'bg-blue-100 text-blue-800';
      case 'Designer': return 'bg-pink-100 text-pink-800';
      case 'Manager': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-lg text-gray-600">Manage all users in your organization</p>
        </header>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Away">Away</option>
                <option value="Offline">Offline</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">All Roles</option>
                <option value="Administrator">Administrator</option>
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
                <option value="Marketing">Marketing</option>
                <option value="Support">Support</option>
                <option value="Manager">Manager</option>
                <option value="Analyst">Analyst</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="lastActive">Sort by Last Active</option>
              </select>

              <div className="flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{users.length}</span> users
          </p>
        </div>

        {/* Users grid/list */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredUsers.map(user => (
              <div key={user.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <img className="h-16 w-16 rounded-full" src={user.avatar} alt={user.name} />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Department:</span> {user.department}
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">Location:</span> {user.location}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      <span className="font-medium">Last active:</span> {formatDate(user.lastActive)}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4">
                  <div className="flex space-x-3">
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Message
                    </button>
                    <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <ul className="divide-y divide-gray-200">
              {filteredUsers.map(user => (
                <li key={user.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <img className="h-12 w-12 rounded-full" src={user.avatar} alt={user.name} />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                            <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="mt-1">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                            <span className="ml-2 text-sm text-gray-500">{user.department}</span>
                            <span className="ml-2 text-sm text-gray-500">• {user.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-sm text-gray-500">Last active: {formatDate(user.lastActive)}</p>
                        <div className="mt-2 flex space-x-2">
                          <button className="inline-flex items-center p-1 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty state */}
        {filteredUsers.length === 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
            <div className="mt-6">
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setRoleFilter('all');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
};

export default UserManagement;