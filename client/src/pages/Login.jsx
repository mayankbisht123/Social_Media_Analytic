import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dashContext from '../context/dashContext';

export default function AuthForm() {
  const { Login, Signup } = useContext(dashContext);
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: ''
  });

  const [signupInfo, setSignupInfo] = useState({
    name: '',
    email: '',
    password: '',
    cpassword: ''
  });

  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const response = await Login(loginInfo);
      if (response.success) {
        navigate('/?status=success');
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    if (signupInfo.password !== signupInfo.cpassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      const response = await Signup(signupInfo);
      if (response.success) {
        setTab(0);
        setSuccessMessage('Account created successfully. Please sign in.');
      } else {
        setError(response.message || 'Signup failed');
      }
    } catch (error) {
      setError('An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-slate-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-blue-600 bg-clip-text text-transparent">
            Welcome to Analytics Dashboard
          </h2>
          <p className="mt-2 text-gray-600">
            Sign in to your account or create a new one
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => {
              setTab(0);
              setError('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              tab === 0
                ? 'bg-white text-slate-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab(1);
              setError('');
              setSuccessMessage('');
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              tab === 1
                ? 'bg-white text-slate-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Login Form */}
        {tab === 0 && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={loginInfo.email}
                    onChange={(e) => setLoginInfo({ ...loginInfo, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={loginInfo.password}
                    onChange={(e) => setLoginInfo({ ...loginInfo, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="text-sm text-slate-600 hover:text-slate-700">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-slate-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-slate-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Signup Form */}
        {tab === 1 && (
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    required
                    value={signupInfo.name}
                    onChange={(e) => setSignupInfo({ ...signupInfo, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    value={signupInfo.email}
                    onChange={(e) => setSignupInfo({ ...signupInfo, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    required
                    value={signupInfo.password}
                    onChange={(e) => setSignupInfo({ ...signupInfo, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                    placeholder="Create a password"
                  />
                </div>

                <div>
                  <label htmlFor="signup-cpassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="signup-cpassword"
                    type="password"
                    required
                    value={signupInfo.cpassword}
                    onChange={(e) => setSignupInfo({ ...signupInfo, cpassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm your password"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="agree-terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-gray-300 rounded"
                  />
                  <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-slate-600 hover:text-slate-700">
                      Terms and Conditions
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-teal-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:from-teal-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>
            By signing in, you agree to our{' '}
            <a href="#" className="text-slate-600 hover:text-slate-700">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="#" className="text-slate-600 hover:text-slate-700">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}