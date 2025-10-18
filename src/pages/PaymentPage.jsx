import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaCreditCard, FaShieldAlt, FaCheck } from 'react-icons/fa';
import { mongodbService } from '../lib/mongodb';
import { useAuth } from '../contexts/AuthContext';

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Get appointment data from navigation state
  const appointmentData = location.state?.appointmentData;
  const doctorData = location.state?.doctorData;

  console.log('PaymentPage - User:', user);
  console.log('PaymentPage - Token:', mongodbService.token);

  useEffect(() => {
    if (!appointmentData || !doctorData) {
      navigate('/appointments');
    }
    if (!user) {
      navigate('/login');
    }
  }, [appointmentData, doctorData, user, navigate]);

  const handlePayment = async () => {
    if (!appointmentData || !doctorData) return;
    
    setLoading(true);
    setError('');
    
    console.log('Starting payment process...', { appointmentData, doctorData });
    
    try {
      // Load Razorpay script
      if (!window.Razorpay) {
        console.log('Loading Razorpay script...');
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Razorpay'));
          document.body.appendChild(script);
        });
      }
      
      console.log('Creating appointment with payment...');
      // Create appointment with payment
      const { data, error: bookingError } = await mongodbService.createAppointmentWithPayment({
        doctorId: doctorData.id,
        date: appointmentData.date,
        time: appointmentData.time,
        notes: appointmentData.notes,
        mode: appointmentData.mode,
        isTestMode: false
      });
      
      console.log('Appointment creation response:', { data, error: bookingError });
      
      if (bookingError) throw new Error(bookingError.message);
      if (!data?.order?.id) throw new Error('Failed to create booking order');
      
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
      if (!keyId) throw new Error('Razorpay key not configured (VITE_RAZORPAY_KEY_ID).');
      
      console.log('Initializing Razorpay...');
      // Initialize Razorpay
      const rzp = new window.Razorpay({
        key: keyId,
        amount: data.order.amount,
        currency: data.order.currency || 'INR',
        name: 'NeuroCare AI',
        description: 'Consultation Fee',
        order_id: data.order.id,
        prefill: {
          name: 'Patient',
          email: 'patient@example.com'
        },
        notes: data.order.notes || {},
        handler: async (response) => {
          try {
            const verify = await mongodbService.verifyConsultationPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: data.paymentId,
            });
            if (verify.error) throw new Error(verify.error.message);
            
            setSuccess(true);
            setTimeout(() => {
              navigate('/appointments');
            }, 3000);
          } catch (verificationError) {
            setError(verificationError.message || 'Payment verification failed');
            setLoading(false);
          }
        },
        modal: { 
          ondismiss: () => {
            setLoading(false);
            setError('Payment cancelled by user');
          }
        },
        theme: { 
          color: '#0ea5e9',
          backdrop_color: 'rgba(0,0,0,0.5)'
        },
      });
      
      rzp.on('payment.failed', (resp) => {
        const details = resp?.error?.description || resp?.error?.reason || 'Payment failed';
        setError(details);
        setLoading(false);
      });
      
      rzp.open();
    } catch (paymentError) {
      setError(paymentError.message || 'Failed to start payment');
      setLoading(false);
    }
  };

  if (!appointmentData || !doctorData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">No appointment data found</h2>
          <p className="text-gray-600 mb-4">Please go back and select a doctor with consultation fee.</p>
          <button 
            onClick={() => navigate('/appointments')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheck className="text-2xl text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Your appointment has been automatically booked.</p>
          <p className="text-sm text-gray-500">Redirecting to appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/appointments')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Complete Payment</h1>
              <p className="text-gray-600">Secure your consultation appointment</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Appointment Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Appointment Summary</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={doctorData.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(doctorData.name || 'Doctor')}`}
                  alt={doctorData.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{doctorData.name}</h3>
                  <p className="text-sm text-gray-600">{doctorData.specialization}</p>
                  <p className="text-sm text-gray-500">{doctorData.hospital}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="font-medium">{appointmentData.date} at {appointmentData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mode</span>
                  <span className="font-medium capitalize">{appointmentData.mode}</span>
                </div>
                {appointmentData.notes && (
                  <div>
                    <span className="text-gray-600">Notes</span>
                    <p className="text-sm text-gray-700 mt-1">{appointmentData.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="text-gray-700">Consultation Fee</span>
                <span className="text-2xl font-bold text-blue-600">₹{doctorData.fee}</span>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaShieldAlt className="text-green-600" />
                  <span>Secure payment powered by Razorpay</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaCreditCard className="text-blue-600" />
                  <span>All major cards and UPI accepted</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCreditCard />
                    Pay ₹{doctorData.fee}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By proceeding, you agree to our terms and conditions. 
                Your appointment will be automatically confirmed upon successful payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
