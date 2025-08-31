import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../layout/Card';

const Login = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  // Handle input changes
  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const onSubmit = (e) => {
    e.preventDefault();
    console.log('Login Attempt:', formData);

    // Add actual auth logic here

    // Redirect to dashboard after "login"
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <Card>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back!</h2>
          <p className="text-gray-600 mt-2">Please log in to manage your invitations</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              minLength="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Login
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
            >
              Register here
            </Link>
          </p>
        </div>

        <div className="text-center mt-4">
          <Link 
            to="/forgot-password" 
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            Forgot your password?
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
