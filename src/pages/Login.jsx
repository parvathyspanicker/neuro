import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroImg from '../assets/brain-ai.png';
import { useAuth } from "../contexts/AuthContext";
import {
  FaHome, FaInfoCircle, FaStar, FaGlobe, FaEnvelope,
  FaSignInAlt, FaUserPlus, FaEye, FaEyeSlash, FaExclamationTriangle, FaCheckCircle
} from 'react-icons/fa';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters long';
    return '';
  };

  const validateForm = () => {
    const errors = {};
    errors.email = validateEmail(formData.email);
    errors.password = validatePassword(formData.password);
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // Validate form
    const errors = validateForm();
    setValidationErrors(errors);
    
    // Check if there are any validation errors
    if (Object.values(errors).some(error => error !== '')) {
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Starting login process...');
      console.log('Email:', formData.email);
      
      const { data, error } = await signIn(formData.email, formData.password);
      
      console.log('Login attempt result:', { data, error });
      console.log('Data type:', typeof data);
      console.log('Data keys:', data ? Object.keys(data) : 'No data');
      
      if (error) {
        console.log('Login error:', error);
        setError(error.message);
      } else {
        console.log('Login response data:', data);
        console.log('User role:', data?.role);
        console.log('Role type:', typeof data?.role);
        console.log('Is patient?', data?.role === 'patient');
        console.log('String comparison:', data?.role === 'patient' ? 'TRUE' : 'FALSE');
 
        // Block unapproved doctors
        if (data && data.role === 'doctor' && data.approvalStatus !== 'approved') {
          setError('Your doctor account is pending admin approval. You will be able to login once approved.');
          return;
        }

        // Check user role and redirect accordingly
        if (data && data.role === 'admin') {
          console.log('✅ Admin detected, navigating to admin dashboard');
          navigate('/admin-dashboard');
        } else if (data && data.role === 'patient') {
          console.log('✅ Patient detected, navigating to dashboard');
          navigate('/dashboard');
        } else if (data && data.role === 'doctor') {
          console.log('✅ Doctor detected, navigating to doctor dashboard');
          navigate('/doctor-dashboard');
        } else {
          console.log('❌ Unknown role, navigating to home');
          console.log('User role was:', data?.role);
          console.log('Data object:', JSON.stringify(data, null, 2));
          // For unknown roles, redirect to home page
          navigate('/');
        }
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    
    try {
      console.log('Initiating Google sign-in...');
      const { data, error } = await signInWithGoogle();
      
      if (error) {
        console.log('Google sign-in error:', error);
        setError(error.message);
      } else {
        console.log('Google sign-in initiated successfully');
        // Google sign-in will redirect automatically to dashboard
        // The redirectTo option in AuthContext handles the navigation
      }
    } catch (err) {
      console.log('Google sign-in exception:', err);
      setError("An error occurred during Google sign-in");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar - Same as Home */}
      <header className="flex justify-between items-center px-12 py-4 w-full bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <img src={heroImg} alt="NeuroCare Logo" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-extrabold text-blue-700 tracking-wider">NeuroCare</span>
        </div>
        <nav className="flex items-center space-x-8 text-md font-medium text-gray-700">
          <Link to="/" className="hover:text-blue-600 transition flex items-center gap-2">
            <FaHome className="text-lg" />
            <span>Home</span>
          </Link>
          <Link to="/about" className="hover:text-blue-600 transition flex items-center gap-2">
            <FaInfoCircle className="text-lg" />
            <span>About</span>
          </Link>
          <a href="#feature" className="hover:text-blue-600 transition flex items-center gap-2">
            <FaStar className="text-lg" />
            <span>Features</span>
          </a>
          <a href="#how" className="hover:text-blue-600 transition flex items-center gap-2">
            <FaGlobe className="text-lg" />
            <span>How it Works</span>
          </a>
          <a href="#contact" className="hover:text-blue-600 transition flex items-center gap-2">
            <FaEnvelope className="text-lg" />
            <span>Contact</span>
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-blue-600 flex items-center gap-2">
            <FaSignInAlt className="text-lg" />
            <span>Login</span>
          </span>
          <Link to="/register" className="hover:text-blue-600 transition flex items-center gap-2">
            <FaUserPlus className="text-lg" />
            <span>Register</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen py-12 px-4">
        <div className="w-full max-w-md">
          {/* Professional Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Welcome to NeuroCare</h1>
            <p className="text-lg text-gray-600">Sign in to continue to your account</p>
          </div>

          {/* Modern Login Box */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-base font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-base bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all ${
                      validationErrors.email 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-200'
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                  {validationErrors.email && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FaExclamationTriangle className="text-red-500" />
                    </div>
                  )}
                  {!validationErrors.email && formData.email && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FaCheckCircle className="text-green-500" />
                    </div>
                  )}
                </div>
                {validationErrors.email && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationTriangle className="text-xs" />
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 text-base bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all ${
                      validationErrors.password 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-200'
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-12 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </button>
                  {validationErrors.password && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FaExclamationTriangle className="text-red-500" />
                    </div>
                  )}
                  {!validationErrors.password && formData.password && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FaCheckCircle className="text-green-500" />
                    </div>
                  )}
                </div>
                {validationErrors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <FaExclamationTriangle className="text-xs" />
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Remember Me + Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <span className="ml-2 text-base text-gray-700">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">Forgot password?</Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-base">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center px-4 py-3 text-base border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-base text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
