import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBrain, FaHome, FaUpload, FaFileAlt, FaCalendarAlt, FaUser, FaSignOutAlt,
  FaBell, FaRobot, FaTimes, FaPaperPlane, FaHeart, FaEye, FaCheckCircle,
  FaVideo, FaComments, FaHeadset, FaCrown, FaStar, FaHospital
} from 'react-icons/fa';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [showChatbot, setShowChatbot] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', message: 'Hello! I\'m your AI health assistant. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // User membership status
  const userMembership = {
    isPremium: false, // Change to true to test premium features
    plan: 'Basic',
    expiryDate: '2024-12-31',
    features: ['AI Analysis', 'Doctor Chat', 'Video Consultations', 'Priority Support']
  };

  const sidebarItems = [
    { id: 'home', label: 'Dashboard', icon: FaHome },
    { id: 'upload', label: 'Upload MRI', icon: FaUpload },
    { id: 'reports', label: 'My Reports', icon: FaFileAlt },
  
    { id: 'appointments', label: 'Appointments', icon: FaCalendarAlt, premium: true },
    { id: 'doctor-chat', label: 'Chat with Doctor', icon: FaComments, premium: true },
    { id: 'video-call', label: 'Video Consultation', icon: FaVideo, premium: true },
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'subscription', label: 'Subscription', icon: FaCrown },
    { id: 'support', label: 'Help & Support', icon: FaHeadset }
  ];

  const checkPremiumAccess = (feature) => {
    if (!userMembership.isPremium) {
      setShowPremiumModal(true);
      return false;
    }
    return true;
  };

  const handleSidebarClick = (itemId) => {
    if (itemId === 'upload') {
      navigate('/mri-analysis');
    } else if (itemId === 'subscription') {
      navigate('/subscription');
    } else if (itemId === 'support') {
      navigate('/help-support');
    } else if (itemId === 'reports') {
      navigate('/reports');
    } else if (itemId === 'profile') {
      navigate('/profile');
    } else if (itemId === 'appointments' || itemId === 'doctor-chat' || itemId === 'video-call') {
      if (!checkPremiumAccess(itemId)) return;
      setActiveTab(itemId);
    } else {
      setActiveTab(itemId);
    }
  };

  const sendMessage = () => {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, 
        { type: 'user', message: chatInput },
        { type: 'bot', message: 'Thank you for your question. Our AI is analyzing your query...' }
      ]);
      setChatInput('');
    }
  };

  const startVideoCall = () => {
    if (checkPremiumAccess('video')) {
      alert('Starting video call with Dr. Sarah Johnson...');
    }
  };

  const chatWithDoctor = (doctorId) => {
    if (checkPremiumAccess('chat')) {
      alert('Opening chat with doctor...');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" style={{fontFamily: 'Times New Roman, serif'}}>
      
      {/* Enhanced Sidebar */}
      <div className="fixed left-0 top-0 h-full w-72 bg-white shadow-xl border-r border-gray-200">
        
        {/* Logo Section */}
        <div className="p-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-24 h-24 bg-white rounded-full -translate-x-12 -translate-y-12"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-white rounded-full translate-x-8 translate-y-8"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                <FaBrain className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wide">NeuroCare</h1>
                <p className="text-blue-100 text-xs font-medium">AI Health Platform</p>
              </div>
            </div>
            
            {/* Enhanced User Info */}
            <div className="flex items-center gap-3 p-3 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" 
                  alt="User" 
                  className="w-8 h-8 rounded-full border-2 border-white/40 shadow-md"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border border-white"></div>
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">John Doe</p>
                <div className="flex items-center gap-1">
                  {userMembership.isPremium ? (
                    <>
                      <FaCrown className="text-yellow-300 text-xs" />
                      <span className="text-blue-100 text-xs font-medium">Premium</span>
                    </>
                  ) : (
                    <span className="text-blue-200 text-xs font-medium">Basic Member</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 pb-32">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSidebarClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left mb-2 transition-all duration-200 relative ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
              } ${item.premium && !userMembership.isPremium ? 'opacity-60' : ''}`}
            >
              <item.icon className="text-lg" />
              <span className="font-bold flex-1">{item.label}</span>
              {item.premium && (
                <FaCrown className={`text-lg ${userMembership.isPremium ? 'text-yellow-500' : 'text-gray-400'}`} />
              )}
              {item.id === 'subscription' && (
                <FaCrown className="text-yellow-500 text-lg" />
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-4 right-4 pb-4">
          <button 
            onClick={() => navigate('/login')}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <FaSignOutAlt />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        {/* Health Score Widget - Removed */}
      </div>

      {/* Main Content */}
      <div className="ml-72 min-h-screen">
        
        {/* Header */}
        <header className="bg-white shadow-lg border-b border-gray-200 px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                <FaUser className="text-white text-xl" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Good morning, John
                </h2>
                <p className="text-gray-600 text-base mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Dashboard Overview • December 14, 2024
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-3 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <FaBell className="text-xl" />
                </button>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <span className="text-white text-xs font-bold">3</span>
                </div>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {/* Neurologist Recommendations */}
                      <div className="p-4">
                        <h4 className="font-bold text-gray-900 mb-3">Recommended Neurologists Near You</h4>
                        <div className="space-y-3">
                          {[
                            {
                              name: 'Dr. Rajesh Kumar',
                              specialty: 'Neurological Surgery',
                              hospital: 'AIIMS Kottayam',
                              rating: 4.9,
                              distance: '2.3 km',
                              expertise: ['Brain Tumors', 'Epilepsy'],
                              fee: '₹800',
                              availability: 'Available Today'
                            },
                            {
                              name: 'Dr. Priya Menon',
                              specialty: 'Pediatric Neurology',
                              hospital: 'Medical College Kottayam',
                              rating: 4.8,
                              distance: '3.1 km',
                              expertise: ['Child Neurology', 'Developmental Disorders'],
                              fee: '₹600',
                              availability: 'Tomorrow 10 AM'
                            },
                            {
                              name: 'Dr. Suresh Nair',
                              specialty: 'Interventional Neurology',
                              hospital: 'Believers Church Medical College',
                              rating: 4.7,
                              distance: '4.7 km',
                              expertise: ['Stroke Treatment', 'Aneurysm'],
                              fee: '₹1000',
                              availability: 'Dec 16, 2 PM'
                            }
                          ].map((doctor, index) => (
                            <div key={index} className="bg-gray-50 rounded-xl p-4">
                              <div className="flex items-start gap-3 mb-3">
                                <img 
                                  src={`https://images.unsplash.com/photo-${index === 0 ? '1612349317150' : index === 1 ? '1594824388068' : '1582750433449'}-e891b382a3bb?w=50&h=50&fit=crop&crop=face`}
                                  alt={doctor.name}
                                  className="w-12 h-12 rounded-full"
                                />
                                <div className="flex-1">
                                  <h5 className="font-bold text-gray-900">{doctor.name}</h5>
                                  <p className="text-blue-600 text-sm">{doctor.specialty}</p>
                                  <p className="text-gray-600 text-sm">{doctor.hospital}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1">
                                      <FaStar className="text-yellow-500 text-xs" />
                                      <span className="text-sm font-medium">{doctor.rating}</span>
                                    </div>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-sm text-gray-600">{doctor.distance}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mb-3">
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {doctor.expertise.map((exp, i) => (
                                    <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                      {exp}
                                    </span>
                                  ))}
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-bold text-green-600">{doctor.fee}</span>
                                  <span className="text-gray-600">{doctor.availability}</span>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => checkPremiumAccess('chat') && alert(`Starting chat with ${doctor.name}...`)}
                                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                    userMembership.isPremium 
                                      ? 'bg-green-600 text-white hover:bg-green-700' 
                                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  💬 Chat
                                </button>
                                <button 
                                  onClick={() => checkPremiumAccess('appointment') && alert(`Booking appointment with ${doctor.name}...`)}
                                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                    userMembership.isPremium 
                                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  }`}
                                >
                                  Book Now
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <button className="w-full mt-3 text-blue-600 hover:text-blue-700 font-medium text-sm">
                          View All Neurologists in Kottayam →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar */}
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" 
                alt="User" 
                className="w-12 h-12 rounded-full border-2 border-blue-200"
              />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8">
          
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[
              { title: 'MRI Scans', value: '5', icon: FaBrain, color: 'blue', trend: '+2 this month' },
              { title: 'Reports', value: '3', icon: FaFileAlt, color: 'green', trend: 'All reviewed' },
              { title: 'Appointments', value: '1', icon: FaCalendarAlt, color: 'purple', trend: 'Next: Dec 15' },
              { title: 'Health Score', value: '85%', icon: FaHeart, color: 'red', trend: '+5% improved' }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`text-${stat.color}-600 text-xl`} />
                  </div>
                  <div className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{stat.title}</h3>
                <p className="text-sm text-gray-600">{stat.trend}</p>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-3 gap-8">
            
            {/* Left Column - 2/3 width */}
            <div className="col-span-2 space-y-8">
              
              {/* AI Health Insights */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <FaBrain className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">AI Health Insights</h3>
                      <p className="text-blue-100">Personalized recommendations for you</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <FaCheckCircle className="text-green-600 text-lg mt-1" />
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Great News! Your Brain Health is Excellent</h4>
                        <p className="text-gray-700">Your latest MRI shows healthy brain activity with no concerning patterns detected. Keep up the good work!</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { icon: FaEye, title: 'Vision Health', score: 92, color: 'blue' },
                      { icon: FaHeart, title: 'Cardiovascular', score: 88, color: 'red' },
                      { icon: FaBrain, title: 'Cognitive', score: 95, color: 'purple' }
                    ].map((metric, index) => (
                      <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className={`w-12 h-12 bg-${metric.color}-100 rounded-xl flex items-center justify-center mx-auto mb-3`}>
                          <metric.icon className={`text-${metric.color}-600 text-lg`} />
                        </div>
                        <h5 className="font-bold text-gray-900 mb-1">{metric.title}</h5>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div className={`bg-${metric.color}-500 h-2 rounded-full`} style={{width: `${metric.score}%`}}></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{metric.score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { icon: FaUpload, title: 'MRI Scan Uploaded', time: '2 hours ago', status: 'completed' },
                    { icon: FaFileAlt, title: 'Report Generated', time: '1 day ago', status: 'completed' },
                    { icon: FaCalendarAlt, title: 'Appointment Scheduled', time: '3 days ago', status: 'upcoming' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className={`w-10 h-10 ${activity.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                        <activity.icon className={`${activity.status === 'completed' ? 'text-green-600' : 'text-blue-600'} text-sm`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600">{activity.time}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {activity.status === 'completed' ? 'Completed' : 'Upcoming'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - 1/3 width */}
            <div className="space-y-6">
              
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/mri-analysis')}
                    className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
                  >
                    <FaUpload className="text-lg" />
                    <span className="font-medium">Upload New MRI</span>
                  </button>
                  
                  <button 
                    onClick={() => checkPremiumAccess('appointment') && alert('Opening appointment booking...')}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                      userMembership.isPremium 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700' 
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <FaCalendarAlt className="text-lg" />
                    <span className="font-medium">Book Appointment</span>
                    {!userMembership.isPremium && <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full ml-auto">Premium</span>}
                  </button>
                  
                  <button className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200">
                    <FaFileAlt className="text-lg" />
                    <span className="font-medium">View Reports</span>
                  </button>
                </div>
              </div>

              {/* Next Appointment */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Next Appointment</h3>
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face" 
                      alt="Doctor" 
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-bold text-gray-900">Dr. Sarah Johnson</p>
                      <p className="text-blue-600 text-sm">Neurologist</p>
                    </div>
                    {userMembership.isPremium && (
                      <div className="ml-auto">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Premium</span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 font-medium mb-1">December 15, 2024</p>
                  <p className="text-gray-600 text-sm mb-3">2:00 PM - Follow-up consultation</p>
                  
                  <div className="space-y-2">
                    <button 
                      onClick={startVideoCall}
                      className={`w-full py-2 rounded-lg font-medium transition-colors ${
                        userMembership.isPremium 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {userMembership.isPremium ? 'Join Video Call' : 'Video Call (Premium Only)'}
                    </button>
                    
                    {userMembership.isPremium && (
                      <button 
                        onClick={() => chatWithDoctor(1)}
                        className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        💬 Chat with Doctor
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Health Tips */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6">
                <h3 className="text-lg font-bold text-green-800 mb-4">💡 Daily Health Tip</h3>
                <p className="text-green-700 text-sm mb-4">
                  Regular exercise increases blood flow to the brain and can improve cognitive function. Try 30 minutes of walking today!
                </p>
                <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                  Learn More →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

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

      {/* AI Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        {showChatbot ? (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-96 h-[500px] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaRobot className="text-lg" />
                  </div>
                  <div>
                    <span className="font-bold">AI Health Assistant</span>
                    <p className="text-blue-100 text-sm">Online now</p>
                  </div>
                </div>
                <button onClick={() => setShowChatbot(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <div className="h-80 overflow-y-auto p-4 bg-gray-50">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`mb-4 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-xl max-w-xs ${
                    msg.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about your health..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button 
                  onClick={sendMessage}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowChatbot(true)}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300"
          >
            <FaRobot className="text-2xl" />
          </button>
        )}
      </div>
    </div>
  );
}


