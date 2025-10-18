import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCrown, FaCheck, FaTimes, FaArrowLeft, FaVideo, FaComments, 
  FaCalendarAlt, FaBrain, FaShieldAlt, FaHeadset, FaStar,
  FaCreditCard, FaPaypal, FaGooglePay
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
  const { user, authType } = useAuth();
  const isTestMode = (import.meta.env?.VITE_RAZORPAY_TEST_MODE === 'true') || (import.meta.env?.MODE !== 'production');

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" style={{fontFamily: 'Times New Roman, serif'}}>
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 px-8 py-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaCrown className="text-yellow-500" />
              Subscription Plans
            </h1>
            <p className="text-gray-600">Choose the perfect plan for your healthcare needs</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        
        {/* Billing Toggle */}
        <div className="text-center mb-12">
          <div className="inline-flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingCycle === 'monthly' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingCycle === 'yearly' 
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
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                selectedPlan === plan.id 
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
                  className={`w-full py-3 rounded-xl font-bold transition-all duration-200 mb-6 ${
                    selectedPlan === plan.id
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