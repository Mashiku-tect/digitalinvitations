import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../layout/Card';
import { ToastContainer, toast } from 'react-toastify';
import { usePermissions } from '../../context/PermissionContext';
import 'react-toastify/dist/ReactToastify.css';
import { hasAnyPermission } from '../../utils/Permission';
import { getFirstAllowedRoute } from "../../utils/PermissionRouteCheckHelper";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { permissions, refreshPermissions } = usePermissions();

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
      const res = await axios.post('http://localhost:5000/api/login', formData);

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

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={onChange}
            className="w-full px-4 py-3 border rounded-lg"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 rounded-lg`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/register" className="text-blue-600 hover:text-blue-800">Register</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
