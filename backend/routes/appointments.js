const express = require('express');
const jwt = require('jsonwebtoken');
const { Appointment, Availability } = require('../models/Appointment');
const { PaymentService } = require('../services/PaymentService');
const { User } = require('../models/User');

const router = express.Router();
const paymentService = new PaymentService();

// Simple authentication middleware (you can enhance this)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Apply authentication to all routes
router.use(authenticateToken);

// Create appointment with payment integration
router.post('/book-with-payment', async (req, res) => {
  try {
    const { doctorId, date, time, notes, mode, isTestMode = false } = req.body;
    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: 'doctorId, date and time are required' });
    }

    // Validate doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor' || doctor.approvalStatus !== 'approved') {
      return res.status(400).json({ message: 'Selected doctor is not available' });
    }

    // Check doctor availability for the selected date and time
    const availability = await Availability.findOne({ doctorId, date });
    if (!availability || !availability.slots.includes(time)) {
      return res.status(400).json({ message: 'Selected time slot is not available for this doctor' });
    }

    // Check if the slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $in: ['pending', 'approved'] }
    });
    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Create appointment first
    const appointment = new Appointment({
      patientId: req.user.userId,
      doctorId,
      date,
      time,
      mode: mode === 'offline' ? 'offline' : 'online',
      notes,
      status: 'approved'
    });
    await appointment.save();

    // Create payment order
    const { order, paymentId } = await paymentService.createConsultationOrder(
      doctor, 
      req.user.userId, 
      appointment._id, 
      isTestMode
    );

    res.json({ 
      appointment: {
        id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        mode: appointment.mode,
        status: appointment.status,
        notes: appointment.notes,
        doctorId: doctor._id,
        doctor: {
          id: doctor._id,
          name: `Dr. ${doctor.firstName} ${doctor.lastName}`.trim(),
          specialization: doctor.specialization,
          hospital: doctor.hospital
        }
      },
      order, 
      paymentId 
    });
  } catch (error) {
    console.error('Create appointment with payment error:', error);
    res.status(500).json({ message: 'Failed to create appointment with payment' });
  }
});

// Verify consultation payment
router.post('/pay/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isTestMode = false, paymentId } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    const payment = await paymentService.verifyConsultationPayment(
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      isTestMode
    );

    if (String(payment.patientId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized for this payment' });
    }

    // If payment is for an existing appointment, automatically approve it
    let approvedAppointment = null;
    if (payment.appointmentId) {
      const appointment = await Appointment.findById(payment.appointmentId);
      if (appointment && appointment.status === 'pending') {
        appointment.status = 'approved';
        appointment.updatedAt = new Date();
        await appointment.save();
        approvedAppointment = {
          id: appointment._id,
          date: appointment.date,
          time: appointment.time,
          mode: appointment.mode,
          status: appointment.status,
          notes: appointment.notes
        };

        // Notify patient and doctor about automatic approval
        const approvalPayload = {
          type: 'appointment_auto_approved',
          appointment: approvedAppointment,
          createdAt: new Date().toISOString()
        };
        emitToUser(String(appointment.patientId), 'notification', approvalPayload);
        emitToUser(String(appointment.doctorId), 'notification', approvalPayload);
        emitToUser(String(appointment.patientId), 'stats_update', { reason: 'appointment_auto_approved' });
        emitToUser(String(appointment.doctorId), 'stats_update', { reason: 'appointment_auto_approved' });
      }
    }

    res.json({ success: true, payment: {
      id: String(payment._id),
      doctorId: String(payment.doctorId),
      patientId: String(payment.patientId),
      amountInRupees: payment.amountInRupees,
      status: payment.status,
      appointmentId: payment.appointmentId ? String(payment.appointmentId) : null
    }, appointment: approvedAppointment });
  } catch (error) {
    console.error('Verify consultation payment error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
});

module.exports = router;
