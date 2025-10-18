import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FaUserMd, FaUsers, FaCheck, FaEye, FaSearch, FaDownload,
  FaUpload, FaBell, FaCalendarAlt, FaStethoscope, FaBrain,
  FaFileAlt, FaShieldAlt, FaUser, FaTimes, FaArrowUp,
  FaArrowDown, FaFilter, FaSort, FaEllipsisV
} from 'react-icons/fa';

const DoctorRequests = () => {
  const navigate = useNavigate();
  const { signOut, user, authChecked } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Doctor Requests Filters - Default to showing only pending requests
  const [doctorFilters, setDoctorFilters] = useState({
    specialization: 'All Specializations',
    status: 'Pending', // Changed from 'All Status' to 'Pending'
    search: '',
    priority: 'All Priorities',
    verification: 'All Verifications',
    experience: 'All Experience Levels'
  });

  // Fetch doctor requests from backend
  const fetchDoctorRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('mongodb_token');
      const queryParams = new URLSearchParams({
        status: doctorFilters.status === 'All Status' ? 'all' : doctorFilters.status.toLowerCase().replace(' ', '-'),
        specialization: doctorFilters.specialization === 'All Specializations' ? 'all' : doctorFilters.specialization,
        search: doctorFilters.search
      });

      const response = await fetch(`http://localhost:3002/api/admin/doctor-requests?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAllDoctors(data.doctors);
      } else {
        console.error('Failed to fetch doctor requests');
      }
    } catch (error) {
      console.error('Error fetching doctor requests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctor requests on component mount and when filters change
  useEffect(() => {
    if (authChecked && user && user.role === 'admin') {
      fetchDoctorRequests();
    }
  }, [authChecked, user, doctorFilters.status, doctorFilters.specialization, doctorFilters.search]);

  // Redirect non-admin users
  useEffect(() => {
    if (authChecked && user && user.role !== 'admin') {
      console.log('DoctorRequests: Non-admin user detected, redirecting to regular dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, authChecked, navigate]);

  // Real doctor data from backend
  const [allDoctors, setAllDoctors] = useState([]);

  // Filter doctors based on current filters
  const filteredDoctors = allDoctors.filter(doctor => {
    const matchesSpecialization = doctorFilters.specialization === 'All Specializations' ||
      doctor.specialization === doctorFilters.specialization;

    const matchesStatus = doctorFilters.status === 'All Status' ||
      doctor.status === doctorFilters.status.toLowerCase().replace(' ', '-');

    const matchesPriority = doctorFilters.priority === 'All Priorities' ||
      doctor.priority === doctorFilters.priority.toLowerCase();

    const matchesVerification = doctorFilters.verification === 'All Verifications' ||
      doctor.verification === doctorFilters.verification.toLowerCase();

    const matchesSearch = doctorFilters.search === '' ||
      doctor.name.toLowerCase().includes(doctorFilters.search.toLowerCase()) ||
      doctor.email.toLowerCase().includes(doctorFilters.search.toLowerCase()) ||
      doctor.license.toLowerCase().includes(doctorFilters.search.toLowerCase());

    return matchesSpecialization && matchesStatus && matchesPriority && matchesVerification && matchesSearch;
  });

  // Handle filter changes
  const handleDoctorFilterChange = (filterType, value) => {
    setDoctorFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    const selectedDoctors = filteredDoctors.filter(d => d.selected);
    if (selectedDoctors.length === 0) {
      alert('Please select doctors first');
      return;
    }
    
    if (action === 'approve') {
      if (window.confirm(`Approve ${selectedDoctors.length} selected doctor(s)?`)) {
        try {
          const token = localStorage.getItem('mongodb_token');
          const approvalPromises = selectedDoctors.map(doctor => 
            fetch(`http://localhost:3002/api/admin/doctor-requests/${doctor.id}/status`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ status: 'approved' })
            })
          );
          
          const results = await Promise.all(approvalPromises);
          const failedApprovals = results.filter(response => !response.ok);
          
          if (failedApprovals.length === 0) {
            alert(`Successfully approved ${selectedDoctors.length} doctor(s)!`);
            fetchDoctorRequests(); // Refresh the list
          } else {
            alert(`Approved ${selectedDoctors.length - failedApprovals.length} doctor(s), ${failedApprovals.length} failed.`);
            fetchDoctorRequests(); // Refresh the list
          }
        } catch (error) {
          console.error('Error approving doctors:', error);
          alert('Error approving doctor requests');
        }
      }
    } else if (action === 'deny') {
      if (window.confirm(`Deny ${selectedDoctors.length} selected doctor(s)?`)) {
        const reason = prompt('Please provide a reason for rejection:');
        if (reason !== null) {
          try {
            const token = localStorage.getItem('mongodb_token');
            const denialPromises = selectedDoctors.map(doctor => 
              fetch(`http://localhost:3002/api/admin/doctor-requests/${doctor.id}/status`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'rejected', reason })
              })
            );
            
            const results = await Promise.all(denialPromises);
            const failedDenials = results.filter(response => !response.ok);
            
            if (failedDenials.length === 0) {
              alert(`Successfully denied ${selectedDoctors.length} doctor(s)!`);
              fetchDoctorRequests(); // Refresh the list
            } else {
              alert(`Denied ${selectedDoctors.length - failedDenials.length} doctor(s), ${failedDenials.length} failed.`);
              fetchDoctorRequests(); // Refresh the list
            }
          } catch (error) {
            console.error('Error denying doctors:', error);
            alert('Error denying doctor requests');
          }
        }
      }
    }
  };

  // Handle approve all pending requests
  const handleApproveAll = async () => {
    const pendingDoctors = filteredDoctors.filter(d => d.status === 'pending');
    if (pendingDoctors.length === 0) {
      alert('No pending requests to approve');
      return;
    }
    
    if (window.confirm(`Approve all ${pendingDoctors.length} pending doctor request(s)?`)) {
      try {
        const token = localStorage.getItem('mongodb_token');
        const approvalPromises = pendingDoctors.map(doctor => 
          fetch(`http://localhost:3002/api/admin/doctor-requests/${doctor.id}/status`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'approved' })
          })
        );
        
        const results = await Promise.all(approvalPromises);
        const failedApprovals = results.filter(response => !response.ok);
        
        if (failedApprovals.length === 0) {
          alert(`Successfully approved all ${pendingDoctors.length} pending doctor request(s)!`);
          fetchDoctorRequests(); // Refresh the list
        } else {
          alert(`Approved ${pendingDoctors.length - failedApprovals.length} doctor(s), ${failedApprovals.length} failed.`);
          fetchDoctorRequests(); // Refresh the list
        }
      } catch (error) {
        console.error('Error approving all doctors:', error);
        alert('Error approving doctor requests');
      }
    }
  };

  // Handle individual actions
  const handleDoctorAction = async (doctorId, action) => {
    if (action === 'approve') {
      if (window.confirm('Approve this doctor request?')) {
        try {
          const token = localStorage.getItem('mongodb_token');
          const response = await fetch(`http://localhost:3002/api/admin/doctor-requests/${doctorId}/status`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'approved' })
          });

          if (response.ok) {
            alert('Doctor request approved successfully!');
            fetchDoctorRequests(); // Refresh the list
          } else {
            const errorData = await response.json();
            alert(`Failed to approve: ${errorData.message}`);
          }
        } catch (error) {
          console.error('Error approving doctor:', error);
          alert('Error approving doctor request');
        }
      }
    } else if (action === 'deny') {
      const reason = prompt('Please provide a reason for rejection:');
      if (reason !== null) {
        try {
          const token = localStorage.getItem('mongodb_token');
          const response = await fetch(`http://localhost:3002/api/admin/doctor-requests/${doctorId}/status`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'rejected', reason })
          });

          if (response.ok) {
            alert('Doctor request rejected successfully!');
            fetchDoctorRequests(); // Refresh the list
          } else {
            const errorData = await response.json();
            alert(`Failed to reject: ${errorData.message}`);
          }
        } catch (error) {
          console.error('Error rejecting doctor:', error);
          alert('Error rejecting doctor request');
        }
      }
    } else if (action === 'review') {
      // Handle review logic
      console.log('Reviewing doctor:', doctorId);
    } else if (action === 'contact') {
      // Handle contact logic
      console.log('Contacting doctor:', doctorId);
    }
  };

  // Logout function
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await signOut();
        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
        navigate('/login');
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'admin-dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`} style={{ fontFamily: 'Times New Roman, serif' }}>

      {/* Header */}
      <header className={`border-b px-6 py-4 shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => navigate('/admin-dashboard')}
              className={`transition-colors p-2 rounded-lg ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
            >
              ← Back to Dashboard
            </button>
          </div>
          
          <div className="flex-1 text-center">
            <h1 className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Doctor Registration Management
            </h1>
            <p className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Review and approve medical professional access requests
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`transition-colors p-2 rounded-lg ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <FaUser className="text-white text-sm" />
              </div>
              <div className="text-right">
                <div className={`text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin</div>
                <div className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Administrator</div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`transition-colors p-2 rounded-lg ${isDarkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
              title="Logout"
            >
              🚪
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`p-6 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>

        {/* Dynamic Request Statistics Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className={`rounded-xl p-6 border transition-colors duration-300 shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Pending Requests
                </div>
                <div className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {allDoctors.filter(d => d.status === 'pending').length}
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <FaUserMd className="text-amber-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl p-6 border transition-colors duration-300 shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Approved
                </div>
                <div className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {allDoctors.filter(d => d.status === 'approved').length}
                </div>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <FaCheck className="text-emerald-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl p-6 border transition-colors duration-300 shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Under Review
                </div>
                <div className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {allDoctors.filter(d => d.status === 'under-review').length}
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaEye className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl p-6 border transition-colors duration-300 shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Total Requests
                </div>
                <div className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {allDoctors.length}
                </div>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <FaUsers className="text-indigo-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Filters and Actions */}
        <div className={`rounded-2xl p-6 border transition-colors duration-300 mb-6 shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          {/* Header Section */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Registration Requests
            </h3>
          </div>
          
          {/* Filters and Actions Row */}
          <div className="flex items-end justify-between gap-6">
            {/* Left Side - Filters */}
            <div className="flex items-end space-x-4 flex-1">
              {/* Specialization Filter */}
              <div className="flex flex-col min-w-[140px]">
                <label className={`text-xs font-medium mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Specialization
                </label>
                <select
                  className={`border rounded-lg text-sm px-3 py-2.5 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
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
              </div>
              
              {/* Status Filter */}
              <div className="flex flex-col min-w-[120px]">
                <label className={`text-xs font-medium mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Status
                </label>
                <select
                  className={`border rounded-lg text-sm px-3 py-2.5 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  value={doctorFilters.status}
                  onChange={(e) => handleDoctorFilterChange('status', e.target.value)}
                >
                  <option>Pending</option>
                  <option>All Status</option>
                  <option>Under Review</option>
                  <option>Approved</option>
                  <option>Denied</option>
                </select>
              </div>
              
              {/* Priority Filter */}
              <div className="flex flex-col min-w-[120px]">
                <label className={`text-xs font-medium mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Priority
                </label>
                <select
                  className={`border rounded-lg text-sm px-3 py-2.5 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  value={doctorFilters.priority}
                  onChange={(e) => handleDoctorFilterChange('priority', e.target.value)}
                >
                  <option>All Priorities</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              
              {/* Verification Filter */}
              <div className="flex flex-col min-w-[130px]">
                <label className={`text-xs font-medium mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Verification
                </label>
                <select
                  className={`border rounded-lg text-sm px-3 py-2.5 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  value={doctorFilters.verification}
                  onChange={(e) => handleDoctorFilterChange('verification', e.target.value)}
                >
                  <option>All Verifications</option>
                  <option>Verified</option>
                  <option>Pending</option>
                </select>
              </div>
              
              {/* Search */}
              <div className="flex flex-col min-w-[280px]">
                <label className={`text-xs font-medium mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Search
                </label>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or license..."
                    className={`pl-10 pr-4 py-2.5 border rounded-lg text-sm w-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    value={doctorFilters.search}
                    onChange={(e) => handleDoctorFilterChange('search', e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Right Side - Action Buttons */}
            <div className="flex items-end space-x-3">
              <button 
                onClick={handleApproveAll}
                className="inline-flex items-center px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={filteredDoctors.filter(d => d.status === 'pending').length === 0}
              >
                <FaCheck className="w-4 h-4 mr-2" />
                Approve All Pending
              </button>
              <button 
                onClick={() => setDoctorFilters({
                  specialization: 'All Specializations',
                  status: 'All Status',
                  search: '',
                  priority: 'All Priorities',
                  verification: 'All Verifications'
                })}
                className="inline-flex items-center px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
              >
                <FaUsers className="w-4 h-4 mr-2" />
                View All Requests
              </button>
              <button className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200">
                <FaUserMd className="w-4 h-4 mr-2" />
                Invite Doctor
              </button>
              <button className="inline-flex items-center px-4 py-2.5 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200">
                <FaDownload className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>

          {/* Doctors Table */}
          <div className="overflow-x-auto">
            {filteredDoctors.length === 0 ? (
              // Professional Empty State
              <div className="text-center py-20">
                <div className={`w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-800 border-2 border-gray-700' : 'bg-gray-50 border-2 border-gray-200'
                }`}>
                  <FaUserMd className={`text-4xl transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {doctorFilters.status === 'Pending' && allDoctors.filter(d => d.status === 'pending').length === 0
                    ? "No Pending Requests"
                    : "No Current Requests"
                  }
                </h3>
                <p className={`text-base mb-8 max-w-md mx-auto leading-relaxed transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {allDoctors.length === 0 
                    ? "No doctor registration requests have been submitted yet. New requests will appear here when medical professionals apply for access to the NeuroCare AI platform."
                    : doctorFilters.status === 'Pending' && allDoctors.filter(d => d.status === 'pending').length === 0
                    ? "All doctor requests have been successfully processed. New pending requests will automatically appear here when medical professionals apply for access."
                    : "No requests match your current filter criteria. Please adjust your search parameters or clear filters to view all available requests."
                  }
                </p>
                {allDoctors.length > 0 && (
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setDoctorFilters({
                        specialization: 'All Specializations',
                        status: 'Pending',
                        search: '',
                        priority: 'All Priorities',
                        verification: 'All Verifications'
                      })}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                    >
                      <FaEye className="w-4 h-4 mr-2" />
                      Show Pending Only
                    </button>
                    <button
                      onClick={() => setDoctorFilters({
                        specialization: 'All Specializations',
                        status: 'All Status',
                        search: '',
                        priority: 'All Priorities',
                        verification: 'All Verifications'
                      })}
                      className="inline-flex items-center px-6 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200"
                    >
                      <FaUsers className="w-4 h-4 mr-2" />
                      View All Requests
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b-2 transition-colors duration-300 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                    <th className="text-left py-4 px-4">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </th>
                    <th className={`text-left py-4 px-4 font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Doctor Information
                    </th>
                    <th className={`text-left py-4 px-4 font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Credentials
                    </th>
                    <th className={`text-left py-4 px-4 font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Institution
                    </th>
                    <th className={`text-left py-4 px-4 font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Experience
                    </th>
                    <th className={`text-left py-4 px-4 font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Request Details
                    </th>
                    <th className={`text-left py-4 px-4 font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Verification
                    </th>
                    <th className={`text-left py-4 px-4 font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </th>
                    <th className={`text-left py-4 px-4 font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doctor, index) => (
                    <tr key={doctor.id} className={`border-b transition-all duration-200 ${isDarkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-100 hover:bg-blue-50'}`}>
                      <td className="py-4 px-4">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                            <FaUserMd className="text-white text-sm" />
                          </div>
                          <div>
                            <div className={`font-semibold text-sm transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {doctor.name}
                            </div>
                            <div className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {doctor.email}
                            </div>
                            <div className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {doctor.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className={`text-sm font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {doctor.license}
                          </div>
                          <div className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {doctor.specialization}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {doctor.hospital}
                          </div>
                          <div className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {doctor.department}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {doctor.experience ? `${doctor.experience} years of experience` : 'Not specified'}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className={`text-xs font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                            {doctor.requestDate}
                          </div>
                          <div className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {doctor.requestTime}
                          </div>
                          <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium mt-1 ${
                            doctor.priority === 'high' ? 'bg-red-100 text-red-700' :
                            doctor.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                            {doctor.priority.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                            doctor.verification === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-amber-100 text-amber-700'
                            }`}>
                            {doctor.verification.toUpperCase()}
                          </span>
                          <div className={`text-xs mt-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {doctor.documents.length} docs
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${
                          doctor.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          doctor.status === 'under-review' ? 'bg-blue-100 text-blue-700' :
                            doctor.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-red-100 text-red-700'
                          }`}>
                          {doctor.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleDoctorAction(doctor.id, 'approve')}
                          className="inline-flex items-center px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-all duration-200"
                        >
                          <FaCheck className="w-3 h-3 mr-1" />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleDoctorAction(doctor.id, 'deny')}
                          className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200"
                        >
                          <FaTimes className="w-3 h-3 mr-1" />
                          Deny
                        </button>
                        <button 
                          onClick={() => handleDoctorAction(doctor.id, 'review')}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200"
                        >
                          <FaEye className="w-3 h-3 mr-1" />
                          Review
                        </button>
                        <button 
                          onClick={() => handleDoctorAction(doctor.id, 'contact')}
                          className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all duration-200"
                        >
                          <FaBell className="w-3 h-3 mr-1" />
                          Contact
                        </button>
                      </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Enhanced Footer with Bulk Actions - Only show when there are requests */}
          {filteredDoctors.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Showing {filteredDoctors.length} of {allDoctors.length} requests
                  {doctorFilters.specialization !== 'All Specializations' ||
                    doctorFilters.status !== 'All Status' ||
                    doctorFilters.search !== '' ? ' (filtered)' : ''}
                </div>
                <select className={`border rounded text-xs px-2 py-1 transition-colors duration-300 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                  <option>10 per page</option>
                  <option>25 per page</option>
                  <option>50 per page</option>
                </select>
                {(doctorFilters.specialization !== 'All Specializations' ||
                  doctorFilters.status !== 'Pending' ||
                  doctorFilters.search !== '') && (
                    <button
                      onClick={() => setDoctorFilters({
                        specialization: 'All Specializations',
                        status: 'Pending',
                        search: '',
                        priority: 'All Priorities',
                        verification: 'All Verifications'
                      })}
                      className="text-blue-600 hover:text-blue-700 text-xs underline"
                    >
                      Reset to Pending
                    </button>
                  )}
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => handleBulkAction('approve')}
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200"
                >
                  <FaCheck className="w-4 h-4 mr-2" />
                  Approve Selected
                </button>
                <button 
                  onClick={() => handleBulkAction('deny')}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
                >
                  <FaTimes className="w-4 h-4 mr-2" />
                  Deny Selected
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200">
                  <FaBell className="w-4 h-4 mr-2" />
                  Send Reminder
                </button>
                <button className="inline-flex items-center px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all duration-200">
                  <FaDownload className="w-4 h-4 mr-2" />
                  Export Selected
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorRequests;
