import React, { useState, useEffect } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import Layout from '../layout/Layout';
import axios from 'axios';
import defaultAvatar from '../../assets/user.png';
import { usePermissions } from '../../context/PermissionContext';
import { hasPermission } from '../../utils/Permission';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserManagement = () => {
  const navigate=useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Dealing with permissions
  const { permissions } = usePermissions();
  const canDelete = hasPermission(permissions, 'user_delete');
  const canEdit = hasPermission(permissions, 'user_edit');
  const canSetPermissions = hasPermission(permissions, 'user_set_permissions');
  const canAddUser = hasPermission(permissions, 'user_add');

  const [hasAccess, setHasAccess] = useState(null); // <-- NEW

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get('http://localhost:5000/api/myusers', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        //console.log('Fetched users:', response.data);
        setUsers(response.data.users);
        setHasAccess(true);
      } catch (error) {
        if(error.response && error.response.status === 403) {
          setHasAccess(false);}
        
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  // 🔒 Handle redirect cleanly before rendering page content
  useEffect(() => {
    if (hasAccess === false) {
      navigate("/403", { replace: true });
    }
  }, [hasAccess, navigate]);

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        const response = await axios.delete(`http://localhost:5000/api/users/delete/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        toast.success(`User ${userName} deleted successfully`);
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete user. Please try again.';
        toast.error(errorMessage);
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const statusBadge = (status) => {
    const statusClasses = {
      active: 'text-green-800 bg-green-100',
      Pending: 'text-yellow-800 bg-yellow-100',
      Suspended: 'text-red-800 bg-red-100'
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold leading-5 rounded-full ${statusClasses[status] || 'text-gray-800 bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  if (loading || hasAccess===null) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users data...</p>
          </div>
        </div>
      </Layout>
    );
  }

   if (!hasAccess) {
    return null; // Nothing renders before navigation
  }

  return (
   <Layout>
  <ToastContainer
    position="top-right"
    autoClose={5000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
  />
  
  <div className="container mx-auto px-3 py-4 max-w-6xl">
    {/* Header */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 text-sm mt-1">Manage all users in the system</p>
        </div>
        {canAddUser && (
          <Link
            to="/users/add"
            className="mt-3 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded flex items-center transition-colors duration-200 text-sm"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            Add New User
          </Link>
        )}
      </div>
    </div>

    {/* Stats Cards - Made more compact */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
      {/* ... your existing stats cards with reduced padding ... */}
    </div>

    {/* Users Table */}
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">All Users</h2>
        <div className="mt-2 sm:mt-0 relative">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full sm:w-56 px-3 py-2 bg-blue-100 rounded text-sm border-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <svg className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full user-table">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="py-3 px-4 text-gray-600 font-medium text-xs">User</th>
              <th className="py-3 px-4 text-gray-600 font-medium text-xs">Email</th>
              <th className="py-3 px-4 text-gray-600 font-medium text-xs">Phone</th>
              <th className="py-3 px-4 text-gray-600 font-medium text-xs">Status</th>
              {(canEdit || canDelete || canSetPermissions) && (
                <th className="py-3 px-4 text-gray-600 font-medium text-xs">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentUsers.length > 0 ? (
              currentUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex-shrink-0">
                        <img className="h-8 w-8 rounded-full" src={defaultAvatar} alt="User avatar" />
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900 text-sm">{user.firstName} {user.lastName}</div>
                        <div className="text-gray-500 text-xs">{user.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-900 text-sm">{user.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-900 text-sm">{user.phoneNumber}</div>
                  </td>
                  <td className="py-3 px-4">
                    {statusBadge(user.status)}
                  </td>
                  {(canEdit || canDelete || canSetPermissions) && (
                    <td className="py-3 px-4">
                      <div className="flex space-x-1">
                        {canEdit && (
                          <Link 
                            to={`/users/edit/${user.id}`}
                            className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                            title="Edit User"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              ></path>
                            </svg>
                          </Link>
                        )}
                        
                        {canSetPermissions && (
                          <Link
                            to={`/users/permissions/${user.id}`}
                            className="text-purple-600 hover:text-purple-900 p-1.5 rounded hover:bg-purple-50"
                            title="Manage Permissions"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              ></path>
                            </svg>
                          </Link>
                        )}
                        
                        {canDelete && (
                          <button 
                            className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50"
                            onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                            title="Delete User"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              ></path>
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={(canEdit || canDelete || canSetPermissions) ? 5 : 4} 
                  className="py-8 px-4 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <svg 
                      className="w-12 h-12 text-gray-400 mb-3" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="1.5" 
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <h3 className="text-base font-medium text-gray-900 mb-1">
                      {searchTerm ? 'No users found' : 'No users available'}
                    </h3>
                    <p className="text-gray-500 text-sm max-w-md">
                      {searchTerm 
                        ? `No users match your search for "${searchTerm}". Try adjusting your search terms.`
                        : 'There are no users in the system yet. Get started by adding your first user.'
                      }
                    </p>
                    {canAddUser && !searchTerm && (
                      <Link
                        to="/users/add"
                        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded flex items-center transition-colors duration-200 text-sm"
                      >
                        <svg
                          className="w-4 h-4 mr-1.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          ></path>
                        </svg>
                        Add First User
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {filteredUsers.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="text-xs text-gray-600 mb-3 sm:mb-0">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(indexOfLastItem, filteredUsers.length)}
            </span> of{' '}
            <span className="font-medium">{filteredUsers.length}</span> results
            {searchTerm && (
              <span className="ml-1 text-blue-600">
                (filtered from {users.length} total users)
              </span>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="flex space-x-1">
              <button 
                className={`px-3 py-1.5 text-xs font-medium rounded ${
                  currentPage === 1 
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={prevPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  className={`px-3 py-1.5 text-xs font-medium rounded ${
                    currentPage === page
                      ? 'text-white bg-blue-600'
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => paginate(page)}
                >
                  {page}
                </button>
              ))}
              
              <button 
                className={`px-3 py-1.5 text-xs font-medium rounded ${
                  currentPage === totalPages 
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={nextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
</Layout>
  );
};

export default UserManagement;