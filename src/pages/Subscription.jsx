import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCrown, FaCheck, FaTimes, FaArrowLeft, FaVideo, FaComments,
  FaCalendarAlt, FaBrain, FaShieldAlt, FaHeadset, FaStar,
  FaCreditCard, FaPaypal, FaGooglePay, FaBell, FaUser, FaSignOutAlt,
  FaChevronDown, FaUpload, FaRobot, FaBars, FaHome, FaFileAlt,
  FaComment, FaUserMd
} from 'react-icons/fa';

import { mongodbService } from '../lib/mongodb';
import { useAuth } from '../contexts/AuthContext';

export default function Subscription() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showPayment, setShowPayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user, authType, signOut } = useAuth();
  const isTestMode = (import.meta.env?.VITE_RAZORPAY_TEST_MODE === 'true') || (import.meta.env?.MODE !== 'production');

  // Navbar state
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifItems, setNotifItems] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [appointments, setAppointments] = useState([]);

  // Load appointments on mount (to populate notifications even if page refreshed)
  useEffect(() => {
    (async () => {
      try {
        const res = await mongodbService.listAppointments();
        setAppointments(res?.data || []);
      } catch { }
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
    } else if (itemId === 'doctor-chat') {
      navigate('/doctor-chat');
    } else if (itemId === 'appointments') {
      navigate('/appointments');
    } else if (itemId === 'brain-chat') {
      navigate('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: { monthly: 0, yearly: 0 },
      description: 'Essential features for basic health monitoring',
      features: [
        'Upload MRI scans',
        'Basic AI analysis',
        'View reports',
        'Email support',
        'Health tips'
      ],
      limitations: [
        'No doctor consultations',
        'No video calls',
        'Limited AI insights',
        'Standard support'
      ],
      color: 'gray',
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: { monthly: 999, yearly: 9990 },
      description: 'Complete healthcare solution with expert access',
      features: [
        'Everything in Basic',
        'Direct doctor chat 💬',
        'Video consultations 📹',
        'Priority appointments 📅',
        'Advanced AI analysis 🧠',
        '24/7 priority support 🚀',
        'Family health management 👨‍👩‍👧‍👦',
        'Predictive health analytics 📊',
        'Specialist referrals 🏥',
        'Health trend tracking 📈'
      ],
      limitations: [],
      color: 'yellow',
      popular: true,
      savings: '17% off yearly'
    },
    {
      id: 'family',
      name: 'Family',
      price: { monthly: 1499, yearly: 14990 },
      description: 'Premium features for up to 6 family members',
      features: [
        'Everything in Premium',
        'Up to 6 family members',
        'Shared health dashboard',
        'Family health insights',
        'Coordinated care plans',
        'Emergency contacts',
        'Child-specific features'
      ],
      limitations: [],
      color: 'blue',
      popular: false,
      savings: '17% off yearly'
    }
  ];

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: FaCreditCard },
    { id: 'paypal', name: 'PayPal', icon: FaPaypal },
    { id: 'gpay', name: 'Google Pay', icon: FaGooglePay }
  ];

  const currentPlan = plans.find(p => p.id === selectedPlan);
  const price = currentPlan?.price[billingCycle] || 0;
  const monthlyPrice = billingCycle === 'yearly' ? Math.round(price / 12) : price;

  const planMap = { basic: 'Basic', premium: 'Premium', family: 'Family' };

  // Load Razorpay script on demand
  const loadRazorpay = () => new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });

  const handleStartTrial = async () => {
    if (authType !== 'mongodb' || !mongodbService.token) {
      setError('Please sign in with email/password to activate subscription.');
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await loadRazorpay();
      const plan = planMap[selectedPlan] || 'Premium';
      // If yearly, you might store the yearly amount as-is. The backend expects amount in rupees.
      const amount = isTestMode ? 1 : price; // Use nominal amount for test mode
      const orderRes = await mongodbService.createRazorpayOrder(amount, plan, billingCycle, { isTestMode });
      if (orderRes.error) throw new Error(orderRes.error.message);
      const order = orderRes.data;
      if (!order?.id) throw new Error('Failed to create order');

      const keyId = (isTestMode
        ? (import.meta.env.VITE_RAZORPAY_TEST_KEY_ID || import.meta.env.VITE_RAZORPAY_KEY_ID)
        : import.meta.env.VITE_RAZORPAY_KEY_ID) || '';
      if (!keyId) {
        throw new Error('Razorpay key not configured (VITE_RAZORPAY_KEY_ID)');
      }

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'NeuroCare AI',
        description: `${plan} Subscription (${billingCycle})${isTestMode ? ' [TEST]' : ''}`,
        order_id: order.id,
        prefill: {
          name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
          email: user?.email || (isTestMode ? 'test@example.com' : ''),
          contact: user?.phone || (isTestMode ? '9999999999' : '')
        },
        notes: {
          plan,
          billingCycle,
          environment: isTestMode ? 'test' : 'live'
        },
        theme: { color: '#4F46E5' },
        handler: async (response) => {
          try {
            const verifyRes = await mongodbService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              isTestMode
            });
            if (verifyRes.error) throw new Error(verifyRes.error.message);
            setSuccess('Subscription activated successfully!');
            setTimeout(() => navigate('/dashboard'), 1200);
          } catch (ve) {
            setError(ve.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setError('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        const details = resp?.error?.description || resp?.error?.reason || 'Payment failed';
        setError(details);
      });
      rzp.open();
    } catch (e) {
      setError(e.message || 'Failed to start checkout');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

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
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
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
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
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
                <button className="p-2 rounded-lg hover:bg-gray-50 text-gray-600" onClick={() => setShowNotif((v) => !v)} aria-label="Notifications">
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
                      <button className="text-xs text-gray-600 hover:underline" onClick={() => { setNotifItems([]); setNotifCount(0); }}>Clear</button>
                      <button className="text-xs text-blue-600 hover:underline" onClick={() => setShowNotif(false)}>Close</button>
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
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.user_metadata?.full_name || user?.email || 'User')}
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
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm bg-blue-50 text-blue-600"
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
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left rounded-lg transition-colors ${item.id === 'subscription'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                >
                  <item.icon className="text-sm" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Page Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaCrown className="text-yellow-500" />
                Subscription Plans
              </h1>
              <p className="text-gray-600">Choose the perfect plan for your healthcare needs</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* Billing Toggle */}
        <div className="text-center mb-12">
          <div className="inline-flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${billingCycle === 'monthly'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${billingCycle === 'yearly'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${selectedPlan === plan.id
                  ? `border-${plan.color}-500 ring-4 ring-${plan.color}-100`
                  : 'border-gray-200 hover:border-gray-300'
                } ${plan.popular ? 'transform scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <FaStar className="text-xs" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                  <div className="mb-4">
                    <div className="text-4xl font-bold text-gray-900">
                      ₹{plan.price[billingCycle].toLocaleString()}
                    </div>
                    <div className="text-gray-600">
                      {billingCycle === 'yearly' ? '/year' : '/month'}
                      {billingCycle === 'yearly' && plan.price.yearly > 0 && (
                        <div className="text-sm text-green-600 font-medium">
                          ₹{Math.round(plan.price.yearly / 12)}/month billed yearly
                        </div>
                      )}
                    </div>
                  </div>

                  {plan.savings && billingCycle === 'yearly' && (
                    <div className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full inline-block mb-4">
                      {plan.savings}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`w-full py-3 rounded-xl font-bold transition-all duration-200 mb-6 ${selectedPlan === plan.id
                      ? `bg-${plan.color}-500 text-white shadow-lg`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </button>

                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <FaCheck className="text-green-500 text-sm flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}

                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center gap-3 opacity-60">
                      <FaTimes className="text-gray-400 text-sm flex-shrink-0" />
                      <span className="text-gray-500 text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Section */}
        {selectedPlan !== 'basic' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Subscription</h3>
            {isTestMode && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                Test mode is ON. Payments use Razorpay Test Key and a nominal amount (₹1). Use test card 4111 1111 1111 1111, any future date, any CVV, and OTP 123456.
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-bold text-gray-900 mb-4">Order Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{currentPlan?.name} Plan</span>
                    <span className="font-semibold">₹{price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Billing Cycle</span>
                    <span className="font-semibold capitalize">{billingCycle}</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <div className="flex justify-between text-green-600">
                      <span>Yearly Discount (17%)</span>
                      <span>-₹{Math.round(price * 0.17).toLocaleString()}</span>
                    </div>
                  )}
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <FaShieldAlt className="text-sm" />
                    <span className="font-semibold">7-Day Free Trial</span>
                  </div>
                  <p className="text-blue-600 text-sm">
                    Start your free trial today. Cancel anytime during the trial period.
                  </p>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <h4 className="font-bold text-gray-900 mb-4">Payment Method</h4>
                <div className="space-y-3 mb-6">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors cursor-pointer">
                      <method.icon className="text-xl text-gray-600" />
                      <span className="font-medium">{method.name}</span>
                    </div>
                  ))}
                </div>

                {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
                {success && <p className="text-green-600 text-sm mb-3">{success}</p>}
                <button
                  onClick={handleStartTrial}
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg disabled:opacity-60"
                >
                  {submitting ? 'Activating…' : 'Start Free Trial'}
                </button>

                <p className="text-center text-gray-500 text-sm mt-4">
                  By subscribing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Features Comparison */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Feature Comparison</h3>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-6 font-bold text-gray-900">Features</th>
                    <th className="text-center p-6 font-bold text-gray-900">Basic</th>
                    <th className="text-center p-6 font-bold text-gray-900 bg-yellow-50">Premium</th>
                    <th className="text-center p-6 font-bold text-gray-900">Family</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'MRI Upload & Analysis', basic: true, premium: true, family: true },
                    { feature: 'Basic AI Insights', basic: true, premium: true, family: true },
                    { feature: 'Doctor Chat', basic: false, premium: true, family: true },
                    { feature: 'Video Consultations', basic: false, premium: true, family: true },
                    { feature: 'Priority Appointments', basic: false, premium: true, family: true },
                    { feature: 'Advanced AI Analysis', basic: false, premium: true, family: true },
                    { feature: '24/7 Support', basic: false, premium: true, family: true },
                    { feature: 'Family Management', basic: false, premium: false, family: true },
                  ].map((row, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      <td className="p-6 font-medium text-gray-900">{row.feature}</td>
                      <td className="text-center p-6">
                        {row.basic ? <FaCheck className="text-green-500 mx-auto" /> : <FaTimes className="text-gray-300 mx-auto" />}
                      </td>
                      <td className="text-center p-6 bg-yellow-50">
                        {row.premium ? <FaCheck className="text-green-500 mx-auto" /> : <FaTimes className="text-gray-300 mx-auto" />}
                      </td>
                      <td className="text-center p-6">
                        {row.family ? <FaCheck className="text-green-500 mx-auto" /> : <FaTimes className="text-gray-300 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}