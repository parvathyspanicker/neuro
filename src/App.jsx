import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';

import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import AdminDashboard from './pages/AdminDashboard';
import Settings from './pages/Settings';
import MRIAnalysis from './pages/MRIAnalysis';
import Footer from './components/Footer';
import About from './pages/About';
import HelpSupport from './pages/HelpSupport';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import DoctorRequests from './pages/DoctorRequests';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorChat from './pages/DoctorChat';
import Appointments from './pages/Appointments';
import PaymentPage from './pages/PaymentPage';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorPatientChat from './pages/DoctorPatientChat';
import Patients from './pages/Patients';
import ReferredPatients from './pages/ReferredPatients';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Subscription from './pages/Subscription';
import AuditLogs from './pages/AuditLogs';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';
import { PremiumRoute } from './components/PremiumRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <>
              <Home />
              {/* Doctor Dashboard preview below Home page navbar */}

              <Contact />
              <Footer />
            </>
          } />
          <Route path="/about" element={<><About /><Footer /></>} />
          <Route path="/login" element={<><Login /><Footer /></>} />
          <Route path="/register" element={<><Register /><Footer /></>} />
          <Route path="/forgot-password" element={<><ForgotPassword /><Footer /></>} />
          <Route path="/reset-password" element={<><ResetPassword /><Footer /></>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/settings" element={<AdminProtectedRoute><Settings /></AdminProtectedRoute>} />
          <Route path="/mri-analysis" element={<ProtectedRoute><MRIAnalysis /></ProtectedRoute>} />
          <Route path="/help-support" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/doctor-requests" element={<AdminProtectedRoute><DoctorRequests /></AdminProtectedRoute>} />
          <Route path="/doctor-dashboard" element={<ProtectedRoute><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><PremiumRoute><Appointments /></PremiumRoute></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
          <Route path="/doctor-chat" element={<ProtectedRoute><PremiumRoute><DoctorChat /></PremiumRoute></ProtectedRoute>} />
          <Route path="/doctor-appointments" element={<ProtectedRoute><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor-patient-chat" element={<ProtectedRoute><DoctorPatientChat /></ProtectedRoute>} />
          <Route path="/referred-patients" element={<ProtectedRoute><ReferredPatients /></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
          <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
          <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;