import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { mongodbService } from '../lib/mongodb';
import { FaLock, FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const query = new URLSearchParams(location.search);
  const token = query.get('token') || '';

  const validatePassword = (pwd) => {
    if (!pwd) return 'Password is required';
    if (pwd.length < 8) return 'At least 8 characters required';
    if (!/[A-Z]/.test(pwd)) return 'Must include an uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Must include a lowercase letter';
    if (!/\d/.test(pwd)) return 'Must include a number';
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd)) return 'Must include a special character';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Missing or invalid token');
      return;
    }

    const pwdErr = validatePassword(password);
    if (pwdErr) { setError(pwdErr); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }

    try {
      setIsSubmitting(true);
      const { data, error } = await mongodbService.resetPassword(token, password);
      if (error) throw new Error(error.message);
      setMessage('Password has been reset. You can now log in.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
            <FaArrowLeft className="mr-2" /> Back to login
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Set a new password</h1>
        <p className="text-gray-600 mb-6">Enter your new password below.</p>

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
            <FaCheckCircle />
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <FaExclamationTriangle />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaLock />
            </div>
            <input
              type="password"
              name="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400 hover:border-gray-300 border-gray-200"
              required
            />
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <FaLock />
            </div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400 hover:border-gray-300 border-gray-200"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
          >
            {isSubmitting ? 'Updating...' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
}































