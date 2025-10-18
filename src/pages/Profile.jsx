import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBrain,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaArrowLeft,
  FaCrown,
  FaShieldAlt,
  FaCalendarAlt,
  FaChartLine,
  FaFileAlt,
  FaHeart,
  FaAward,
  FaSpinner,
  FaHospital,
  FaUserMd,
  FaIdCard
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { mongodbService } from '../lib/mongodb';

export default function Profile() {
  const navigate = useNavigate();
  const { user, authType } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    date_of_birth: '',
    role: 'patient',
    // Doctor-specific fields
    license_number: '',
    specialization: '',
    hospital: '',
    // Additional fields
    joinDate: '',
    membershipType: 'Basic'
  });

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      if (authType === 'mongodb') {
        // For MongoDB users, get full profile from database
        const userData = await mongodbService.getUser();
        if (userData) {
          setUserInfo({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            date_of_birth: userData.date_of_birth || '',
            role: userData.role || 'patient',
            license_number: userData.license_number || '',
            specialization: userData.specialization || '',
            hospital: userData.hospital || '',
            joinDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long'
            }) : 'Recently',
            membershipType: userData.membershipType || 'Basic'
          });
        }
      } else if (authType === 'supabase') {
        // For Supabase users (Google Sign-In), use available data
        setUserInfo({
          firstName: user.user_metadata?.full_name?.split(' ')[0] || '',
          lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          date_of_birth: '',
          role: user.role || 'patient',
          license_number: '',
          specialization: '',
          hospital: '',
          joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
          }) : 'Recently',
          membershipType: 'Basic'
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (authType !== 'mongodb') {
      setError('Profile editing is only available for registered users');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Create update payload
      const updateData = {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        phone: userInfo.phone,
        date_of_birth: userInfo.date_of_birth,
        ...(userInfo.role === 'doctor' && {
          license_number: userInfo.license_number,
          specialization: userInfo.specialization,
          hospital: userInfo.hospital
        })
      };

      // Call API to update profile
      const response = await fetch(`${import.meta.env.VITE_MONGODB_API_URL || 'http://localhost:3002/api'}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mongodbService.token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      setIsEditing(false);
      // Reload profile to get updated data
      await loadUserProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getFullName = () => {
    return `${userInfo.firstName} ${userInfo.lastName}`.trim() || 'User';
  };

  const getUserTitle = () => {
    if (userInfo.role === 'doctor') {
      return `Dr. ${getFullName()}`;
    }
    return getFullName();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Header - Same style as other pages */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <FaUser className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-600">Manage your account information</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Profile Card - Matching dashboard style */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white text-center">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto mb-4 bg-white/20 flex items-center justify-center">
                  {userInfo.role === 'doctor' ? (
                    <FaUserMd className="text-white text-3xl" />
                  ) : (
                    <FaUser className="text-white text-3xl" />
                  )}
                </div>
                <h2 className="text-xl font-semibold mb-2">{getUserTitle()}</h2>
                {userInfo.role !== 'doctor' && (
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {userInfo.role === 'doctor' ? (
                      <FaUserMd className="text-blue-200" />
                    ) : (
                      <FaUser className="text-blue-200" />
                    )}
                    <span className="text-blue-100 font-medium capitalize">{userInfo.role}</span>
                  </div>
                )}
                {userInfo.role !== 'doctor' && userInfo.specialization && (
                  <div className="text-sm text-blue-200 mb-2">{userInfo.specialization}</div>
                )}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <FaCrown className="text-yellow-300" />
                  <span className="text-blue-100 font-medium">{userInfo.membershipType} Member</span>
                </div>
                <div className="text-sm text-blue-200">Member since {userInfo.joinDate}</div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <FaShieldAlt className="text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Account Status</p>
                    <p className="text-sm text-green-600">Verified & Active</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <FaAward className="text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Health Score</p>
                    <p className="text-sm text-gray-600">Excellent (95%)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Personal Information Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaUser className="text-blue-600" />
                  Personal Information
                </h3>
                {authType === 'mongodb' && (
                  <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={saving}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium ${isEditing
                        ? 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                  >
                    {saving ? (
                      <FaSpinner className="animate-spin" />
                    ) : isEditing ? (
                      <FaSave />
                    ) : (
                      <FaEdit />
                    )}
                    {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
                  </button>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Fields */}
                {[
                  { label: 'First Name', value: userInfo.firstName, key: 'firstName', icon: FaUser, editable: true },
                  { label: 'Last Name', value: userInfo.lastName, key: 'lastName', icon: FaUser, editable: true },
                  { label: 'Email Address', value: userInfo.email, key: 'email', icon: FaEnvelope, editable: false },
                  { label: 'Phone Number', value: userInfo.phone || 'Not provided', key: 'phone', icon: FaPhone, editable: true },
                  { label: 'Date of Birth', value: userInfo.date_of_birth || 'Not provided', key: 'date_of_birth', icon: FaCalendarAlt, editable: true, type: 'date' },
                  // Hide role field for doctors
                  ...(userInfo.role !== 'doctor' ? [{ label: 'Role', value: userInfo.role, key: 'role', icon: userInfo.role === 'doctor' ? FaUserMd : FaUser, editable: false }] : [])
                ].map((field, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">{field.label}</label>
                    {isEditing && field.editable && authType === 'mongodb' ? (
                      <input
                        type={field.type || (field.key === 'email' ? 'email' : field.key === 'phone' ? 'tel' : 'text')}
                        value={field.value === 'Not provided' ? '' : field.value}
                        onChange={(e) => setUserInfo({ ...userInfo, [field.key]: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <field.icon className="text-gray-500" />
                        <span className="text-gray-900 capitalize">{field.value}</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Doctor-specific fields */}
                {userInfo.role === 'doctor' && [
                  { label: 'Medical License', value: userInfo.license_number || 'Not provided', key: 'license_number', icon: FaIdCard, editable: true },
                  // Specialization removed from doctor self-view per requirements
                  { label: 'Hospital/Clinic', value: userInfo.hospital || 'Not provided', key: 'hospital', icon: FaHospital, editable: true }
                ].map((field, index) => (
                  <div key={`doctor-${index}`} className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">{field.label}</label>
                    {isEditing && field.editable && authType === 'mongodb' ? (
                      <input
                        type="text"
                        value={field.value === 'Not provided' ? '' : field.value}
                        onChange={(e) => setUserInfo({ ...userInfo, [field.key]: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <field.icon className="text-gray-500" />
                        <span className="text-gray-900">{field.value}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {authType === 'supabase' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-blue-700 text-sm">
                    <strong>Note:</strong> You signed in with Google. To edit your profile, please register with email/password.
                  </p>
                </div>
              )}
            </div>

            {/* Health Overview */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <FaHeart className="text-red-500" />
                Health Overview
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Brain Health Score', value: '95%', color: 'blue', icon: FaBrain },
                  { label: 'Risk Assessment', value: 'Low', color: 'green', icon: FaShieldAlt },
                  { label: 'Last Scan', value: '2 days ago', color: 'purple', icon: FaCalendarAlt }
                ].map((stat, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
                    <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <stat.icon className={`text-${stat.color}-600 text-xl`} />
                    </div>
                    <div className={`text-2xl font-bold text-${stat.color}-600 mb-1`}>{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Upload New Scan', desc: 'Analyze your latest MRI', icon: FaBrain, color: 'blue', path: '/mri-analysis' },
                  { title: 'View Reports', desc: 'Access your scan history', icon: FaFileAlt, color: 'green', path: '/reports' },
                  { title: 'Schedule Appointment', desc: 'Book with a specialist', icon: FaCalendarAlt, color: 'purple', path: '/dashboard' },
                  { title: 'Health Analytics', desc: 'View detailed insights', icon: FaChartLine, color: 'indigo', path: '/dashboard' }
                ].map((action, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(action.path)}
                    className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 text-left"
                  >
                    <div className={`w-12 h-12 bg-${action.color}-100 rounded-xl flex items-center justify-center`}>
                      <action.icon className={`text-${action.color}-600 text-xl`} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{action.title}</div>
                      <div className="text-sm text-gray-600">{action.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




