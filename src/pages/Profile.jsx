import React, { useState } from 'react';
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
  FaAward
} from 'react-icons/fa';

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@neurocare.com',
    phone: '+1 (555) 987-6543',
    location: 'San Francisco, CA',
    joinDate: 'March 2023',
    membershipType: 'Premium'
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-white" style={{fontFamily: 'Times New Roman, serif'}}>
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
                <img 
                  src="https://randomuser.me/api/portraits/women/44.jpg" 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto mb-4"
                />
                <h2 className="text-xl font-semibold mb-2">{userInfo.name}</h2>
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
                <button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                    isEditing 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isEditing ? <FaSave /> : <FaEdit />}
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Full Name', value: userInfo.name, key: 'name', icon: FaUser },
                  { label: 'Email Address', value: userInfo.email, key: 'email', icon: FaEnvelope },
                  { label: 'Phone Number', value: userInfo.phone, key: 'phone', icon: FaPhone },
                  { label: 'Location', value: userInfo.location, key: 'location', icon: FaMapMarkerAlt }
                ].map((field, index) => (
                  <div key={index} className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">{field.label}</label>
                    {isEditing ? (
                      <input
                        type={field.key === 'email' ? 'email' : field.key === 'phone' ? 'tel' : 'text'}
                        value={field.value}
                        onChange={(e) => setUserInfo({...userInfo, [field.key]: e.target.value})}
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




