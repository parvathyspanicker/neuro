import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { getSocket } from '../lib/socket';
import { mongodbService } from '../lib/mongodb';
import { useNavigate } from 'react-router-dom';
import {
  FaBrain, FaUser, FaSignOutAlt, FaChevronDown, FaUpload, FaRobot, FaTimes,
  FaCrown, FaHeadset, FaUserMd, FaBars, FaHome, FaFileAlt, FaComment,
  FaCalendarAlt, FaComments, FaVideo
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import BrainHealthChat from '../components/BrainHealthChat';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut, authChecked } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifItems, setNotifItems] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [appointments, setAppointments] = useState([]);

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (!authChecked) return;
    if (user && user.role === 'admin') {
      console.log('Dashboard: Admin user detected, redirecting to admin dashboard');
      navigate('/admin-dashboard', { replace: true });
    } else if (user && user.role === 'doctor') {
      console.log('Dashboard: Doctor user detected, redirecting to doctor dashboard');
      navigate('/doctor-dashboard', { replace: true });
    }
  }, [user, authChecked, navigate]);

  // Realtime appointment decision notifications for patients
  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    const onNotification = (payload) => {
      if (payload?.type === 'appointment_approved' || payload?.type === 'appointment_rejected') {
        setNotifCount((n) => n + 1);
        setNotifItems((items) => [{ id: Date.now(), ...payload }, ...items].slice(0, 10));
        // refresh appointments so navbar stays in sync
        (async () => {
          try {
            const res = await mongodbService.listAppointments();
            setAppointments(res?.data || []);
          } catch {}
        })();
      }
    };
    s.on('notification', onNotification);
    return () => {
      s.off('notification', onNotification);
    };
  }, []);

  // Load appointments on mount (to populate notifications even if page refreshed)
  useEffect(() => {
    (async () => {
      try {
        const res = await mongodbService.listAppointments();
        setAppointments(res?.data || []);
      } catch {}
    })();
  }, []);

  // Sync bell notifications from approved appointments
  useEffect(() => {
    const approved = (appointments || []).filter((a) => (a.status || '').toLowerCase() === 'approved');
    setNotifCount(approved.length);
    setNotifItems(
      approved
        .slice(0, 10)
        .map((a) => ({
          id: `approved-${a.id}`,
          type: 'appointment_approved',
          appointment: a,
          createdAt: a.updatedAt || a.createdAt || new Date().toISOString(),
        }))
    );
  }, [appointments]);

  // User membership status
  const userMembership = {
    isPremium: false,
    plan: 'Basic',
    expiryDate: '2024-12-31',
    features: ['AI Analysis', 'Doctor Chat', 'Video Consultations', 'Priority Support']
  };

  const sidebarItems = [
    { id: 'home', label: 'Dashboard', icon: FaHome },
    { id: 'upload', label: 'Upload MRI', icon: FaUpload },
    { id: 'reports', label: 'My Reports', icon: FaFileAlt },
    { id: 'brain-chat', label: 'Brain Health Chat', icon: FaComment },
    { id: 'appointments', label: 'Appointments', icon: FaCalendarAlt },
    { id: 'doctor-chat', label: 'Chat with Doctor', icon: FaComments },
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'support', label: 'Help & Support', icon: FaHeadset }
  ];

  const handleSidebarClick = (itemId) => {
    if (itemId === 'upload') {
      navigate('/mri-analysis');
    } else if (itemId === 'support') {
      navigate('/help-support');
    } else if (itemId === 'reports') {
      navigate('/reports');
    } else if (itemId === 'profile') {
      navigate('/profile');
    } else if (itemId === 'video-call') {
      if (!checkPremiumAccess(itemId)) return;
      setActiveTab(itemId);
    } else if (itemId === 'doctor-chat') {
      if (!userMembership.isPremium) { setShowPremiumModal(true); navigate('/subscription'); return; }
      navigate('/doctor-chat');
    } else if (itemId === 'appointments') {
      if (!userMembership.isPremium) { setShowPremiumModal(true); navigate('/subscription'); return; }
      setActiveTab(itemId);
    } else if (itemId === 'brain-chat') {
      setActiveTab(itemId);
    } else {
      setActiveTab(itemId);
    }
  };

  const checkPremiumAccess = (feature) => {
    if (!userMembership.isPremium) {
      setShowPremiumModal(true);
      return false;
    }
    return true;
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FaBrain className="text-white text-lg" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">NeuroCare</h1>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setActiveTab('home')}
              className={`text-sm font-medium transition-colors ${activeTab === 'home' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/mri-analysis')}
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              Upload MRI
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              My Reports
            </button>
            <button
              onClick={() => setActiveTab('brain-chat')}
              className={`text-sm font-medium transition-colors ${activeTab === 'brain-chat' ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
            >
              Brain Health Chat
            </button>
            <button
              onClick={() => navigate('/appointments')}
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              Appointments
            </button>
            <button
              onClick={() => navigate('/doctor-chat')}
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              Chat with Doctor
            </button>
            {/* Video Call removed as requested */}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 rounded-lg"
            >
              <FaBars />
            </button>

            {/* User Profile + Notifications */}
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-600" onClick={() => setShowNotif((v)=>!v)} aria-label="Notifications">
                  <FaBell />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{notifCount}</span>
                  )}
                </button>
                {showNotif && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-2 max-h-80 overflow-auto">
                      {notifItems.length === 0 && (
                        <div className="text-sm text-gray-500 p-3">No notifications</div>
                      )}
                      {notifItems.map((n) => (
                        <button key={n.id} className="w-full text-left p-3 rounded-lg hover:bg-gray-50" onClick={() => { setShowNotif(false); navigate('/appointments'); }}>
                          <div className="text-sm font-semibold text-gray-800">{n.type === 'appointment_approved' ? 'Appointment Approved' : 'Appointment Update'}</div>
                          <div className="text-xs text-gray-600 mt-1">{n?.appointment?.date} {n?.appointment?.time} • {n?.appointment?.status}</div>
                          <div className="text-[11px] text-gray-400 mt-1">{new Date(n.createdAt || Date.now()).toLocaleString()}</div>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-gray-200 p-2 flex items-center justify-between">
                      <button className="text-xs text-gray-600 hover:underline" onClick={()=>{setNotifItems([]); setNotifCount(0);}}>Clear</button>
                      <button className="text-xs text-blue-600 hover:underline" onClick={()=>setShowNotif(false)}>Close</button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                  alt="User"
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                />
                <span className="text-sm">
                  {user?.user_metadata?.full_name || user?.email || 'John Doe'}
                </span>
                <FaChevronDown className="text-xs" />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-2">
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm"
                    >
                      <FaUser className="text-xs" />
                      Profile
                    </button>
                    <button
                      onClick={() => navigate('/subscription')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm"
                    >
                      <FaCrown className="text-xs" />
                      Subscription
                    </button>
                    <button
                      onClick={() => navigate('/help-support')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm"
                    >
                      <FaHeadset className="text-xs" />
                      Support
                    </button>
                    {user && user.role === 'admin' && (
                      <button
                        onClick={() => navigate('/admin-dashboard')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-purple-600 hover:bg-gray-50 rounded-lg text-sm"
                      >
                        <FaUserMd className="text-xs" />
                        Admin Dashboard
                      </button>
                    )}
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-gray-50 rounded-lg text-sm"
                    >
                      <FaSignOutAlt className="text-xs" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2 px-6">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleSidebarClick(item.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left rounded-lg transition-colors ${activeTab === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                >
                  <item.icon className="text-sm" />
                  <span className="font-medium">{item.label}</span>
                  {(['appointments','doctor-chat'].includes(item.id)) && !userMembership.isPremium && (
                    <FaCrown className="text-yellow-500 text-xs ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20">

        {/* Welcome Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-6xl font-light text-gray-900 mb-8 tracking-wide">
            Welcome to NeuroCare
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-12">
            Welcome to NeuroCare, your trusted companion for neurological well-being. Our AI-driven system empowers you with accurate MRI analysis, posture detection, and personalized insights for early diagnosis. Stay connected with your doctor, track your progress, and receive real-time guidance tailored just for you. With innovation and care combined, NeuroCare ensures you are never alone in your health journey.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 mb-16">

          {/* MRI Analysis Button */}
          <button
            onClick={() => navigate('/mri-analysis')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg"
          >
            MRI Analysis
          </button>

          {/* Chat with AI Button */}
          <button
            onClick={() => setActiveTab('brain-chat')}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg"
          >
            Chat with AI
          </button>
        </div>

      </main>

      {/* Appointments Drawer */}
      {activeTab === 'appointments' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl m-4">
            <div className="bg-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-lg font-semibold">Appointments</h3>
              <button onClick={() => setActiveTab('home')} className="p-2 hover:bg-blue-700 rounded-lg transition-colors">
                <FaTimes />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Book New Appointment</h4>
                <div className="space-y-3">
                  <input type="text" placeholder="Doctor/Specialization" className="w-full border rounded-lg px-3 py-2" />
                  <input type="date" className="w-full border rounded-lg px-3 py-2" />
                  <input type="time" className="w-full border rounded-lg px-3 py-2" />
                  <textarea placeholder="Notes" className="w-full border rounded-lg px-3 py-2 h-20" />
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">Request Appointment</button>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Upcoming Appointments</h4>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex justify-between items-center border rounded-lg px-3 py-2">
                    <span>Dr. Smith • Neurology • 2025-09-10 10:30</span>
                    <button className="text-red-600 hover:underline">Cancel</button>
                  </li>
                  <li className="flex justify-between items-center border rounded-lg px-3 py-2">
                    <span>Dr. Lee • Radiology • 2025-09-15 14:00</span>
                    <button className="text-red-600 hover:underline">Cancel</button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Brain Health Chat Tab */}
      {activeTab === 'brain-chat' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] m-4">
            <div className="bg-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-lg font-semibold">Brain Health Chat</h3>
              <button
                onClick={() => setActiveTab('home')}
                className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <div className="h-[calc(80vh-80px)]">
              <BrainHealthChat />
            </div>
          </div>
        </div>
      )}

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCrown className="text-yellow-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Feature</h3>
              <p className="text-gray-600 mb-6">This feature is available for Premium members only. Upgrade now to access all features!</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPremiumModal(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowPremiumModal(false);
                    navigate('/subscription');
                  }}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}