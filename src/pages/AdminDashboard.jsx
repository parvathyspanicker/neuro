import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
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
  FaUserNurse, FaHospital, FaFirstAid, FaShieldVirus, FaSun, FaSignOutAlt
} from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { signOut, user, authChecked } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalAdmins: 0,
    recentRegistrations: 0
  });

  // User Management Filters
  const [userFilters, setUserFilters] = useState({
    role: 'all',
    search: '',
    page: 1,
    limit: 10
  });

  // Doctor Requests Filters
  const [doctorFilters, setDoctorFilters] = useState({
    specialization: 'All Specializations',
    status: 'All Status',
    search: ''
  });

  // Redirect non-admin users to regular dashboard
  useEffect(() => {
    if (authChecked && user && user.role !== 'admin') {
      console.log('AdminDashboard: Non-admin user detected, redirecting to regular dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, authChecked, navigate]);

  // User Management Functions
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('mongodb_token');
      const queryParams = new URLSearchParams({
        role: userFilters.role,
        search: userFilters.search,
        page: userFilters.page,
        limit: userFilters.limit
      });

      const response = await fetch(`http://localhost:3002/api/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        console.log('Fetched users:', data.users);
      } else {
        console.error('Failed to fetch users');
        const errorData = await response.json();
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('mongodb_token');
      const response = await fetch('http://localhost:3002/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserStats(data);
      } else {
        console.error('Failed to fetch user stats');
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

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
        // Refresh users list and stats
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
        // Refresh users list and stats
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

  // Handle filter changes
  const handleUserFilterChange = (filterType, value) => {
    setUserFilters(prev => ({
      ...prev,
      [filterType]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Load users and stats when user management tab is selected or filters change
  React.useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
      fetchUserStats();
    }
  }, [activeTab, userFilters]);

  // Logout function
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await signOut();
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
        // Even if there's an error, redirect to login
        navigate('/login');
      }
    }
  };

  // Sample doctor data
  const allDoctors = [
    {
      id: 'DR001',
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@hospital.com',
      phone: '+1 (555) 123-4567',
      license: 'MD-2024-001',
      specialization: 'Neurologist',
      hospital: 'City General Hospital',
      department: 'Neurology Department',
      experience: '12 years',
      requestDate: '2024-01-15',
      requestTime: '09:30 AM',
      status: 'pending',
      priority: 'high',
      verification: 'verified',
      documents: ['License', 'CV', 'References']
    },
    {
      id: 'DR002',
      name: 'Dr. James Wilson',
      email: 'james.wilson@clinic.com',
      phone: '+1 (555) 234-5678',
      license: 'MD-2024-002',
      specialization: 'Neurosurgeon',
      hospital: 'Brain & Spine Center',
      department: 'Surgical Department',
      experience: '15 years',
      requestDate: '2024-01-14',
      requestTime: '02:15 PM',
      status: 'under-review',
      priority: 'high',
      verification: 'pending',
      documents: ['License', 'CV']
    },
    {
      id: 'DR003',
      name: 'Dr. Sarah Kim',
      email: 'sarah.kim@research.org',
      phone: '+1 (555) 345-6789',
      license: 'MD-2024-003',
      specialization: 'Neurologist',
      hospital: 'Medical Research Institute',
      department: 'Research Division',
      experience: '8 years',
      requestDate: '2024-01-13',
      requestTime: '11:45 AM',
      status: 'pending',
      priority: 'medium',
      verification: 'verified',
      documents: ['License', 'CV', 'References', 'Publications']
    },
    {
      id: 'DR004',
      name: 'Dr. Michael Brown',
      email: 'michael.brown@hospital.com',
      phone: '+1 (555) 456-7890',
      license: 'MD-2024-004',
      specialization: 'Psychiatrist',
      hospital: 'Mental Health Center',
      department: 'Psychiatry Department',
      experience: '10 years',
      requestDate: '2024-01-12',
      requestTime: '04:20 PM',
      status: 'pending',
      priority: 'medium',
      verification: 'verified',
      documents: ['License', 'CV', 'References']
    },
    {
      id: 'DR005',
      name: 'Dr. Lisa Chen',
      email: 'lisa.chen@clinic.com',
      phone: '+1 (555) 567-8901',
      license: 'MD-2024-005',
      specialization: 'Pediatric Neurologist',
      hospital: 'Children\'s Neuro Clinic',
      department: 'Pediatric Neurology',
      experience: '7 years',
      requestDate: '2024-01-11',
      requestTime: '10:00 AM',
      status: 'pending',
      priority: 'low',
      verification: 'pending',
      documents: ['License', 'CV']
    },
    {
      id: 'DR006',
      name: 'Dr. David Kim',
      email: 'david.kim@hospital.com',
      phone: '+1 (555) 678-9012',
      license: 'MD-2024-006',
      specialization: 'Radiologist',
      hospital: 'Imaging Center',
      department: 'Radiology Department',
      experience: '9 years',
      requestDate: '2024-01-10',
      requestTime: '01:30 PM',
      status: 'under-review',
      priority: 'medium',
      verification: 'verified',
      documents: ['License', 'CV', 'References', 'Certifications']
    },
    {
      id: 'DR007',
      name: 'Dr. Anna Martinez',
      email: 'anna.martinez@clinic.com',
      phone: '+1 (555) 789-0123',
      license: 'MD-2024-007',
      specialization: 'Researcher',
      hospital: 'Neuro Research Lab',
      department: 'Clinical Research',
      experience: '6 years',
      requestDate: '2024-01-09',
      requestTime: '03:45 PM',
      status: 'approved',
      priority: 'low',
      verification: 'verified',
      documents: ['License', 'CV', 'References', 'Publications']
    },
    {
      id: 'DR008',
      name: 'Dr. Robert Taylor',
      email: 'robert.taylor@hospital.com',
      phone: '+1 (555) 890-1234',
      license: 'MD-2024-008',
      specialization: 'Neurosurgeon',
      hospital: 'Advanced Brain Surgery',
      department: 'Neurosurgery',
      experience: '18 years',
      requestDate: '2024-01-08',
      requestTime: '08:20 AM',
      status: 'denied',
      priority: 'high',
      verification: 'pending',
      documents: ['License']
    }
  ];

  // Filter doctors based on current filters
  const filteredDoctors = allDoctors.filter(doctor => {
    const matchesSpecialization = doctorFilters.specialization === 'All Specializations' ||
      doctor.specialization === doctorFilters.specialization;

    const matchesStatus = doctorFilters.status === 'All Status' ||
      doctor.status === doctorFilters.status.toLowerCase().replace(' ', '-');

    const matchesSearch = doctorFilters.search === '' ||
      doctor.name.toLowerCase().includes(doctorFilters.search.toLowerCase()) ||
      doctor.email.toLowerCase().includes(doctorFilters.search.toLowerCase()) ||
      doctor.license.toLowerCase().includes(doctorFilters.search.toLowerCase());

    return matchesSpecialization && matchesStatus && matchesSearch;
  });

  // Handle filter changes
  const handleDoctorFilterChange = (filterType, value) => {
    setDoctorFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const diseaseData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Alzheimer\'s',
        data: [20, 25, 22, 28, 32, 29, 35, 31, 38, 42, 39, 45],
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#dc2626',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4
      },
      {
        label: 'Epilepsy',
        data: [15, 18, 16, 21, 19, 24, 22, 26, 23, 28, 25, 30],
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#7c3aed',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4
      },
      {
        label: 'Parkinson\'s',
        data: [12, 14, 13, 16, 15, 18, 17, 20, 19, 22, 21, 24],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4
      },
      {
        label: 'Multiple Sclerosis',
        data: [8, 10, 9, 12, 11, 14, 13, 16, 15, 18, 17, 20],
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#059669',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4
      },
      {
        label: 'Stroke',
        data: [18, 16, 19, 17, 20, 18, 21, 19, 22, 20, 23, 21],
        borderColor: '#d97706',
        backgroundColor: 'rgba(217, 119, 6, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#d97706',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4
      }
    ]
  };

  const aiPerformanceData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Accuracy %',
      data: [94, 96, 95, 97, 98, 96, 99],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      borderWidth: 4,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10b981',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 3,
      pointRadius: 8
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: '#6b7280',
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11,
            family: 'Times New Roman, serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#6b7280',
        borderColor: '#d1d5db',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: {
          size: 12,
          weight: 'bold',
          family: 'Times New Roman, serif'
        },
        bodyFont: {
          size: 11,
          family: 'Times New Roman, serif'
        },
        displayColors: true,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
            family: 'Times New Roman, serif'
          },
          padding: 8
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(107, 114, 128, 0.2)',
          borderDash: [3, 3],
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
            family: 'Times New Roman, serif'
          },
          padding: 8
        },
        border: {
          display: false
        }
      }
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2
      },
      line: {
        borderWidth: 2
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        cornerRadius: 12
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'admin-dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`} style={{ fontFamily: 'Times New Roman, serif' }}>

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
        <div className={`p-3 border-b transition-colors duration-300 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
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
            { id: 'dashboard', label: 'Dashboard', icon: FaHome, active: activeTab === 'dashboard' },
            { id: 'users', label: 'User Management', icon: FaUserFriends, active: false, isLink: true, path: '/user-management' },
            { id: 'doctor-requests-link', label: 'Doctor Requests', icon: FaUserMd, isLink: true, path: '/doctor-requests' },
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
                } else {
                  setActiveTab(item.id);
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

          {/* User Management Tab - Removed, now handled by separate UserManagement component */}
          {activeTab === 'users' && (
            <div className="space-y-6">
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
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
                              <div className="flex items-center space-x-2">
                                {/* Role Change Dropdown */}
                                <select
                                  value={user.role}
                                  onChange={(e) => updateUserRole(user._id, e.target.value)}
                                  className={`text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-300 ${isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                    }`}
                                >
                                  <option value="patient">Patient</option>
                                  <option value="doctor">Doctor</option>
                                </select>

                                {/* Delete Button */}
                                <button
                                  onClick={() => deleteUser(user._id)}
                                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                                  title="Delete User"
                                >
                                  <FaTimes className="text-xs" />
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
            </div>
          )}

          {activeTab === 'dashboard' && (
            <>


              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-4 gap-6 mb-8">
                {[
                  {
                    title: 'Neurologists',
                    value: '247',
                    change: '+5.1%',
                    icon: FaUserMd,
                    color: 'from-blue-500 to-blue-600',
                    bgColor: 'from-white to-blue-50/30',
                    borderColor: 'border-blue-100/50'
                  },
                  {
                    title: 'Diagnoses',
                    value: '1,310',
                    change: '+7.3%',
                    icon: FaUsers,
                    color: 'from-green-500 to-green-600',
                    bgColor: 'from-white to-green-50/30',
                    borderColor: 'border-green-100/50'
                  },
                  {
                    title: 'Brain Scans',
                    value: '89',
                    change: '+14.1%',
                    icon: FaBrain,
                    color: 'from-purple-500 to-purple-600',
                    bgColor: 'from-white to-purple-50/30',
                    borderColor: 'border-purple-100/50'
                  },
                  {
                    title: 'Detection Rate',
                    value: '96.2%',
                    change: '+2.1%',
                    icon: FaStethoscope,
                    color: 'from-red-500 to-red-600',
                    bgColor: 'from-white to-red-50/30',
                    borderColor: 'border-red-100/50'
                  }
                ].map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-gray-500 text-sm font-medium">{stat.title}</div>
                        <div className="text-gray-900 text-3xl font-bold">{stat.value}</div>
                      </div>
                      <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <stat.icon className="text-white text-xl" />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FaArrowUp className="text-green-600 text-sm mr-2" />
                      <span className="text-green-600 text-sm font-semibold">{stat.change}</span>
                      <span className="text-gray-500 text-sm ml-2">this month</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Minimal Charts Grid */}
              <div className="grid grid-cols-12 gap-4 mb-6">

                {/* Disease Trends - Small Chart */}
                <div className="col-span-6 bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-gray-900 text-sm font-medium flex items-center">
                        <FaBrain className="text-blue-600 mr-2 text-sm" />
                        Disease Trends
                      </h3>
                      <p className="text-gray-500 text-xs">Monthly case progression</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs">2024</button>
                      <button className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">2023</button>
                    </div>
                  </div>
                  <div className="h-48">
                    <Line data={diseaseData} options={chartOptions} />
                  </div>
                </div>

                {/* AI Performance */}
                <div className="col-span-6 bg-white rounded border border-gray-200 p-4">
                  <div className="mb-3">
                    <h3 className="text-gray-900 text-sm font-medium flex items-center">
                      <FaChartLine className="text-green-600 mr-2 text-sm" />
                      AI Accuracy
                    </h3>
                    <p className="text-gray-500 text-xs">Weekly diagnostic precision</p>
                    <div className="mt-2 flex items-center">
                      <div className="text-lg font-semibold text-gray-900">97.2%</div>
                      <div className="ml-2 text-green-600 text-xs">+2.1%</div>
                    </div>
                  </div>
                  <div className="h-48">
                    <Line data={aiPerformanceData} options={chartOptions} />
                  </div>
                </div>
              </div>

              {/* Enhanced Bottom Section */}
              <div className="grid grid-cols-12 gap-6">

                {/* Enhanced Recent Activity */}
                <div className="col-span-8 bg-white rounded-xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-gray-900 text-lg font-semibold flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                        <FaChartLine className="text-white text-sm" />
                      </div>
                      Recent Activity
                    </h3>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium bg-blue-50 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors">View All</button>
                  </div>

                  <div className="space-y-3">
                    {[
                      { user: 'Dr. Sarah Johnson', action: 'detected early-stage Alzheimer\'s', time: '2 min ago', type: 'diagnosis' },
                      { user: 'AI System', action: 'flagged potential epilepsy case', time: '5 min ago', type: 'ai' },
                      { user: 'Dr. Michael Chen', action: 'confirmed Parkinson\'s diagnosis', time: '10 min ago', type: 'review' },
                      { user: 'Patient #1247', action: 'completed neurological assessment', time: '15 min ago', type: 'user' },
                      { user: 'Dr. Lisa Wang', action: 'uploaded brain MRI scan', time: '25 min ago', type: 'upload' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${activity.type === 'upload' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' :
                          activity.type === 'user' ? 'bg-gradient-to-br from-green-500 to-green-600 text-white' :
                            activity.type === 'ai' ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white' :
                              activity.type === 'review' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white' :
                                activity.type === 'diagnosis' ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' :
                                  'bg-gradient-to-br from-gray-500 to-gray-600 text-white'
                          }`}>
                          {activity.type === 'upload' ? <FaUpload className="text-sm" /> :
                            activity.type === 'user' ? <FaUser className="text-sm" /> :
                              activity.type === 'ai' ? <FaBrain className="text-sm" /> :
                                activity.type === 'review' ? <FaStethoscope className="text-sm" /> :
                                  activity.type === 'diagnosis' ? <FaEye className="text-sm" /> :
                                    <FaCog className="text-sm" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-gray-900 text-sm font-semibold">{activity.user}</div>
                          <div className="text-gray-600 text-sm">{activity.action}</div>
                        </div>
                        <div className="text-gray-400 text-sm font-medium bg-gray-100 px-2 py-1 rounded-md">{activity.time}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enhanced System Status */}
                <div className="col-span-4 bg-white rounded-xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="text-gray-900 text-lg font-semibold mb-6 flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-md">
                      <FaCog className="text-white text-sm" />
                    </div>
                    System Status
                  </h3>

                  <div className="space-y-4">
                    {[
                      { service: 'AI Processing', status: 'online', uptime: '99.9%', icon: FaBrain, bgColor: 'from-green-500 to-green-600' },
                      { service: 'Database', status: 'online', uptime: '99.8%', icon: FaFileAlt, bgColor: 'from-blue-500 to-blue-600' },
                      { service: 'File Storage', status: 'online', uptime: '99.7%', icon: FaUpload, bgColor: 'from-purple-500 to-purple-600' },
                      { service: 'Authentication', status: 'online', uptime: '100%', icon: FaUser, bgColor: 'from-cyan-500 to-cyan-600' },
                      { service: 'Notifications', status: 'maintenance', uptime: '95.2%', icon: FaBell, bgColor: 'from-yellow-500 to-yellow-600' }
                    ].map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 bg-gradient-to-br ${service.bgColor} rounded-lg flex items-center justify-center shadow-md`}>
                            <service.icon className="text-white text-sm" />
                          </div>
                          <div>
                            <div className="text-gray-900 text-sm font-semibold">{service.service}</div>
                            <div className={`text-xs font-medium ${service.status === 'online' ? 'text-green-600' :
                              service.status === 'maintenance' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                              {service.status.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-600 text-sm font-semibold bg-gray-100 px-2 py-1 rounded-md">{service.uptime}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* User Management Page */}
          {activeTab === 'users' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">User Management</h1>
                <p className="text-gray-600 text-sm">Manage user roles and permissions across the NeuroCare AI system</p>
              </div>

              {/* User Statistics Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Total Users</div>
                      <div className="text-gray-900 text-xl font-semibold">{users.length}</div>
                    </div>
                    <FaUsers className="text-blue-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Admins</div>
                      <div className="text-gray-900 text-xl font-semibold">
                        {users.filter(u => u.role === 'admin').length}
                      </div>
                    </div>
                    <FaShieldAlt className="text-red-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Doctors</div>
                      <div className="text-gray-900 text-xl font-semibold">
                        {users.filter(u => u.role === 'doctor').length}
                      </div>
                    </div>
                    <FaUserMd className="text-green-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Patients</div>
                      <div className="text-gray-900 text-xl font-semibold">
                        {users.filter(u => u.role === 'patient').length}
                      </div>
                    </div>
                    <FaUser className="text-purple-600 text-lg" />
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900 text-lg font-semibold">All Users</h3>
                  <button
                    onClick={fetchUsers}
                    disabled={loading}
                    className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading users...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Created</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                                  <FaUser className="text-white text-xs" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                                  <div className="text-gray-500 text-xs">ID: {user._id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-700">{user.email}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                user.role === 'doctor' ? 'bg-green-100 text-green-800' :
                                  user.role === 'patient' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-500 text-xs">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={user.role}
                                onChange={(e) => updateUserRole(user._id, e.target.value)}
                                className="border border-gray-200 rounded text-xs px-2 py-1 bg-white"
                              >
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Doctor Registration Requests Page */}
          {/* doctor-requests moved to separate page */ false && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Doctor Registration Management</h1>
                <p className="text-gray-600 text-sm">Review and approve medical professional access requests to NeuroCare AI system</p>
              </div>

              {/* Dynamic Request Statistics Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Pending Requests</div>
                      <div className="text-gray-900 text-xl font-semibold">
                        {allDoctors.filter(d => d.status === 'pending').length}
                      </div>
                    </div>
                    <FaUserMd className="text-yellow-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Approved</div>
                      <div className="text-gray-900 text-xl font-semibold">
                        {allDoctors.filter(d => d.status === 'approved').length}
                      </div>
                    </div>
                    <FaCheck className="text-green-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Under Review</div>
                      <div className="text-gray-900 text-xl font-semibold">
                        {allDoctors.filter(d => d.status === 'under-review').length}
                      </div>
                    </div>
                    <FaEye className="text-blue-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Total Requests</div>
                      <div className="text-gray-900 text-xl font-semibold">{allDoctors.length}</div>
                    </div>
                    <FaUsers className="text-purple-600 text-lg" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded border border-gray-200 p-4">
                {/* Enhanced Header with Functional Filters */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-gray-900 text-sm font-medium">Registration Requests</h3>
                    <select
                      className="border border-gray-200 rounded text-sm px-3 py-1"
                      value={doctorFilters.specialization}
                      onChange={(e) => handleDoctorFilterChange('specialization', e.target.value)}
                    >
                      <option>All Specializations</option>
                      <option>Neurologist</option>
                      <option>Neurosurgeon</option>
                      <option>Psychiatrist</option>
                      <option>Radiologist</option>
                      <option>Researcher</option>
                      <option>Pediatric Neurologist</option>
                    </select>
                    <select
                      className="border border-gray-200 rounded text-sm px-3 py-1"
                      value={doctorFilters.status}
                      onChange={(e) => handleDoctorFilterChange('status', e.target.value)}
                    >
                      <option>All Status</option>
                      <option>Pending</option>
                      <option>Under Review</option>
                      <option>Approved</option>
                      <option>Denied</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Search by name, email, or license..."
                      className="px-3 py-2 border border-gray-200 rounded text-sm w-64"
                      value={doctorFilters.search}
                      onChange={(e) => handleDoctorFilterChange('search', e.target.value)}
                    />
                    <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                      Invite Doctor
                    </button>
                    <button className="bg-gray-600 text-white text-sm px-4 py-2 rounded hover:bg-gray-700 transition-colors">
                      Export Report
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-gray-600">
                          <input type="checkbox" className="rounded" />
                        </th>
                        <th className="text-left py-3 text-gray-600">Doctor Information</th>
                        <th className="text-left py-3 text-gray-600">Credentials</th>
                        <th className="text-left py-3 text-gray-600">Institution</th>
                        <th className="text-left py-3 text-gray-600">Experience</th>
                        <th className="text-left py-3 text-gray-600">Request Details</th>
                        <th className="text-left py-3 text-gray-600">Verification</th>
                        <th className="text-left py-3 text-gray-600">Status</th>
                        <th className="text-left py-3 text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDoctors.map((doctor, index) => (
                        <tr key={doctor.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3">
                            <input type="checkbox" className="rounded" />
                          </td>
                          <td className="py-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <FaUserMd className="text-blue-600 text-sm" />
                              </div>
                              <div>
                                <div className="text-gray-900 font-medium">{doctor.name}</div>
                                <div className="text-gray-500 text-xs">{doctor.email}</div>
                                <div className="text-gray-500 text-xs">{doctor.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div>
                              <div className="text-gray-900 text-sm font-medium">{doctor.license}</div>
                              <div className="text-gray-600 text-xs">{doctor.specialization}</div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div>
                              <div className="text-gray-900 text-sm">{doctor.hospital}</div>
                              <div className="text-gray-600 text-xs">{doctor.department}</div>
                            </div>
                          </td>
                          <td className="py-3 text-gray-600">{doctor.experience}</td>
                          <td className="py-3">
                            <div>
                              <div className="text-gray-900 text-xs">{doctor.requestDate}</div>
                              <div className="text-gray-500 text-xs">{doctor.requestTime}</div>
                              <span className={`text-xs px-1 py-0.5 rounded ${doctor.priority === 'high' ? 'bg-red-100 text-red-600' :
                                doctor.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-green-100 text-green-600'
                                }`}>
                                {doctor.priority.toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div>
                              <span className={`text-xs px-2 py-1 rounded-full ${doctor.verification === 'verified' ? 'bg-green-100 text-green-600' :
                                'bg-yellow-100 text-yellow-600'
                                }`}>
                                {doctor.verification.toUpperCase()}
                              </span>
                              <div className="text-gray-500 text-xs mt-1">
                                {doctor.documents.length} docs
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${doctor.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                              doctor.status === 'under-review' ? 'bg-blue-100 text-blue-600' :
                                doctor.status === 'approved' ? 'bg-green-100 text-green-600' :
                                  'bg-red-100 text-red-600'
                              }`}>
                              {doctor.status.replace('-', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center space-x-1">
                              <button className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700 transition-colors">
                                Approve
                              </button>
                              <button className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700 transition-colors">
                                Deny
                              </button>
                              <button className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700 transition-colors">
                                Review
                              </button>
                              <button className="bg-purple-600 text-white text-xs px-2 py-1 rounded hover:bg-purple-700 transition-colors">
                                Contact
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Enhanced Footer with Bulk Actions */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-gray-500 text-xs">
                      Showing {filteredDoctors.length} of {allDoctors.length} requests
                      {doctorFilters.specialization !== 'All Specializations' ||
                        doctorFilters.status !== 'All Status' ||
                        doctorFilters.search !== '' ? ' (filtered)' : ''}
                    </div>
                    <select className="border border-gray-200 rounded text-xs px-2 py-1">
                      <option>10 per page</option>
                      <option>25 per page</option>
                      <option>50 per page</option>
                    </select>
                    {(doctorFilters.specialization !== 'All Specializations' ||
                      doctorFilters.status !== 'All Status' ||
                      doctorFilters.search !== '') && (
                        <button
                          onClick={() => setDoctorFilters({
                            specialization: 'All Specializations',
                            status: 'All Status',
                            search: ''
                          })}
                          className="text-blue-600 hover:text-blue-700 text-xs underline"
                        >
                          Clear Filters
                        </button>
                      )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="bg-green-600 text-white text-xs px-4 py-2 rounded hover:bg-green-700 transition-colors">
                      Approve Selected
                    </button>
                    <button className="bg-red-600 text-white text-xs px-4 py-2 rounded hover:bg-red-700 transition-colors">
                      Deny Selected
                    </button>
                    <button className="bg-blue-600 text-white text-xs px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                      Send Reminder
                    </button>
                    <button className="bg-gray-600 text-white text-xs px-4 py-2 rounded hover:bg-gray-700 transition-colors">
                      Export Selected
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Patient List Page */}
          {activeTab === 'patient-list' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Patient Management</h1>
                <p className="text-gray-600 text-sm">Comprehensive patient database and management system</p>
              </div>

              {/* Patient Statistics Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Total Patients</div>
                      <div className="text-gray-900 text-xl font-semibold">1,247</div>
                    </div>
                    <FaUsers className="text-blue-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Critical Cases</div>
                      <div className="text-gray-900 text-xl font-semibold">23</div>
                    </div>
                    <FaStethoscope className="text-red-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">New This Week</div>
                      <div className="text-gray-900 text-xl font-semibold">15</div>
                    </div>
                    <FaUser className="text-green-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Scheduled Today</div>
                      <div className="text-gray-900 text-xl font-semibold">8</div>
                    </div>
                    <FaCalendarAlt className="text-purple-600 text-lg" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded border border-gray-200 p-4">
                {/* Enhanced Header with Filters */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-gray-900 text-sm font-medium">Patient Database</h3>
                    <select className="border border-gray-200 rounded text-sm px-3 py-1">
                      <option>All Conditions</option>
                      <option>Alzheimer's</option>
                      <option>Epilepsy</option>
                      <option>Parkinson's</option>
                      <option>Multiple Sclerosis</option>
                      <option>Stroke</option>
                    </select>
                    <select className="border border-gray-200 rounded text-sm px-3 py-1">
                      <option>All Status</option>
                      <option>Critical</option>
                      <option>Stable</option>
                      <option>Monitoring</option>
                      <option>Recovering</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Search by name, ID, or condition..."
                      className="px-3 py-2 border border-gray-200 rounded text-sm w-64"
                    />
                    <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                      Add New Patient
                    </button>
                    <button className="bg-gray-600 text-white text-sm px-4 py-2 rounded hover:bg-gray-700 transition-colors">
                      Export Data
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 text-gray-600">
                          <input type="checkbox" className="rounded" />
                        </th>
                        <th className="text-left py-3 text-gray-600">Patient Info</th>
                        <th className="text-left py-3 text-gray-600">Age/Gender</th>
                        <th className="text-left py-3 text-gray-600">Primary Condition</th>
                        <th className="text-left py-3 text-gray-600">Attending Doctor</th>
                        <th className="text-left py-3 text-gray-600">Status</th>
                        <th className="text-left py-3 text-gray-600">Last Visit</th>
                        <th className="text-left py-3 text-gray-600">Next Appointment</th>
                        <th className="text-left py-3 text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          id: 'P001',
                          name: 'John Smith',
                          age: 68,
                          gender: 'M',
                          condition: 'Alzheimer\'s Disease',
                          doctor: 'Dr. Sarah Johnson',
                          status: 'critical',
                          lastVisit: '2024-01-15',
                          nextAppointment: '2024-01-22',
                          phone: '+1 (555) 123-4567'
                        },
                        {
                          id: 'P002',
                          name: 'Sarah Johnson',
                          age: 45,
                          gender: 'F',
                          condition: 'Epilepsy',
                          doctor: 'Dr. Michael Chen',
                          status: 'stable',
                          lastVisit: '2024-01-14',
                          nextAppointment: '2024-02-14',
                          phone: '+1 (555) 234-5678'
                        },
                        {
                          id: 'P003',
                          name: 'Michael Chen',
                          age: 72,
                          gender: 'M',
                          condition: 'Parkinson\'s Disease',
                          doctor: 'Dr. Emily Rodriguez',
                          status: 'monitoring',
                          lastVisit: '2024-01-13',
                          nextAppointment: '2024-01-27',
                          phone: '+1 (555) 345-6789'
                        },
                        {
                          id: 'P004',
                          name: 'Emily Davis',
                          age: 38,
                          gender: 'F',
                          condition: 'Multiple Sclerosis',
                          doctor: 'Dr. James Wilson',
                          status: 'stable',
                          lastVisit: '2024-01-12',
                          nextAppointment: '2024-02-12',
                          phone: '+1 (555) 456-7890'
                        },
                        {
                          id: 'P005',
                          name: 'Robert Wilson',
                          age: 55,
                          gender: 'M',
                          condition: 'Stroke Recovery',
                          doctor: 'Dr. Lisa Wang',
                          status: 'recovering',
                          lastVisit: '2024-01-11',
                          nextAppointment: '2024-01-18',
                          phone: '+1 (555) 567-8901'
                        },
                        {
                          id: 'P006',
                          name: 'Maria Garcia',
                          age: 62,
                          gender: 'F',
                          condition: 'Migraine Disorder',
                          doctor: 'Dr. David Kim',
                          status: 'stable',
                          lastVisit: '2024-01-10',
                          nextAppointment: '2024-02-10',
                          phone: '+1 (555) 678-9012'
                        },
                        {
                          id: 'P007',
                          name: 'James Brown',
                          age: 59,
                          gender: 'M',
                          condition: 'Brain Tumor',
                          doctor: 'Dr. Sarah Johnson',
                          status: 'critical',
                          lastVisit: '2024-01-09',
                          nextAppointment: '2024-01-16',
                          phone: '+1 (555) 789-0123'
                        },
                        {
                          id: 'P008',
                          name: 'Linda Taylor',
                          age: 41,
                          gender: 'F',
                          condition: 'Epilepsy',
                          doctor: 'Dr. Michael Chen',
                          status: 'monitoring',
                          lastVisit: '2024-01-08',
                          nextAppointment: '2024-01-29',
                          phone: '+1 (555) 890-1234'
                        }
                      ].map((patient, index) => (
                        <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3">
                            <input type="checkbox" className="rounded" />
                          </td>
                          <td className="py-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-xs font-medium">
                                  {patient.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <div className="text-gray-900 font-medium">{patient.name}</div>
                                <div className="text-gray-500 text-xs">{patient.id} • {patient.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-gray-600">{patient.age}Y / {patient.gender}</td>
                          <td className="py-3 text-gray-600">{patient.condition}</td>
                          <td className="py-3 text-gray-600">{patient.doctor}</td>
                          <td className="py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${patient.status === 'critical' ? 'bg-red-100 text-red-600' :
                              patient.status === 'stable' ? 'bg-green-100 text-green-600' :
                                patient.status === 'monitoring' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-blue-100 text-blue-600'
                              }`}>
                              {patient.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 text-gray-600">{patient.lastVisit}</td>
                          <td className="py-3 text-gray-600">{patient.nextAppointment}</td>
                          <td className="py-3">
                            <div className="flex items-center space-x-1">
                              <button className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700 transition-colors">
                                View
                              </button>
                              <button className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700 transition-colors">
                                Edit
                              </button>
                              <button className="bg-purple-600 text-white text-xs px-2 py-1 rounded hover:bg-purple-700 transition-colors">
                                Schedule
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Enhanced Footer with Pagination */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-gray-500 text-xs">
                      Showing 8 of 1,247 patients
                    </div>
                    <select className="border border-gray-200 rounded text-xs px-2 py-1">
                      <option>10 per page</option>
                      <option>25 per page</option>
                      <option>50 per page</option>
                      <option>100 per page</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="border border-gray-200 text-gray-600 text-xs px-3 py-1 rounded hover:bg-gray-50 transition-colors">
                      Previous
                    </button>
                    <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded">1</button>
                    <button className="border border-gray-200 text-gray-600 text-xs px-3 py-1 rounded hover:bg-gray-50 transition-colors">2</button>
                    <button className="border border-gray-200 text-gray-600 text-xs px-3 py-1 rounded hover:bg-gray-50 transition-colors">3</button>
                    <span className="text-gray-400 text-xs">...</span>
                    <button className="border border-gray-200 text-gray-600 text-xs px-3 py-1 rounded hover:bg-gray-50 transition-colors">125</button>
                    <button className="border border-gray-200 text-gray-600 text-xs px-3 py-1 rounded hover:bg-gray-50 transition-colors">
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Patient Records Page */}
          {activeTab === 'patient-records' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Patient Medical Records</h1>
                <p className="text-gray-600 text-sm">Comprehensive medical history and diagnostic records management</p>
              </div>

              {/* Records Statistics */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Total Records</div>
                      <div className="text-gray-900 text-xl font-semibold">3,247</div>
                    </div>
                    <FaFileAlt className="text-blue-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">New Today</div>
                      <div className="text-gray-900 text-xl font-semibold">12</div>
                    </div>
                    <FaUpload className="text-green-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Critical Findings</div>
                      <div className="text-gray-900 text-xl font-semibold">8</div>
                    </div>
                    <FaStethoscope className="text-red-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Pending Review</div>
                      <div className="text-gray-900 text-xl font-semibold">23</div>
                    </div>
                    <FaEye className="text-yellow-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">AI Analyzed</div>
                      <div className="text-gray-900 text-xl font-semibold">156</div>
                    </div>
                    <FaBrain className="text-purple-600 text-lg" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8 bg-white rounded border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-gray-900 text-lg font-semibold">Recent Medical Records</h3>
                    <div className="flex items-center space-x-2">
                      <select className="border border-gray-200 rounded text-sm px-3 py-1">
                        <option>All Record Types</option>
                        <option>MRI Scans</option>
                        <option>EEG Analysis</option>
                        <option>Blood Tests</option>
                        <option>Consultations</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Search records..."
                        className="px-3 py-1 border border-gray-200 rounded text-sm w-48"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        id: 'R001',
                        patient: 'John Smith',
                        patientId: 'P001',
                        record: 'MRI Brain Scan - Early stage Alzheimer\'s pathology detected with 94.2% AI confidence',
                        type: 'MRI Scan',
                        date: '2024-01-15',
                        time: '10:30 AM',
                        doctor: 'Dr. Sarah Johnson',
                        status: 'critical',
                        aiAnalysis: true,
                        confidence: '94.2%'
                      },
                      {
                        id: 'R002',
                        patient: 'Sarah Johnson',
                        patientId: 'P002',
                        record: 'EEG Analysis - Temporal lobe epilepsy patterns identified, medication adjustment recommended',
                        type: 'EEG Analysis',
                        date: '2024-01-14',
                        time: '02:15 PM',
                        doctor: 'Dr. Michael Chen',
                        status: 'stable',
                        aiAnalysis: true,
                        confidence: '87.5%'
                      },
                      {
                        id: 'R003',
                        patient: 'Michael Chen',
                        patientId: 'P003',
                        record: 'DaTscan Results - Parkinson\'s disease progression stable, current treatment effective',
                        type: 'DaTscan',
                        date: '2024-01-13',
                        time: '09:45 AM',
                        doctor: 'Dr. Emily Rodriguez',
                        status: 'monitoring',
                        aiAnalysis: true,
                        confidence: '91.8%'
                      },
                      {
                        id: 'R004',
                        patient: 'Emily Davis',
                        patientId: 'P004',
                        record: 'MRI Brain Scan - Multiple Sclerosis lesion count decreased, treatment showing positive response',
                        type: 'MRI Scan',
                        date: '2024-01-12',
                        time: '11:20 AM',
                        doctor: 'Dr. James Wilson',
                        status: 'improving',
                        aiAnalysis: true,
                        confidence: '89.3%'
                      },
                      {
                        id: 'R005',
                        patient: 'Robert Wilson',
                        patientId: 'P005',
                        record: 'Neurological Consultation - Post-stroke cognitive assessment, rehabilitation progress noted',
                        type: 'Consultation',
                        date: '2024-01-11',
                        time: '03:30 PM',
                        doctor: 'Dr. Lisa Wang',
                        status: 'recovering',
                        aiAnalysis: false,
                        confidence: null
                      }
                    ].map((record, index) => (
                      <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaFileAlt className="text-blue-600 text-sm" />
                            </div>
                            <div>
                              <div className="text-gray-900 font-semibold">{record.patient} ({record.patientId})</div>
                              <div className="text-gray-500 text-sm">{record.type} • {record.date} at {record.time}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {record.aiAnalysis && (
                              <div className="flex items-center space-x-1 bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs">
                                <FaBrain className="text-xs" />
                                <span>AI: {record.confidence}</span>
                              </div>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${record.status === 'critical' ? 'bg-red-100 text-red-600' :
                              record.status === 'stable' ? 'bg-green-100 text-green-600' :
                                record.status === 'monitoring' ? 'bg-yellow-100 text-yellow-600' :
                                  record.status === 'improving' ? 'bg-blue-100 text-blue-600' :
                                    'bg-gray-100 text-gray-600'
                              }`}>
                              {record.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="text-gray-700 text-sm mb-3 leading-relaxed">{record.record}</div>
                        <div className="flex items-center justify-between">
                          <div className="text-gray-500 text-xs">Attending: {record.doctor}</div>
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">View Details</button>
                            <button className="text-green-600 hover:text-green-700 text-xs font-medium">Download</button>
                            <button className="text-purple-600 hover:text-purple-700 text-xs font-medium">Share</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-4 space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-white rounded border border-gray-200 p-4">
                    <h3 className="text-gray-900 text-sm font-medium mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-blue-600 text-white text-sm py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                        <FaUpload className="text-sm" />
                        <span>Upload New Record</span>
                      </button>
                      <button className="w-full bg-green-600 text-white text-sm py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                        <FaFileAlt className="text-sm" />
                        <span>Generate Report</span>
                      </button>
                      <button className="w-full bg-purple-600 text-white text-sm py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                        <FaBrain className="text-sm" />
                        <span>AI Analysis</span>
                      </button>
                      <button className="w-full bg-gray-600 text-white text-sm py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                        <FaDownload className="text-sm" />
                        <span>Export Data</span>
                      </button>
                    </div>
                  </div>

                  {/* Record Types Distribution */}
                  <div className="bg-white rounded border border-gray-200 p-4">
                    <h3 className="text-gray-900 text-sm font-medium mb-4">Record Types</h3>
                    <div className="space-y-3">
                      {[
                        { type: 'MRI Scans', count: 1247, color: 'bg-blue-500' },
                        { type: 'EEG Analysis', count: 892, color: 'bg-green-500' },
                        { type: 'Blood Tests', count: 634, color: 'bg-yellow-500' },
                        { type: 'Consultations', count: 474, color: 'bg-purple-500' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                            <span className="text-gray-700 text-sm">{item.type}</span>
                          </div>
                          <span className="text-gray-900 font-medium text-sm">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded border border-gray-200 p-4">
                    <h3 className="text-gray-900 text-sm font-medium mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {[
                        { action: 'Record uploaded', user: 'Dr. Sarah Johnson', time: '5 min ago' },
                        { action: 'AI analysis completed', user: 'System', time: '12 min ago' },
                        { action: 'Report generated', user: 'Dr. Michael Chen', time: '1 hour ago' }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <div className="text-gray-900 text-xs">{activity.action}</div>
                            <div className="text-gray-500 text-xs">{activity.user} • {activity.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Neuroimaging Page */}
          {activeTab === 'uploaded-mris' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Neuroimaging Center</h1>
                <p className="text-gray-600 text-sm">Advanced brain imaging analysis and AI-powered diagnostics</p>
              </div>

              {/* Imaging Statistics */}
              <div className="grid grid-cols-6 gap-4 mb-6">
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Total Scans</div>
                      <div className="text-gray-900 text-xl font-semibold">1,247</div>
                    </div>
                    <FaBrain className="text-blue-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Today</div>
                      <div className="text-gray-900 text-xl font-semibold">89</div>
                    </div>
                    <FaUpload className="text-green-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Processing</div>
                      <div className="text-gray-900 text-xl font-semibold">12</div>
                    </div>
                    <FaCog className="text-yellow-600 text-lg animate-spin" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Abnormalities</div>
                      <div className="text-gray-900 text-xl font-semibold">23</div>
                    </div>
                    <FaStethoscope className="text-red-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">AI Accuracy</div>
                      <div className="text-gray-900 text-xl font-semibold">97.2%</div>
                    </div>
                    <FaEye className="text-purple-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Queue</div>
                      <div className="text-gray-900 text-xl font-semibold">5</div>
                    </div>
                    <FaCalendarAlt className="text-gray-600 text-lg" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8 bg-white rounded border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-gray-900 text-lg font-semibold">Recent Brain Scans</h3>
                    <div className="flex items-center space-x-2">
                      <select className="border border-gray-200 rounded text-sm px-3 py-1">
                        <option>All Scan Types</option>
                        <option>MRI Brain</option>
                        <option>EEG</option>
                        <option>DaTscan</option>
                        <option>CT Scan</option>
                        <option>PET Scan</option>
                      </select>
                      <select className="border border-gray-200 rounded text-sm px-3 py-1">
                        <option>All Status</option>
                        <option>Analyzed</option>
                        <option>Processing</option>
                        <option>Pending</option>
                        <option>Failed</option>
                      </select>
                      <button className="bg-blue-600 text-white text-sm px-4 py-1 rounded hover:bg-blue-700 transition-colors">
                        Upload New Scan
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        id: 'MRI001',
                        patient: 'John Smith',
                        patientId: 'P001',
                        type: 'Brain MRI',
                        date: '2024-01-15',
                        time: '10:30 AM',
                        status: 'analyzed',
                        aiConfidence: '94.2%',
                        findings: 'Early Alzheimer\'s detected',
                        priority: 'high',
                        size: '245 MB'
                      },
                      {
                        id: 'MRI002',
                        patient: 'Sarah Johnson',
                        patientId: 'P002',
                        type: 'EEG Scan',
                        date: '2024-01-14',
                        time: '02:15 PM',
                        status: 'processing',
                        aiConfidence: null,
                        findings: 'Analysis in progress...',
                        priority: 'medium',
                        size: '89 MB'
                      },
                      {
                        id: 'MRI003',
                        patient: 'Michael Chen',
                        patientId: 'P003',
                        type: 'DaTscan',
                        date: '2024-01-13',
                        time: '09:45 AM',
                        status: 'analyzed',
                        aiConfidence: '91.8%',
                        findings: 'Parkinson\'s confirmed',
                        priority: 'high',
                        size: '156 MB'
                      },
                      {
                        id: 'MRI004',
                        patient: 'Emily Davis',
                        patientId: 'P004',
                        type: 'Brain MRI',
                        date: '2024-01-12',
                        time: '11:20 AM',
                        status: 'pending',
                        aiConfidence: null,
                        findings: 'Awaiting analysis',
                        priority: 'low',
                        size: '298 MB'
                      },
                      {
                        id: 'MRI005',
                        patient: 'Robert Wilson',
                        patientId: 'P005',
                        type: 'CT Scan',
                        date: '2024-01-11',
                        time: '03:30 PM',
                        status: 'analyzed',
                        aiConfidence: '88.7%',
                        findings: 'Post-stroke changes',
                        priority: 'medium',
                        size: '134 MB'
                      },
                      {
                        id: 'MRI006',
                        patient: 'Maria Garcia',
                        patientId: 'P006',
                        type: 'PET Scan',
                        date: '2024-01-10',
                        time: '01:45 PM',
                        status: 'processing',
                        aiConfidence: null,
                        findings: 'Processing...',
                        priority: 'high',
                        size: '412 MB'
                      }
                    ].map((scan, index) => (
                      <div key={scan.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg h-32 mb-3 flex items-center justify-center overflow-hidden">
                          <FaBrain className="text-gray-400 text-3xl" />
                          {scan.priority === 'high' && (
                            <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          )}
                          {scan.status === 'processing' && (
                            <div className="absolute inset-0 bg-blue-500 bg-opacity-10 flex items-center justify-center">
                              <FaCog className="text-blue-500 text-lg animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-gray-900 font-semibold text-sm">{scan.patient}</div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${scan.status === 'analyzed' ? 'bg-green-100 text-green-600' :
                              scan.status === 'processing' ? 'bg-yellow-100 text-yellow-600' :
                                scan.status === 'pending' ? 'bg-gray-100 text-gray-600' :
                                  'bg-red-100 text-red-600'
                              }`}>
                              {scan.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="text-gray-500 text-xs">{scan.patientId} • {scan.type}</div>
                          <div className="text-gray-600 text-xs">{scan.date} at {scan.time}</div>

                          {scan.aiConfidence && (
                            <div className="flex items-center space-x-1 text-xs">
                              <FaBrain className="text-purple-600" />
                              <span className="text-purple-600 font-medium">AI: {scan.aiConfidence}</span>
                            </div>
                          )}

                          <div className="text-gray-700 text-xs font-medium">{scan.findings}</div>
                          <div className="text-gray-400 text-xs">{scan.size}</div>

                          <div className="flex items-center space-x-1 pt-2">
                            <button className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700 transition-colors">
                              View
                            </button>
                            <button className="bg-green-600 text-white text-xs px-2 py-1 rounded hover:bg-green-700 transition-colors">
                              Download
                            </button>
                            {scan.status === 'analyzed' && (
                              <button className="bg-purple-600 text-white text-xs px-2 py-1 rounded hover:bg-purple-700 transition-colors">
                                Report
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-4 space-y-6">
                  {/* AI Analysis Tools */}
                  <div className="bg-white rounded border border-gray-200 p-4">
                    <h3 className="text-gray-900 text-sm font-medium mb-4">AI Analysis Tools</h3>
                    <div className="space-y-3">
                      <button className="w-full bg-purple-600 text-white text-sm py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                        <FaBrain className="text-sm" />
                        <span>Run AI Analysis</span>
                      </button>
                      <button className="w-full bg-blue-600 text-white text-sm py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                        <FaUpload className="text-sm" />
                        <span>Batch Upload</span>
                      </button>
                      <button className="w-full bg-green-600 text-white text-sm py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                        <FaFileAlt className="text-sm" />
                        <span>Generate Report</span>
                      </button>
                      <button className="w-full bg-gray-600 text-white text-sm py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                        <FaDownload className="text-sm" />
                        <span>Export Results</span>
                      </button>
                    </div>
                  </div>

                  {/* Scan Types Distribution */}
                  <div className="bg-white rounded border border-gray-200 p-4">
                    <h3 className="text-gray-900 text-sm font-medium mb-4">Scan Types Today</h3>
                    <div className="space-y-3">
                      {[
                        { type: 'MRI Brain', count: 45, color: 'bg-blue-500', percentage: 51 },
                        { type: 'EEG', count: 23, color: 'bg-green-500', percentage: 26 },
                        { type: 'CT Scan', count: 12, color: 'bg-yellow-500', percentage: 13 },
                        { type: 'DaTscan', count: 6, color: 'bg-purple-500', percentage: 7 },
                        { type: 'PET Scan', count: 3, color: 'bg-red-500', percentage: 3 }
                      ].map((item, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                              <span className="text-gray-700 text-sm">{item.type}</span>
                            </div>
                            <span className="text-gray-900 font-medium text-sm">{item.count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div className={`${item.color} h-1.5 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Processing Queue */}
                  <div className="bg-white rounded border border-gray-200 p-4">
                    <h3 className="text-gray-900 text-sm font-medium mb-4">Processing Queue</h3>
                    <div className="space-y-3">
                      {[
                        { patient: 'Sarah Johnson', type: 'EEG', progress: 75, eta: '2 min' },
                        { patient: 'Maria Garcia', type: 'PET Scan', progress: 45, eta: '8 min' },
                        { patient: 'David Kim', type: 'MRI Brain', progress: 20, eta: '15 min' }
                      ].map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-gray-900 text-sm font-medium">{item.patient}</div>
                              <div className="text-gray-500 text-xs">{item.type}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-gray-900 text-sm font-medium">{item.progress}%</div>
                              <div className="text-gray-500 text-xs">ETA: {item.eta}</div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${item.progress}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Reports Page */}
          {activeTab === 'reports' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Medical Reports & Analytics</h1>
                <p className="text-gray-600 text-sm">Comprehensive reporting system for medical data analysis and insights</p>
              </div>

              {/* Reports Statistics */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Total Reports</div>
                      <div className="text-gray-900 text-xl font-semibold">247</div>
                    </div>
                    <FaFileAlt className="text-blue-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Generated Today</div>
                      <div className="text-gray-900 text-xl font-semibold">8</div>
                    </div>
                    <FaChartLine className="text-green-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Scheduled</div>
                      <div className="text-gray-900 text-xl font-semibold">12</div>
                    </div>
                    <FaCalendarAlt className="text-yellow-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Downloads</div>
                      <div className="text-gray-900 text-xl font-semibold">156</div>
                    </div>
                    <FaDownload className="text-purple-600 text-lg" />
                  </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-gray-500 text-xs">Shared</div>
                      <div className="text-gray-900 text-xl font-semibold">89</div>
                    </div>
                    <FaUsers className="text-cyan-600 text-lg" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-8 bg-white rounded border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-gray-900 text-lg font-semibold">Generated Reports</h3>
                    <div className="flex items-center space-x-2">
                      <select className="border border-gray-200 rounded text-sm px-3 py-1">
                        <option>All Categories</option>
                        <option>Analytics</option>
                        <option>Performance</option>
                        <option>Disease-Specific</option>
                        <option>Summary</option>
                        <option>Technical</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Search reports..."
                        className="px-3 py-1 border border-gray-200 rounded text-sm w-48"
                      />
                      <button className="bg-blue-600 text-white text-sm px-4 py-1 rounded hover:bg-blue-700 transition-colors">
                        Generate New
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        id: 'RPT001',
                        title: 'Monthly Neurological Disease Analysis',
                        description: 'Comprehensive analysis of disease patterns and trends across all patient demographics',
                        type: 'Analytics',
                        date: '2024-01-15',
                        time: '09:30 AM',
                        size: '2.4 MB',
                        author: 'Dr. Sarah Johnson',
                        downloads: 45,
                        status: 'completed',
                        priority: 'high'
                      },
                      {
                        id: 'RPT002',
                        title: 'Patient Outcome Summary - Q4 2023',
                        description: 'Quarterly review of patient treatment outcomes and recovery statistics',
                        type: 'Summary',
                        date: '2024-01-10',
                        time: '02:15 PM',
                        size: '1.8 MB',
                        author: 'Dr. Michael Chen',
                        downloads: 32,
                        status: 'completed',
                        priority: 'medium'
                      },
                      {
                        id: 'RPT003',
                        title: 'AI Diagnostic Accuracy Report',
                        description: 'Performance metrics and accuracy analysis of AI diagnostic algorithms',
                        type: 'Performance',
                        date: '2024-01-08',
                        time: '11:45 AM',
                        size: '3.2 MB',
                        author: 'System Generated',
                        downloads: 78,
                        status: 'completed',
                        priority: 'high'
                      },
                      {
                        id: 'RPT004',
                        title: 'Alzheimer\'s Detection Statistics',
                        description: 'Detailed analysis of early-stage Alzheimer\'s detection rates and patterns',
                        type: 'Disease-Specific',
                        date: '2024-01-05',
                        time: '04:20 PM',
                        size: '1.5 MB',
                        author: 'Dr. Emily Rodriguez',
                        downloads: 23,
                        status: 'completed',
                        priority: 'medium'
                      },
                      {
                        id: 'RPT005',
                        title: 'System Usage and Performance Metrics',
                        description: 'Technical performance analysis and system utilization statistics',
                        type: 'Technical',
                        date: '2024-01-01',
                        time: '10:00 AM',
                        size: '4.1 MB',
                        author: 'System Administrator',
                        downloads: 12,
                        status: 'generating',
                        priority: 'low'
                      }
                    ].map((report, index) => (
                      <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaFileAlt className="text-blue-600 text-sm" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className="text-gray-900 font-semibold">{report.title}</div>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${report.priority === 'high' ? 'bg-red-100 text-red-600' :
                                  report.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-green-100 text-green-600'
                                  }`}>
                                  {report.priority.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-gray-600 text-sm mb-2">{report.description}</div>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>{report.type}</span>
                                <span>•</span>
                                <span>{report.size}</span>
                                <span>•</span>
                                <span>{report.author}</span>
                                <span>•</span>
                                <span>{report.downloads} downloads</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${report.status === 'completed' ? 'bg-green-100 text-green-600' :
                              report.status === 'generating' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                              {report.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-gray-500 text-xs">{report.date} at {report.time}</div>
                          <div className="flex items-center space-x-2">
                            <button className="bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700 transition-colors">
                              View
                            </button>
                            <button className="bg-green-600 text-white text-xs px-3 py-1 rounded hover:bg-green-700 transition-colors">
                              Download
                            </button>
                            <button className="bg-purple-600 text-white text-xs px-3 py-1 rounded hover:bg-purple-700 transition-colors">
                              Share
                            </button>
                            <button className="bg-gray-600 text-white text-xs px-3 py-1 rounded hover:bg-gray-700 transition-colors">
                              Duplicate
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
