import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBrain, FaHome, FaUserMd, FaUsers, FaFileAlt, FaChartLine,
  FaCog, FaBell, FaSearch, FaCalendarAlt, FaExpand,
  FaUser, FaTable, FaMobile, FaShieldAlt, FaBars,
  FaWheelchair, FaStethoscope, FaUserFriends, FaBed,
  FaUpload, FaComments, FaMoon, FaCheck, FaTimes,
  FaArrowUp, FaArrowDown, FaEye, FaDownload, FaHeart,
  FaHeartbeat, FaThermometerHalf, FaWeight, FaTint,
  FaLungs, FaEyeDropper, FaVial, FaClipboardCheck,
  FaAmbulance, FaPills, FaXRay, FaMicroscope, FaFlask,
  FaUserNurse, FaHospital, FaFirstAid, FaShieldVirus, FaSun, FaSignOutAlt,
  FaSpinner, FaEnvelope, FaPhone, FaBirthdayCake, FaIdCard, FaEdit, FaTrash,
  FaClock, FaVideo, FaUserCheck
} from 'react-icons/fa';
import { mongodbService } from '../lib/mongodb';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [userFilters, setUserFilters] = useState({
    role: 'all',
    search: '',
    page: 1,
    limit: 10
  });
  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userConsultations, setUserConsultations] = useState([]);
  const [loadingConsultations, setLoadingConsultations] = useState(false);

  // Fetch Users Function
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('mongodb_token');
      if (!token) {
        alert('No authentication token found. Please login as admin first.');
        setUsers([]);
        setLoading(false);
        return;
      }
      const queryParams = new URLSearchParams({
        role: userFilters.role,
        search: userFilters.search,
        page: userFilters.page,
        limit: userFilters.limit
      });
      const apiUrl = `http://localhost:3002/api/admin/users?${queryParams}`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.users)) {
          setUsers(data.users);
        } else {
          setUsers([]);
          alert('No users found in database.');
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        alert(`Failed to fetch users: ${errorData.message}`);
        setUsers([]);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      if (error instanceof TypeError) {
        alert('Network error: Could not connect to backend. Please check your network connection and try again.');
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch User Statistics
  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('mongodb_token');
      
      if (!token) {
        console.error('No token for stats');
        return;
      }

      console.log('Fetching user stats...');
      const response = await fetch('http://localhost:3002/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Stats response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Stats data:', data);
        setUserStats(data);
      } else {
        console.error('Failed to fetch user stats, status:', response.status);
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Stats error details:', errorData);
      }
    } catch (error) {
      console.error('Network error fetching user stats:', error);
    }
  };

  // Update User Role
  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('mongodb_token');
      const response = await fetch(`http://localhost:3002/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (response.ok) {
        await fetchUsers();
        await fetchUserStats();
        alert('User role updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to update role: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Error updating user role');
    }
  };

  // Delete User
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('mongodb_token');
      const response = await fetch(`http://localhost:3002/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchUsers();
        await fetchUserStats();
        alert('User deleted successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to delete user: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  // Handle Filter Changes
  const handleUserFilterChange = (filterType, value) => {
    setUserFilters(prev => ({
      ...prev,
      [filterType]: value,
      page: 1
    }));
  };

  // Fetch User Consultations
  const fetchUserConsultations = async (userId) => {
    setLoadingConsultations(true);
    try {
      const { data, error } = await mongodbService.getUserConsultations(userId);
      if (error) {
        console.error('Error fetching consultations:', error);
        setUserConsultations([]);
      } else {
        setUserConsultations(data || []);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
      setUserConsultations([]);
    } finally {
      setLoadingConsultations(false);
    }
  };

  // View User Details
  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
    // Fetch consultations for patients
    if (user.role === 'patient') {
      fetchUserConsultations(user._id);
    }
  };

  // Edit User Details
  const editUserDetails = (user) => {
    setEditingUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      date_of_birth: user.date_of_birth,
      gender: user.gender,
      role: user.role,
      specialization: user.specialization,
      hospital: user.hospital,
      license_number: user.license_number,
      bloodType: user.bloodType,
      membershipType: user.membershipType,
      address: user.address || {},
      emergencyContact: user.emergencyContact || {},
      medicalHistory: user.medicalHistory || {},
      insurance: user.insurance || {},
      notes: user.notes,
      isActive: user.isActive
    });
    setShowEditModal(true);
  };

  // Save User Changes
  const saveUserChanges = async () => {
    try {
      const token = localStorage.getItem('mongodb_token');
      const response = await fetch(`http://localhost:3002/api/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        await fetchUsers();
        await fetchUserStats();
        setShowEditModal(false);
        setEditingUser(null);
        setEditFormData({});
        alert('User updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Failed to update user: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle array input changes (for medical history)
  const handleArrayInputChange = (field, value) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(item => item);
    const [parent, child] = field.split('.');
    setEditFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: arrayValue
      }
    }));
  };

  // Handle Logout
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        localStorage.removeItem('mongodb_token');
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
        navigate('/login');
      }
    }
  };

  // Load data on component mount and filter changes
  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, [userFilters]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`} style={{ fontFamily: 'Times New Roman, serif' }}>

      {/* Theme-Aware Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 shadow-xl border-r overflow-y-auto transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>

        {/* Theme-Aware Logo Section */}
        <div className={`p-4 border-b transition-colors duration-300 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <FaBrain className="text-white text-lg" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white">
                <div className="w-full h-full bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div>
              <div className={`font-bold text-lg transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>NeuroCare AI</div>
              <div className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Medical Dashboard</div>
            </div>
          </div>

          {/* Compact Status Badge */}
          <div className="mt-4 flex items-center justify-between">
            <div className={`flex items-center space-x-2 px-2 py-1 rounded-full border transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-700 text-xs font-semibold">Online</span>
            </div>
            <div className={`text-xs px-2 py-1 rounded-md border transition-colors duration-300 ${isDarkMode ? 'text-gray-400 bg-gray-700 border-gray-600' : 'text-gray-400 bg-white border-gray-200'}`}>v2.1.0</div>
          </div>
        </div>

        {/* Compact Quick Stats */}
        <div className="p-3 border-b border-gray-100">
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-gray-900">156</div>
                  <div className="text-gray-600 text-xs font-medium">Critical Cases</div>
                </div>
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shadow-lg">
                  <FaStethoscope className="text-white text-sm" />
                </div>
              </div>
              <div className="mt-2 flex items-center space-x-1">
                <FaArrowUp className="text-green-600 text-xs" />
                <span className="text-green-600 text-xs font-semibold">+5.2%</span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold text-gray-900">89</div>
                  <div className="text-gray-600 text-xs font-medium">AI Diagnoses</div>
                </div>
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                  <FaBrain className="text-white text-sm" />
                </div>
              </div>
              <div className="mt-2 flex items-center space-x-1">
                <FaArrowUp className="text-green-600 text-xs" />
                <span className="text-green-600 text-xs font-semibold">+12.8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Navigation */}
        <nav className="px-3 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: FaHome, active: false, isLink: true, path: '/admin-dashboard' },
            { id: 'users', label: 'User Management', icon: FaUserFriends, active: true, isLink: true, path: '/user-management' },
            { id: 'doctor-requests', label: 'Doctor Requests', icon: FaUserMd, badge: '5' },
            { id: 'patient-list', label: 'Patient List', icon: FaUsers },
            { id: 'patient-records', label: 'Patient Records', icon: FaFileAlt },
            { id: 'uploaded-mris', label: 'Neuroimaging', icon: FaUpload },
            { id: 'reports', label: 'Reports', icon: FaChartLine },
            { id: 'chat-logs', label: 'AI Insights', icon: FaComments },
            { id: 'system-settings', label: 'Settings', icon: FaCog, active: false, isLink: true, path: '/settings' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.isLink && item.path) {
                  navigate(item.path);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-300 group ${item.active
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-md'
                }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={`text-sm transition-colors ${item.active ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                  }`} />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-md animate-pulse">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          {/* Logout Button in Sidebar */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-300 group text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <div className="flex items-center space-x-3">
                <FaSignOutAlt className="text-sm" />
                <span className="font-medium text-sm">Logout</span>
              </div>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64">

        {/* Theme-Aware Header */}
        <header className={`border-b px-6 py-3 shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button className={`transition-colors p-1.5 rounded-lg ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}>
                <FaBars className="text-base" />
              </button>

              {/* Compact Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search patients, doctors..."
                  className={`pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 w-80 text-sm ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'}`}
                />
              </div>

              {/* Enhanced Title */}
              <div>
                <h1 className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>NeuroCare AI</h1>
                <p className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Medical Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`transition-colors p-2 rounded-lg ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <FaSun className="text-base" /> : <FaMoon className="text-base" />}
              </button>

              {/* Notifications */}
              <button className="relative text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                <FaBell className="text-base" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {/* Clean System Status */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Online</span>
              </div>

              {/* Clean User Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                  <FaUser className="text-white text-sm" />
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin</div>
                  <div className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Administrator</div>
                </div>
              </div>

            </div>
          </div>
        </header>

        {/* Theme-Aware Main Content Area */}
        <main className={`p-6 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>

          {/* User Management Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                User Management
              </h2>
              <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage all users, roles, and permissions
              </p>
            </div>
          </div>

          {/* User Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            {[
              { title: 'Total Users', value: userStats.totalUsers, icon: FaUsers, color: 'blue' },
              { title: 'Patients', value: userStats.totalPatients, icon: FaUser, color: 'green' },
              { title: 'Doctors', value: userStats.totalDoctors, icon: FaUserMd, color: 'purple' },
              { title: 'Recent (30d)', value: userStats.recentRegistrations, icon: FaCalendarAlt, color: 'yellow' }
            ].map((stat, index) => (
              <div key={index} className={`rounded-xl p-4 border transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                      {stat.title}
                    </p>
                    <p className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`text-${stat.color}-600 text-lg`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className={`rounded-xl p-4 border transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
            <div className="flex flex-wrap items-center gap-4">
              {/* Role Filter */}
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Filter by Role
                </label>
                <select
                  value={userFilters.role}
                  onChange={(e) => handleUserFilterChange('role', e.target.value)}
                  className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    }`}
                >
                  <option value="all">All Users</option>
                  <option value="patient">Patients</option>
                  <option value="doctor">Doctors</option>
                </select>
              </div>

              {/* Search */}
              <div className="flex-1 min-w-64">
                <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                  Search Users
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userFilters.search}
                    onChange={(e) => handleUserFilterChange('search', e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                  />
                </div>
              </div>

              {/* Refresh Button */}
              <div className="self-end">
                <button
                  onClick={() => {
                    fetchUsers();
                    fetchUserStats();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className={`rounded-xl border transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
            <div className="p-4 border-b border-gray-200">
              <h3 className={`text-lg font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                Users List
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className={`mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                  Loading users...
                </p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <FaUsers className={`mx-auto h-12 w-12 transition-colors duration-300 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'
                  }`} />
                <p className={`mt-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                  No users found
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        User
                      </th>
                      <th className={`px-4 py-3 text-left text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Role
                      </th>
                      <th className={`px-4 py-3 text-left text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Contact
                      </th>
                      <th className={`px-4 py-3 text-left text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Joined
                      </th>
                      <th className={`px-4 py-3 text-left text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Status
                      </th>
                      <th className={`px-4 py-3 text-left text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.filter(u => u.role !== 'admin').map((user) => (
                      <tr key={user._id} className={`transition-colors duration-300 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'doctor' ? 'bg-purple-100' :
                              user.role === 'admin' ? 'bg-red-100' : 'bg-blue-100'
                              }`}>
                              {user.role === 'doctor' ? (
                                <FaUserMd className={`text-purple-600`} />
                              ) : user.role === 'admin' ? (
                                <FaShieldAlt className={`text-red-600`} />
                              ) : (
                                <FaUser className={`text-blue-600`} />
                              )}
                            </div>
                            <div className="ml-3">
                              <p className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                {user.firstName} {user.lastName}
                              </p>
                              <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'doctor' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            {user.phone || 'Not provided'}
                          </p>
                          {user.role === 'doctor' && user.specialization && (
                            <p className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                              }`}>
                              {user.specialization}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => viewUserDetails(user)}
                              className="text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-lg hover:bg-blue-50"
                              title="View Details"
                            >
                              <FaEye className="text-sm" />
                            </button>
                            <button
                              onClick={() => editUserDetails(user)}
                              className="text-green-600 hover:text-green-800 transition-colors p-2 rounded-lg hover:bg-green-50"
                              title="Edit User"
                            >
                              <FaEdit className="text-sm" />
                            </button>
                            <button
                              onClick={() => deleteUser(user._id)}
                              className="text-red-600 hover:text-red-800 transition-colors p-2 rounded-lg hover:bg-red-50"
                              title="Delete User"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setUserConsultations([]);
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="space-y-6">
              {/* User Profile Section */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${selectedUser.role === 'doctor' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                  {selectedUser.role === 'doctor' ? (
                    <FaUserMd className="text-purple-600 text-2xl" />
                  ) : (
                    <FaUser className="text-blue-600 text-2xl" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedUser.role === 'doctor' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                  </span>
                </div>
              </div>

              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaEnvelope className="text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email</p>
                      <p className="text-sm text-gray-900">{selectedUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaPhone className="text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <p className="text-sm text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                    </div>
                  </div>

                  {selectedUser.date_of_birth && (
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FaBirthdayCake className="text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Date of Birth</p>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedUser.date_of_birth).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaCalendarAlt className="text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Joined</p>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctor-specific Information */}
              {selectedUser.role === 'doctor' && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Professional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedUser.license_number && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FaIdCard className="text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">License Number</p>
                          <p className="text-sm text-gray-900">{selectedUser.license_number}</p>
                        </div>
                      </div>
                    )}

                    {selectedUser.specialization && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FaBrain className="text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Specialization</p>
                          <p className="text-sm text-gray-900">{selectedUser.specialization}</p>
                        </div>
                      </div>
                    )}

                    {selectedUser.hospital && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FaHospital className="text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Hospital/Clinic</p>
                          <p className="text-sm text-gray-900">{selectedUser.hospital}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Consultation History - Only for Patients */}
              {selectedUser.role === 'patient' && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Consultation History</h4>
                  {loadingConsultations ? (
                    <div className="flex items-center justify-center p-6">
                      <FaSpinner className="animate-spin text-blue-600 mr-2" />
                      <span className="text-gray-600">Loading consultation history...</span>
                    </div>
                  ) : userConsultations.length > 0 ? (
                    <div className="space-y-3">
                      {userConsultations.map((consultation) => (
                        <div key={consultation.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FaUserMd className="text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900">{consultation.doctor.name}</h5>
                                <p className="text-sm text-gray-600">{consultation.doctor.specialization}</p>
                                <p className="text-xs text-gray-500">{consultation.doctor.hospital}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <div className="flex items-center space-x-1">
                                    <FaCalendarAlt className="text-gray-400 text-xs" />
                                    <span className="text-xs text-gray-600">{consultation.date}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <FaClock className="text-gray-400 text-xs" />
                                    <span className="text-xs text-gray-600">{consultation.time}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    {consultation.mode === 'online' ? (
                                      <FaVideo className="text-gray-400 text-xs" />
                                    ) : (
                                      <FaUserCheck className="text-gray-400 text-xs" />
                                    )}
                                    <span className="text-xs text-gray-600 capitalize">{consultation.mode}</span>
                                  </div>
                                </div>
                                {consultation.notes && (
                                  <p className="text-xs text-gray-600 mt-2 italic">"{consultation.notes}"</p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                consultation.status === 'approved' ? 'bg-green-100 text-green-700' :
                                consultation.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                consultation.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {consultation.status ? consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1) : 'Pending'}
                              </span>
                              <span className="text-xs text-gray-500 mt-1">
                                {new Date(consultation.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <FaUserMd className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">No consultation history found</p>
                      <p className="text-xs text-gray-500">This patient hasn't consulted with any doctors yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Account Status */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Account Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Status</p>
                      <p className="text-sm text-green-700 font-semibold">
                        {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaCalendarAlt className="text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Last Updated</p>
                      <p className="text-sm text-gray-900">
                        {selectedUser.updatedAt ?
                          new Date(selectedUser.updatedAt).toLocaleDateString() :
                          new Date(selectedUser.createdAt).toLocaleDateString()
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setUserConsultations([]);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  editUserDetails(selectedUser);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit User Details</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={editFormData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={editFormData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Doctor-specific fields */}
              {editingUser.role === 'doctor' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                      <input
                        type="text"
                        value={editFormData.license_number}
                        onChange={(e) => handleInputChange('license_number', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                      <input
                        type="text"
                        value={editFormData.specialization}
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hospital/Clinic</label>
                      <input
                        type="text"
                        value={editFormData.hospital}
                        onChange={(e) => handleInputChange('hospital', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
                <textarea
                  value={editFormData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Add any additional notes about this user..."
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveUserChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;