import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../layout/Card';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from "../../utils/api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Register - eCards Event Management System";
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    
    // Apply input restrictions for firstname and lastname
    if (name === 'firstname' || name === 'lastname') {
      // Only allow letters and spaces
      const lettersAndSpacesOnly = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData({ ...formData, [name]: lettersAndSpacesOnly });
    } 
    // Apply input restrictions for phone
    else if (name === 'phone') {
      // Only allow numbers
      const numbersOnly = value.replace(/\D/g, '');
      setFormData({ ...formData, [name]: numbersOnly });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // First Name validation
    if (!formData.firstname.trim()) {
      newErrors.firstname = 'First name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.firstname)) {
      newErrors.firstname = 'First name can only contain letters and spaces';
    } else if (formData.firstname.trim().length < 2) {
      newErrors.firstname = 'First name must be at least 2 characters';
    } else if (formData.firstname.trim().length > 50) {
      newErrors.firstname = 'First name cannot exceed 50 characters';
    }
    
    // Last Name validation
    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Last name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.lastname)) {
      newErrors.lastname = 'Last name can only contain letters and spaces';
    } else if (formData.lastname.trim().length < 2) {
      newErrors.lastname = 'Last name must be at least 2 characters';
    } else if (formData.lastname.trim().length > 50) {
      newErrors.lastname = 'Last name cannot exceed 50 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      // Check if it starts with 06 or 07 and has exactly 10 digits
      const phoneRegex = /^(06|07)\d{8}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Phone number must be in format: 06XXXXXXXX or 07XXXXXXXX (10 digits total)';
      }
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (formData.password.length > 100) {
      newErrors.password = 'Password cannot exceed 100 characters';
    }
    
    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // First validate the form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const token = localStorage.getItem('token');

    try {
      const res = await api.post('/api/register', {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Registration successful! Redirecting to login...');

      // Clear form after successful registration
      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });

      // You can add navigation logic here if needed
      // setTimeout(() => {
      //   navigate('/login');
      // }, 2000);

    } catch (err) {
     // console.error(err.response?.data || err.message);
      const errorMessage = err.response?.data?.message || 'Registration failed';
      toast.error(errorMessage);
      
      // Set API error if needed
      setErrors({ ...errors, api: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-4 sm:py-8 px-4 relative">
      <ToastContainer />
      
      {/* Spinner Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-700">Registering your account...</p>
          </div>
        </div>
      )}
      
      <Card className="w-full max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Create New Account</h2>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Start creating beautiful invitations today</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={formData.firstname}
                onChange={onChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.firstname ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="First name"
                maxLength="50"
              />
              {errors.firstname && (
                <p className="mt-1 text-xs text-red-600">{errors.firstname}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Letters and spaces only</p>
            </div>
            <div>
              <label htmlFor="lastname" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={formData.lastname}
                onChange={onChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.lastname ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Last name"
                maxLength="50"
              />
              {errors.lastname && (
                <p className="mt-1 text-xs text-red-600">{errors.lastname}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Letters and spaces only</p>
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="06XXXXXXXX or 07XXXXXXXX"
              maxLength="10"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Format: 06XXXXXXXX or 07XXXXXXXX (10 digits)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={onChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Password"
                maxLength="100"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">At least 8 characters</p>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={onChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Confirm password"
                maxLength="100"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {errors.api && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{errors.api}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-purple-700'
            } text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2`}
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-gray-600 text-sm">
            <Link
              to="/dashboard"
              className="text-purple-600 hover:text-purple-800 font-semibold transition-colors duration-200"
            >
              Back To Dashboard
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;