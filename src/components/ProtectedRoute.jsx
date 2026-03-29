import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading, authChecked } = useAuth();

  // Show loading spinner while authentication is being checked
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

  // Redirect to login if no user is authenticated
  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If doctor is not approved, redirect to pending page
  if (user.role === 'doctor' && user.approvalStatus !== 'approved') {
    console.log('ProtectedRoute: Doctor not approved, redirecting to pending page');
    return <Navigate to="/pending" replace />;
  }

  console.log('ProtectedRoute: User authenticated, rendering protected content');
  return children;
}; 