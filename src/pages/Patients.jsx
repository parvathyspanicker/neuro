import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mongodbService } from '../lib/mongodb';
import {
  FaBars,
  FaBell,
  FaBrain,
  FaCalendarAlt,
  FaChevronDown,
  FaCog,
  FaComments,
  FaFileAlt,
  FaMicrochip,
  FaSearch,
  FaUser,
  FaUsers,
  FaUpload,
  FaClock,
  FaSignOutAlt,
  FaArrowLeft
} from 'react-icons/fa';

const Patients = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Patients Data
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await mongodbService.doctorListPatients();
      if (response?.error) {
        setError(response.error.message);
      } else {
        setPatients(response?.data || []);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-amber-600 bg-amber-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      case 'cancelled': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cardClass = 'bg-white/70 backdrop-blur-xl rounded-2xl shadow-md hover:shadow-lg border border-white/60 transition-all duration-200 transform-gpu hover:-translate-y-0.5';
  const blueBtn = 'inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} hidden md:flex flex-col bg-white/70 backdrop-blur-xl border-r border-white/60 shadow-md transition-all`}>
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-sm">
              <FaBrain />
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-bold text-gray-800">NeuroCare AI</span>
            )}
          </div>
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={() => setSidebarCollapsed((v) => !v)}
            title="Toggle sidebar"
          >
            <FaBars />
          </button>
        </div>

        <nav className="px-2 py-3 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {[
              { icon: FaCalendarAlt, label: 'Dashboard', route: '/doctor-dashboard' },
              { icon: FaCalendarAlt, label: 'View Appointments', route: '/doctor-appointments' },
              { icon: FaUsers, label: 'Patients', route: '/patients', active: true },
              { icon: FaUpload, label: 'MRI Upload', route: '/mri-analysis' },
              { icon: FaMicrochip, label: 'AI Predictions', route: '/doctor-dashboard' },
              { icon: FaComments, label: 'Chat', route: '/doctor-patient-chat' },
              { icon: FaFileAlt, label: 'Reports', route: '/reports' },
              { icon: FaCog, label: 'Settings', route: '/settings' },
            ].map((item, idx) => (
              <li key={idx}>
                <button
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    item.active
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-100 shadow-sm'
                      : 'text-slate-700 bg-white/40 hover:bg-white/70 border border-transparent hover:border-white/60 hover:shadow-sm backdrop-blur-md'
                  }`}
                  onClick={() => item.route && navigate(item.route)}
                >
                  <item.icon className="text-base" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 bg-white/60 backdrop-blur-xl border-b border-white/60 shadow-md">
          <div className="h-16 px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <button className="md:hidden text-gray-700" onClick={() => setSidebarCollapsed((v) => !v)}>
                <FaBars />
              </button>
              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={() => navigate('/doctor-dashboard')}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Back to Dashboard"
                >
                  <FaArrowLeft />
                </button>
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-sm">
                  <FaBrain />
                </div>
                <span className="hidden sm:block text-base md:text-lg font-bold text-gray-800">NeuroCare AI</span>
              </div>
            </div>

            <div className="flex-1 max-w-xl mx-4 hidden sm:block">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patients..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <FaBell className="text-lg" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-50"
                >
                  <img
                    src={user?.avatarUrl || user?.picture || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face'}
                    alt="Doctor"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div className="hidden md:block leading-tight text-left">
                    <div className="text-sm font-semibold text-gray-800">{user?.fullName || user?.name || user?.email || 'Doctor'}</div>
                    <div className="text-xs text-gray-500">{user?.role === 'doctor' ? (user?.specialty || 'Doctor') : 'User'}</div>
                  </div>
                  <FaChevronDown className="text-gray-400" />
                </button>
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-2">
                      <button onClick={() => { navigate('/profile'); setShowUserDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm"><FaUser /> Profile</button>
                      <button onClick={() => { navigate('/settings'); setShowUserDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm"><FaCog /> Settings</button>
                      <button onClick={() => { navigate('/help-support'); setShowUserDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm">Support</button>
                      <hr className="my-2 border-gray-200" />
                      <button
                        onClick={async () => { try { await signOut(); navigate('/'); } catch {} }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-gray-50 rounded-lg text-sm"
                      >
                        <FaSignOutAlt className="text-xs" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 px-4 md:px-6 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center">
                <FaUsers />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Patients</h1>
            </div>
            <p className="text-gray-600">Patients who have taken appointments with you</p>
          </div>

          {/* Patients List */}
          <div className={`${cardClass} p-4 md:p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaUsers className="text-blue-600" />
                <h2 className="text-lg md:text-xl font-semibold text-gray-800">Patients List</h2>
              </div>
              <button
                onClick={loadPatients}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-500">Loading patients...</p>
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-8">
                <div className="text-red-600 mb-2">⚠️ {error}</div>
                <button
                  onClick={loadPatients}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                {filteredPatients.length === 0 ? (
                  <div className="text-center py-8">
                    <FaUsers className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No Patients Found</h3>
                    <p className="text-gray-500">
                      {searchQuery ? 'No patients match your search criteria.' : 'No patients with approved appointments found.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500 mb-4">
                      Showing {filteredPatients.length} patient{filteredPatients.length !== 1 ? 's' : ''} with approved appointments
                    </div>
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold text-lg">
                            {patient.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{patient.name}</h3>
                            <p className="text-gray-600">{patient.email}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1 text-blue-600">
                                <FaCalendarAlt className="w-4 h-4" />
                                <span className="text-sm font-medium">{patient.appointmentCount} appointment{patient.appointmentCount !== 1 ? 's' : ''}</span>
                              </div>
                              {patient.lastAppointmentDate && (
                                <div className="flex items-center gap-1 text-gray-500">
                                  <FaClock className="w-4 h-4" />
                                  <span className="text-sm">Last: {formatDate(patient.lastAppointmentDate)}</span>
                                </div>
                              )}
                              {patient.lastAppointmentStatus && (
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.lastAppointmentStatus)}`}>
                                  {patient.lastAppointmentStatus}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate('/doctor-patient-chat', { state: { patientId: patient.id, patientName: patient.name } })}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                            >
                              <FaComments className="w-4 h-4" />
                              <span className="text-sm font-medium">Chat</span>
                            </button>
                            <button
                              onClick={() => navigate('/doctor-appointments', { state: { patientId: patient.id, patientName: patient.name } })}
                              className="flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
                            >
                              <FaCalendarAlt className="w-4 h-4" />
                              <span className="text-sm font-medium">Appointments</span>
                            </button>
                            <button
                              onClick={() => navigate('/reports', { state: { patientId: patient.id, patientName: patient.name } })}
                              className="flex items-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
                            >
                              <FaFileAlt className="w-4 h-4" />
                              <span className="text-sm font-medium">Reports</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Patients;
