const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Consultation Payment Schema
const consultationPaymentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amountInRupees: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String },
  status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const ConsultationPayment = mongoose.model('ConsultationPayment', consultationPaymentSchema);

class PaymentService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }

  async createConsultationOrder(doctor, patientId, appointmentId, isTestMode = false) {
    try {
      const amount = Number(doctor.consultationFeeInRupees || 0);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error('Doctor has not set a valid consultation fee');
      }

      const keyId = isTestMode ? (process.env.RAZORPAY_TEST_KEY_ID || process.env.RAZORPAY_KEY_ID) : process.env.RAZORPAY_KEY_ID;
      const keySecret = isTestMode ? (process.env.RAZORPAY_TEST_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET) : process.env.RAZORPAY_KEY_SECRET;
      
      if (!keyId || !keySecret) {
        throw new Error('Razorpay not configured on server');
      }

      const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

      const notes = {
        type: 'consultation',
        doctorId: String(doctor._id),
        patientId: String(patientId),
        appointmentId: String(appointmentId),
        environment: isTestMode ? 'test' : 'live'
      };

      const order = await razorpay.orders.create({
        amount: Math.max(1, Math.floor(amount * 100)),
        currency: 'INR',
        receipt: `consult_${Date.now()}`,
        notes
      });

      const payment = await ConsultationPayment.create({
        patientId: patientId,
        doctorId: doctor._id,
        amountInRupees: amount,
        currency: 'INR',
        razorpay_order_id: order.id,
        appointmentId: appointmentId
      });

      return { order, paymentId: String(payment._id) };
    } catch (error) {
      throw new Error(`Failed to create consultation order: ${error.message}`);
    }
  }

  async verifyConsultationPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature, isTestMode = false) {
    try {
      const secret = isTestMode ? (process.env.RAZORPAY_TEST_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET) : process.env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        throw new Error('Razorpay not configured on server');
      }

      const expected = crypto.createHmac('sha256', secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
      if (expected !== razorpay_signature) {
        throw new Error('Invalid signature');
      }

      const payment = await ConsultationPayment.findOne({ razorpay_order_id });
      if (!payment) {
        throw new Error('Payment record not found');
      }

      payment.razorpay_payment_id = razorpay_payment_id;
      payment.status = 'paid';
      payment.updatedAt = new Date();
      await payment.save();

      return payment;
    } catch (error) {
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }
}

module.exports = { ConsultationPayment, PaymentService };
