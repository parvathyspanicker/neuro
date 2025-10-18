import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const PremiumRoute = ({ children }) => {
  const { user, loading, authChecked } = useAuth();

  if (loading || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const membershipType = String(user?.membershipType || 'Basic');
  const isPremium = membershipType === 'Premium' || membershipType === 'Family';

  if (!isPremium) {
    return <Navigate to="/subscription" replace />;
  }

  return children;
};









