import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layout/Layout';
import axios from 'axios';
import defaultAvatar from '../../assets/user.png';


const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  

  useEffect(() => {
  const fetchUsers = async () => {
    try {
      const token=localStorage.getItem("token");
      //console.log("token is",token);
      const response = await axios.get('http://localhost:5000/api/users',{
        headers :{
Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchUsers();
}, []);

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try{
        //const token=localStorage.getItem('token');
        const response=await axios.delete(`http://localhost:5000/api/users/delete/${userId}`,{
          headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
        });
        alert(response.data.message);
setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      }
      catch(error){
         console.error('Error deleting user:', error);

      const errorMessage = error.response?.data?.message || 'Failed to delete user. Please try again.';
      alert(errorMessage);

      }
    }
  };

  // const handleEdit = (userId) => {
  //   const user = users.find(user => user.id === userId);
  //   alert(`Edit functionality for ${user.firstName} ${user.lastName} would open here.`);
  // };

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusBadge = (status) => {
    const statusClasses = {
      active: 'text-green-800 bg-green-100',
      Pending: 'text-yellow-800 bg-yellow-100',
      Suspended: 'text-red-800 bg-red-100'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold leading-5 rounded-full ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout>
       <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all users in the system</p>
        </div>
        <Link
  to="/users/add" // <-- your route here
  className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center"
>
  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
  </svg>
  Add New User
</Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-800">{users.length}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Active Users</p>
              <h3 className="text-2xl font-bold text-gray-800">{users.filter(user => user.status === 'active').length}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending Users</p>
              <h3 className="text-2xl font-bold text-gray-800">{users.filter(user => user.status === 'Pending').length}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="rounded-full bg-red-100 p-3 mr-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Suspended</p>
              <h3 className="text-2xl font-bold text-gray-800">{users.filter(user => user.status === 'Suspended').length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">All Users</h2>
          <div className="mt-3 md:mt-0 relative">
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full md:w-64 px-4 py-2.5 bg-gray-100 rounded-lg text-sm border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-4 h-4 absolute right-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full user-table">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="py-4 px-6 text-gray-600 font-medium text-sm">User</th>
                <th className="py-4 px-6 text-gray-600 font-medium text-sm">Email</th>
                <th className="py-4 px-6 text-gray-600 font-medium text-sm">Phone</th>
                <th className="py-4 px-6 text-gray-600 font-medium text-sm">Status</th>
                <th className="py-4 px-6 text-gray-600 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="h-11 w-11 flex-shrink-0">
                        <img className="h-11 w-11 rounded-full" src={defaultAvatar} alt="User avatar" />
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                        <div className="text-gray-500">{user.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-gray-900">{user.email}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-gray-900">{user.phoneNumber}</div>
                  </td>
                  <td className="py-4 px-6">
                    {statusBadge(user.status)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <Link to={`/users/edit/${user.id}`}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                     
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                      </Link>
                      <button 
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                        onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between">
          <div className="text-sm text-gray-600 mb-4 md:mb-0">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{filteredUsers.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              Previous
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg">
              1
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default UserManagement;