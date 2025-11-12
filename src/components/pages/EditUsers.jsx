import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../layout/Layout';
import { ToastContainer, toast } from 'react-toastify';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'tenant',
    status: 'Active',
    avatar: ''
  });

   const [hasAccess, setHasAccess] = useState(null); // <-- NEW

 useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/users/${id}`,{
          headers:{
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUser(response.data);
        setHasAccess(true);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          setHasAccess(false);
          //alert('You do not have permission to edit this user.');
        }
        console.error('Error fetching user:', error);
        //alert('User not found or error fetching data.');
        //navigate('/users');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!user.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!user.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!user.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!user.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit =async (e) => {
    e.preventDefault();
    
   if(!validateForm)return;
   setSaving(true);
   try {
    const response=await axios.put(
      `http://localhost:5000/api/users/update/${id}`,
      user,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      }
    );
   toast.success(response.data.message);
    //alert(response.data.message);
    //console.log("user Object",response.data.user.firstName)
    //alert(response.data.message);
   setTimeout(() => navigate('/users'), 1500);
  } catch (error) {
    
    const errormessage=error.response.data.message;
    toast.error(errormessage);
  } finally {
    setSaving(false);
  }
  };

  useEffect(() => {
    if (hasAccess === false) {
      navigate("/403", { replace: true });
    }
  }, [hasAccess, navigate]);

  const handleCancel = () => {
    navigate('/users');
  };

   if (loading || hasAccess === null) {
     return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user data...</p>
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
  <div className="container mx-auto px-3 py-4 max-w-4xl">
     <ToastContainer position="top-right" autoClose={3000} />
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-800">User Information</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={user.firstName}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-1 text-sm ${
                errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
              }`}
            />
            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
          </div>
          
          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={user.lastName}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-1 text-sm ${
                errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
              }`}
            />
            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
          </div>
          
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-1 text-sm ${
                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
              }`}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
          
          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phoneNumber"
              value={user.phoneNumber}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded border focus:outline-none focus:ring-1 text-sm ${
                errors.phoneNumber ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
              }`}
            />
            {errors.phoneNumber && <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>}
          </div>
          
          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={user.role}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="boss">Boss</option>
              <option value="tenant">Tenant</option>
            </select>
          </div>
          
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={user.status}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition duration-300 order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition duration-300 disabled:bg-blue-400 flex items-center justify-center order-1 sm:order-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
</Layout>
  );
};

export default UserEdit;