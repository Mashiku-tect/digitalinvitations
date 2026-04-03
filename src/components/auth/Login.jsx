import { useState,useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../layout/Card';
import { ToastContainer, toast } from 'react-toastify';
import { usePermissions } from '../../context/PermissionContext';
import 'react-toastify/dist/ReactToastify.css';
import { hasAnyPermission } from '../../utils/Permission';
import { getFirstAllowedRoute } from "../../utils/PermissionRouteCheckHelper";
import api from "../../utils/api";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

 const { permissions, refreshPermissions } = usePermissions();

 useEffect(()=>{
    document.title="Login - eCards Event Management System";
 })

  const requiredList = [
    "dashboard_view",
    "user_view",
    "user_add",
    "event_view",
    "event_add",
    "scanninglogs_view",
    "invitation_generate",
    "invitation_send"
  ];

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/login', formData);

      // Save JWT token
      localStorage.setItem('token', res.data.token);
      toast.success('Login successful! Redirecting...');

      // ✅ Wait for permissions to be fetched
      const latestPermissions = await refreshPermissions();
      const route = getFirstAllowedRoute(latestPermissions);

      // if (hasAnyPermission(latestPermissions, requiredList)) {
      //   navigate("/dashboard"); // user has access
      // } else {
      //   navigate("/xx"); // user has no access
      // }
      
if (route) {
  navigate(route); // user has at least one valid route
} else {
  navigate("/xx"); // user has no valid permissions
}

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center  py-8 px-4 relative">
      <ToastContainer position="top-right" autoClose={3000} />

      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-700">Logging in...</p>
          </div>
        </div>
      )}

      <Card>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back!</h2>
          <p className="text-gray-600 mt-2">Please log in to manage your Events</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={onChange}
            className="w-full px-4 py-3 border rounded-lg"
            required
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={onChange}
              className="w-full px-4 py-3 pr-12 border rounded-lg"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-4 flex items-center text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 rounded-lg`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/forgot-password" className="text-blue-600 hover:text-blue-800">Forgot Password ?</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
