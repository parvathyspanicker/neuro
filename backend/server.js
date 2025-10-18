const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server: SocketIOServer } = require('socket.io');

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurocare')
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  });

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  date_of_birth: { type: String },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  // Doctor onboarding status: pending until admin approves
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  rejectionReason: { type: String }, // Reason for rejection if applicable
  // Password reset support
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  
  // Patient-specific fields
  gender: { type: String, enum: ['male', 'female', 'other', ''] },
  bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''] },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String }
  },
  emergencyContact: {
    name: { type: String },
    relationship: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  medicalHistory: {
    allergies: [{ type: String }],
    medications: [{ type: String }],
    conditions: [{ type: String }],
    surgeries: [{ type: String }]
  },
  insurance: {
    provider: { type: String },
    policyNumber: { type: String },
    groupNumber: { type: String }
  },
  
  // Doctor-specific fields
  license_number: { type: String },
  specialization: { type: String },
  hospital: { type: String },
  experience: { type: String }, // Years of experience
  // Doctor consultation fee in INR (rupees)
  consultationFeeInRupees: { type: Number, min: 0 },
  
  // Additional fields
  membershipType: { type: String, default: 'Basic' },
  isActive: { type: Boolean, default: true },
  profilePicture: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  mode: { type: String, enum: ['online', 'offline'], default: 'online' },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'approved' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

// Doctor Availability Schema
const availabilitySchema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // ISO date (yyyy-mm-dd) as string for easy querying
  date: { type: String, required: true },
  // Array of time strings like "09:00", "09:30"
  slots: [{ type: String }],
  timezone: { type: String, default: 'UTC' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
availabilitySchema.index({ doctorId: 1, date: 1 }, { unique: true });
const Availability = mongoose.model('Availability', availabilitySchema);

// Chat Schemas
const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  updatedAt: { type: Date, default: Date.now }
});
const Conversation = mongoose.model('Conversation', conversationSchema);

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  mediaUrl: { type: String },
  mediaType: { type: String },
  createdAt: { type: Date, default: Date.now },
  seenAt: { type: Date },
  editedAt: { type: Date },
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  deletedForEveryone: { type: Boolean, default: false },
  deletedAt: { type: Date }
});
const Message = mongoose.model('Message', messageSchema);

// Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Presence tracking
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Track pending calls per conversation room to record missed calls
// key: `call:<conversationId>` -> { from: userId, to: userId, startedAt: Date }
const pendingCalls = new Map();

// Forgot Password - request reset token
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) {
      // Do not reveal whether user exists
      return res.json({ message: 'If that account exists, a reset link has been sent' });
    }

    const rawToken = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    user.passwordResetToken = rawToken;
    user.passwordResetExpires = expires;
    await user.save();

    // In production, send email. For now return the token.
    res.json({ message: 'Reset link generated', token: rawToken, expiresAt: expires.toISOString() });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset Password - verify token and set new password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token and password are required' });

    const user = await User.findOne({ passwordResetToken: token, passwordResetExpires: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const onlineUsers = new Map(); // userId -> socketId
const lastSeenMap = new Map(); // userId -> Date

function emitToUser(userId, event, payload) {
  const socketId = onlineUsers.get(String(userId));
  if (socketId) {
    io.to(socketId).emit(event, payload);
  }
}

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) return next(new Error('auth required'));
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, payload) => {
    if (err) return next(new Error('invalid token'));
    socket.user = { userId: payload.userId };
    next();
  });
});

io.on('connection', (socket) => {
  const userId = socket.user.userId;
  onlineUsers.set(String(userId), socket.id);
  io.emit('presence', { userId, online: true, lastSeen: null });

  // Send snapshot of current presence to the newly connected user
  const snapshot = {
    online: Array.from(onlineUsers.keys()),
    lastSeen: Object.fromEntries(Array.from(lastSeenMap.entries()))
  };
  socket.emit('presence_snapshot', snapshot);

  socket.on('join_conversation', async ({ withUserId }) => {
    const convo = await getOrCreateConversation(userId, withUserId);
    socket.join(String(convo._id));
  });

  socket.on('send_message', async ({ toUserId, text }) => {
    if (!text || !toUserId) return;
    const convo = await getOrCreateConversation(userId, toUserId);
    const msg = new Message({ conversationId: convo._id, fromUserId: userId, toUserId, text });
    await msg.save();
    convo.updatedAt = new Date();
    await convo.save();
    const payload = {
      id: msg._id,
      conversationId: convo._id,
      fromUserId: String(userId),
      toUserId: String(toUserId),
      text: msg.text,
      mediaUrl: msg.mediaUrl || null,
      mediaType: msg.mediaType || null,
      createdAt: msg.createdAt,
      seenAt: msg.seenAt || null,
      editedAt: msg.editedAt || null,
      deletedForEveryone: !!msg.deletedForEveryone
    };
    io.to(String(convo._id)).emit('message', payload);
    // Also deliver directly to recipient socket if they're online but not joined to the room
    const recipientSocketId = onlineUsers.get(String(toUserId));
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('message', payload);
    }
  });

  // Typing indicator
  socket.on('typing', async ({ toUserId, typing }) => {
    try {
      if (!toUserId) return;
      const convo = await getOrCreateConversation(userId, toUserId);
      io.to(String(convo._id)).emit('typing', { fromUserId: String(userId), toUserId: String(toUserId), typing: Boolean(typing) });
    } catch (e) {
      // ignore
    }
  });

  // WebRTC signaling
  socket.on('call_join', async ({ withUserId }) => {
    try {
      if (!withUserId) return;
      const convo = await getOrCreateConversation(userId, withUserId);
      const room = `call:${String(convo._id)}`;
      socket.join(room);
      socket.to(room).emit('call_peer_joined', { userId: String(userId) });
    } catch (e) {
      // ignore
    }
  });

  socket.on('call_signal', async ({ withUserId, data }) => {
    try {
      if (!withUserId || !data) return;
      const convo = await getOrCreateConversation(userId, withUserId);
      const room = `call:${String(convo._id)}`;
      // Relay signaling to peer(s)
      socket.to(room).emit('call_signal', { fromUserId: String(userId), data });
      // If this is an offer, mark call as ringing so we can create a missed call later
      if (data?.sdp?.type === 'offer') {
        pendingCalls.set(room, { from: String(userId), to: String(withUserId), startedAt: new Date() });
        // Optional: notify callee directly even if not in room
        emitToUser(String(withUserId), 'incoming_call', { fromUserId: String(userId), conversationId: String(convo._id) });
        // Create a lightweight system message so chat shows "Incoming video call"
        try {
          const msg = new Message({
            conversationId: convo._id,
            fromUserId: userId,
            toUserId: withUserId,
            text: 'Incoming video call'
          });
          await msg.save();
          convo.updatedAt = new Date();
          await convo.save();
          const payload = {
            id: msg._id,
            conversationId: convo._id,
            fromUserId: String(msg.fromUserId),
            toUserId: String(msg.toUserId),
            text: msg.text,
            mediaUrl: null,
            mediaType: null,
            createdAt: msg.createdAt,
            seenAt: null,
            editedAt: null,
            deletedForEveryone: false
          };
          io.to(String(convo._id)).emit('message', payload);
          emitToUser(String(userId), 'message', payload);
          emitToUser(String(withUserId), 'message', payload);
        } catch (e) {
          // ignore insert failure for system message
        }
      }
      // If this is an answer, the call was answered; clear pending marker
      if (data?.sdp?.type === 'answer') {
        pendingCalls.delete(room);
      }
    } catch (e) {
      // ignore
    }
  });

  socket.on('call_end', async ({ withUserId }) => {
    try {
      if (!withUserId) return;
      const convo = await getOrCreateConversation(userId, withUserId);
      const room = `call:${String(convo._id)}`;
      io.to(room).emit('call_ended', { byUserId: String(userId) });
      // If call was ringing and ended without answer, record a system message
      const pending = pendingCalls.get(room);
      if (pending && (String(pending.from) === String(userId) || String(pending.to) === String(userId))) {
        try {
          const msg = new Message({
            conversationId: convo._id,
            fromUserId: pending.from,
            toUserId: pending.to,
            text: 'Missed video call',
          });
          await msg.save();
          convo.updatedAt = new Date();
          await convo.save();
          const payload = {
            id: msg._id,
            conversationId: convo._id,
            fromUserId: String(msg.fromUserId),
            toUserId: String(msg.toUserId),
            text: msg.text,
            mediaUrl: null,
            mediaType: null,
            createdAt: msg.createdAt,
            seenAt: null,
            editedAt: null,
            deletedForEveryone: false
          };
          // Emit to room and directly to both users
          io.to(String(convo._id)).emit('message', payload);
          emitToUser(String(pending.from), 'message', payload);
          emitToUser(String(pending.to), 'message', payload);
          // Dedicated event for UI to show toast
          emitToUser(String(pending.to), 'call_missed', { fromUserId: String(pending.from), conversationId: String(convo._id), at: new Date().toISOString() });
        } catch (err) {
          // ignore
        } finally {
          pendingCalls.delete(room);
        }
      }
    } catch (e) {
      // ignore
    }
  });

  socket.on('mark_seen', async ({ conversationId }) => {
    if (!conversationId) return;
    await Message.updateMany({ conversationId, toUserId: userId, seenAt: { $exists: false } }, { $set: { seenAt: new Date() } });
    io.to(String(conversationId)).emit('seen_update', { conversationId, seenAt: new Date(), seenBy: String(userId) });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(String(userId));
    const now = new Date();
    lastSeenMap.set(String(userId), now);
    io.emit('presence', { userId, online: false, lastSeen: now });
  });
});

async function getOrCreateConversation(a, b) {
  const ids = [a, b].map(String).sort();
  let convo = await Conversation.findOne({ participants: { $all: ids, $size: 2 } });
  if (!convo) {
    convo = new Conversation({ participants: ids });
    await convo.save();
  }
  return convo;
}

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
// Doctor: upsert availability for a given date
app.put('/api/doctor/availability', authenticateToken, async (req, res) => {
  try {
    const doctorUser = await User.findById(req.user.userId);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctor only.' });
    }
    const { date, slots = [], timezone = 'UTC' } = req.body || {};
    if (!date || !Array.isArray(slots)) {
      return res.status(400).json({ message: 'date and slots[] are required' });
    }
    const cleanSlots = Array.from(new Set(slots.filter(Boolean)));
    const doc = await Availability.findOneAndUpdate(
      { doctorId: doctorUser._id, date },
      { $set: { slots: cleanSlots, timezone, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { new: true, upsert: true }
    );
    res.json({ availability: { doctorId: String(doc.doctorId), date: doc.date, slots: doc.slots, timezone: doc.timezone } });
  } catch (error) {
    console.error('Upsert availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public: list available doctors and free slots for a date
app.get('/api/availability', async (req, res) => {
  try {
    const { date } = req.query;
    console.log('Availability API called with date:', date);
    if (!date) return res.status(400).json({ message: 'date is required (yyyy-mm-dd)' });
    // Find availabilities for the date
    const avails = await Availability.find({ date }).lean();
    console.log('Found availabilities:', avails.length, 'for date:', date);
    // Get already booked appointments for that date
    const booked = await Appointment.find({ date }).select('doctorId time').lean();
    const bookedMap = new Map(); // key: doctorId, value: Set(times)
    booked.forEach(b => {
      const key = String(b.doctorId);
      if (!bookedMap.has(key)) bookedMap.set(key, new Set());
      bookedMap.get(key).add(b.time);
    });
    // attach doctor detail and filter out booked slots
    const doctorIds = avails.map(a => a.doctorId);
    // Show availability regardless of approval status to avoid hiding set schedules
    const doctors = await User.find({ _id: { $in: doctorIds }, role: 'doctor' })
      .select('firstName lastName specialization hospital profilePicture approvalStatus consultationFeeInRupees');
    const docMap = new Map(doctors.map(d => [String(d._id), d]));
    const result = avails.map(a => {
      const d = docMap.get(String(a.doctorId));
      const taken = bookedMap.get(String(a.doctorId)) || new Set();
      const freeSlots = (a.slots || []).filter(s => !taken.has(s));
      return {
        doctor: d ? {
          id: String(d._id),
          name: `Dr. ${d.firstName} ${d.lastName}`.trim(),
          specialization: d.specialization,
          hospital: d.hospital,
          avatar: d.profilePicture,
          approvalStatus: d.approvalStatus,
          consultationFeeInRupees: typeof d.consultationFeeInRupees === 'number' ? d.consultationFeeInRupees : null
        } : { id: String(a.doctorId) },
        date: a.date,
        slots: freeSlots,
        timezone: a.timezone
      };
    });
    // Don't filter out doctors with no slots - show them with empty slots array
    // The frontend will handle displaying appropriate messages
    res.json({ availability: result });
  } catch (error) {
    console.error('List availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Subscription: start or change membership
app.post('/api/subscription/start', authenticateToken, async (req, res) => {
  try {
    const { plan = 'Premium' } = req.body;
    const allowed = ['Basic', 'Premium', 'Family'];
    const selected = allowed.includes(plan) ? plan : 'Premium';

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { membershipType: selected, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({ message: 'Subscription activated', user });
  } catch (error) {
    console.error('Start subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Doctor: list own appointment requests
app.get('/api/doctor/appointments', authenticateToken, async (req, res) => {
  try {
    const doctorUser = await User.findById(req.user.userId);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctor only.' });
    }

    // Get appointments that are approved AND have a corresponding paid consultation payment
    const list = await Appointment.aggregate([
      {
        $match: {
          doctorId: doctorUser._id,
          status: 'approved'
        }
      },
      {
        $lookup: {
          from: 'consultationpayments',
          localField: '_id',
          foreignField: 'appointmentId',
          as: 'payments'
        }
      },
      {
        $match: {
          'payments.status': 'paid' // Only show appointments with paid consultation payments
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'patientId',
          foreignField: '_id',
          as: 'patientData'
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    // Format the results to match the expected structure
    const appointments = list.map(a => ({
      id: a._id,
      date: a.date,
      time: a.time,
      mode: a.mode,
      status: a.status,
      notes: a.notes,
      payment: a.payments && a.payments[0] ? {
        id: a.payments[0]._id,
        amount: a.payments[0].amountInRupees,
        currency: a.payments[0].currency,
        status: a.payments[0].status,
        razorpay_payment_id: a.payments[0].razorpay_payment_id,
        razorpay_order_id: a.payments[0].razorpay_order_id,
        paidAt: a.payments[0].updatedAt
      } : null,
      patient: a.patientData && a.patientData[0] ? {
        id: a.patientData[0]._id,
        name: `${a.patientData[0].firstName} ${a.patientData[0].lastName}`.trim(),
        email: a.patientData[0].email,
        phone: a.patientData[0].phone,
        date_of_birth: a.patientData[0].date_of_birth,
        gender: a.patientData[0].gender,
        bloodType: a.patientData[0].bloodType
      } : null
    }));

    res.json({ appointments });
  } catch (error) {
    console.error('Doctor list appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Doctor: list patients who have approved appointments with this doctor
app.get('/api/doctor/patients', authenticateToken, async (req, res) => {
  try {
    const doctorUser = await User.findById(req.user.userId);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctor only.' });
    }

    // Get patients who have approved appointments with this doctor
    const appointments = await Appointment.find({ 
      doctorId: doctorUser._id, 
      status: 'approved' 
    }).populate('patientId', 'firstName lastName email profilePicture').sort({ createdAt: -1 });

    // Group appointments by patient and calculate statistics
    const patientMap = new Map();
    
    appointments.forEach(appointment => {
      const patientId = appointment.patientId._id.toString();
      
      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          id: patientId,
          name: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`.trim() || appointment.patientId.email,
          email: appointment.patientId.email,
          avatar: appointment.patientId.profilePicture,
          appointmentCount: 0,
          lastAppointmentDate: null,
          lastAppointmentStatus: null,
          appointments: []
        });
      }
      
      const patient = patientMap.get(patientId);
      patient.appointmentCount++;
      patient.appointments.push({
        id: appointment._id,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        createdAt: appointment.createdAt
      });
      
      // Update last appointment info (since appointments are sorted by createdAt desc)
      if (!patient.lastAppointmentDate || appointment.createdAt > new Date(patient.lastAppointmentDate)) {
        patient.lastAppointmentDate = appointment.createdAt;
        patient.lastAppointmentStatus = appointment.status;
      }
    });

    const patients = Array.from(patientMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    res.json({ patients });
  } catch (error) {
    console.error('Doctor list patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Presence: get presence for a user
app.get('/api/chat/presence/:userId', async (req, res) => {
  try {
    const target = String(req.params.userId);
    const isOnline = onlineUsers.has(target);
    const lastSeen = lastSeenMap.get(target) || null;
    res.json({ userId: target, online: isOnline, lastSeen });
  } catch (error) {
    console.error('Presence error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Chat: get messages with a specific doctor (patient perspective)
app.get('/api/chat/conversations/:withUserId/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { withUserId } = req.params;
    const convo = await getOrCreateConversation(userId, withUserId);
    const msgs = await Message.find({ conversationId: convo._id }).sort({ createdAt: 1 });
    res.json({ conversationId: convo._id, messages: msgs.map(m => ({
      id: m._id,
      fromUserId: String(m.fromUserId),
      toUserId: String(m.toUserId),
      text: m.text,
      mediaUrl: m.mediaUrl || null,
      mediaType: m.mediaType || null,
      createdAt: m.createdAt,
      seenAt: m.seenAt || null,
      editedAt: m.editedAt || null,
      deletedForEveryone: !!m.deletedForEveryone,
      deletedFor: (m.deletedFor || []).map(String)
    })) });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Chat: send message (REST fallback)
app.post('/api/chat/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { toUserId, text, mediaUrl, mediaType } = req.body;
    if (!toUserId || (!text && !mediaUrl)) return res.status(400).json({ message: 'toUserId and text or media required' });
    const convo = await getOrCreateConversation(userId, toUserId);
    const msg = new Message({ conversationId: convo._id, fromUserId: userId, toUserId, text: text || '', mediaUrl, mediaType });
    await msg.save();
    convo.updatedAt = new Date();
    await convo.save();
    const payload = {
      id: msg._id,
      conversationId: convo._id,
      fromUserId: String(userId),
      toUserId: String(toUserId),
      text: msg.text,
      mediaUrl: msg.mediaUrl || null,
      mediaType: msg.mediaType || null,
      createdAt: msg.createdAt,
      seenAt: msg.seenAt || null,
      editedAt: msg.editedAt || null,
      deletedForEveryone: !!msg.deletedForEveryone
    };
    io.to(String(convo._id)).emit('message', payload);
    res.status(201).json({ message: payload });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload image to Cloudinary
app.post('/api/chat/upload-image', authenticateToken, async (req, res) => {
  try {
    const { dataUri } = req.body; // e.g., data:image/png;base64,xxxx
    if (!dataUri) return res.status(400).json({ message: 'dataUri required' });
    const result = await cloudinary.uploader.upload(dataUri, { folder: 'neurocare_chat', resource_type: 'image' });
    res.json({ url: result.secure_url, width: result.width, height: result.height, format: result.format });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
});
// Public: List doctors (optionally filter by status/search)
app.get('/api/doctors', async (req, res) => {
  try {
    const { status = 'approved', search } = req.query;

    const filter = { role: 'doctor' };
    if (status && status !== 'all') {
      filter.approvalStatus = status;
    }
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { hospital: { $regex: search, $options: 'i' } }
      ];
    }

    const doctors = await User.find(filter).select('-password').sort({ createdAt: -1 });

    const formatted = doctors.map((d) => ({
      id: d._id,
      name: `Dr. ${d.firstName} ${d.lastName}`.trim(),
      email: d.email,
      phone: d.phone,
      specialization: d.specialization,
      hospital: d.hospital,
      experience: d.experience,
      avatar: d.profilePicture,
      consultationFeeInRupees: typeof d.consultationFeeInRupees === 'number' ? d.consultationFeeInRupees : null
    }));

    res.json({ doctors: formatted });
  } catch (error) {
    console.error('List doctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Doctor: set consultation fee (INR)
app.put('/api/doctor/consultation-fee', authenticateToken, async (req, res) => {
  try {
    const doctorUser = await User.findById(req.user.userId);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctor only.' });
    }
    const { amountInRupees } = req.body || {};
    const amount = Number(amountInRupees);
    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    doctorUser.consultationFeeInRupees = Math.floor(amount);
    doctorUser.updatedAt = new Date();
    await doctorUser.save();
    res.json({ consultationFeeInRupees: doctorUser.consultationFeeInRupees });
  } catch (error) {
    console.error('Set consultation fee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public: get a doctor's consultation fee
app.get('/api/doctors/:doctorId/consultation-fee', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await User.findById(doctorId).select('role approvalStatus consultationFeeInRupees firstName lastName');
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ doctorId: String(doctor._id), name: `Dr. ${doctor.firstName} ${doctor.lastName}`.trim(), consultationFeeInRupees: typeof doctor.consultationFeeInRupees === 'number' ? doctor.consultationFeeInRupees : null, approvalStatus: doctor.approvalStatus });
  } catch (error) {
    console.error('Get consultation fee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Authenticated: Get my appointments (as patient)
app.get('/api/appointments', authenticateToken, async (req, res) => {
  try {
    // Patients see their own appointments; doctors could later see theirs
    const userId = req.user.userId;

    const list = await Appointment.find({ patientId: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'doctorId',
        select: 'firstName lastName specialization hospital role approvalStatus'
      });

    const appointments = list.map((a) => ({
      id: a._id,
      date: a.date,
      time: a.time,
      mode: a.mode,
      status: a.status,
      notes: a.notes,
      doctorId: a.doctorId?._id,
      doctor: a.doctorId
        ? {
            id: a.doctorId._id,
            name: `Dr. ${a.doctorId.firstName} ${a.doctorId.lastName}`.trim(),
            specialization: a.doctorId.specialization,
            hospital: a.doctorId.hospital
          }
        : null
    }));

    res.json({ appointments });
  } catch (error) {
    console.error('List appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reports/Stats for dashboard and reports page
app.get('/api/stats/overview', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const totalAppointments = await Appointment.countDocuments({ patientId: userId });
    const upcomingAppointments = await Appointment.countDocuments({ patientId: userId, status: { $in: ['pending', 'approved'] } });
    const recentMessages = await Message.countDocuments({ toUserId: userId, seenAt: { $exists: false } });
    const activeDoctors = await User.countDocuments({ role: 'doctor', approvalStatus: 'approved' });

    res.json({
      totalAppointments,
      upcomingAppointments,
      recentMessages,
      activeDoctors
    });
  } catch (error) {
    console.error('Stats overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Authenticated: Create appointment
app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { doctorId, date, time, notes, mode } = req.body;
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

    const response = {
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
    };

    res.status(201).json({ appointment: response });

    // realtime: notify patient and doctor
    const notificationPayload = {
      type: 'appointment_created',
      appointment: response,
      createdAt: new Date().toISOString()
    };
    emitToUser(String(doctor._id), 'notification', notificationPayload);
    emitToUser(req.user.userId, 'stats_update', { reason: 'appointment_created' });
    emitToUser(String(doctor._id), 'stats_update', { reason: 'appointment_created' });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Authenticated: Cancel appointment (patient-owned)
app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const appt = await Appointment.findById(id);
    if (!appt) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    if (String(appt.patientId) !== String(userId)) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }

    await Appointment.findByIdAndDelete(id);
    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, date_of_birth, role, license_number, specialization, hospital, experience } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      date_of_birth,
      role: role || 'patient',
      // If registering as doctor, set approvalStatus to pending
      approvalStatus: role === 'doctor' ? 'pending' : 'approved',
      ...(role === 'doctor' && {
        license_number,
        specialization,
        hospital,
        experience
      })
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, approvalStatus: user.approvalStatus },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return user data (without password)
    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      date_of_birth: user.date_of_birth,
      role: user.role,
      approvalStatus: user.approvalStatus,
      license_number: user.license_number,
      specialization: user.specialization,
      hospital: user.hospital,
      experience: user.experience,
      membershipType: user.membershipType,
      createdAt: user.createdAt
    };

    res.status(201).json({ user: userData, token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Require admin approval for doctor login
    if (user.role === 'doctor' && user.approvalStatus !== 'approved') {
      return res.status(403).json({ message: 'Your account is pending approval. Please wait for admin approval.' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, approvalStatus: user.approvalStatus },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return user data (without password)
    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      date_of_birth: user.date_of_birth,
      role: user.role,
      approvalStatus: user.approvalStatus, // include approval status so frontend can gate access
      license_number: user.license_number,
      specialization: user.specialization,
      hospital: user.hospital,
      membershipType: user.membershipType,
      createdAt: user.createdAt
    };

    res.json({ user: userData, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, date_of_birth, license_number, specialization, hospital } = req.body;

    const updateData = {
      firstName,
      lastName,
      phone,
      date_of_birth,
      updatedAt: new Date()
    };

    // Add doctor-specific fields if user is a doctor
    const user = await User.findById(req.user.userId);
    if (user.role === 'doctor') {
      updateData.license_number = license_number;
      updateData.specialization = specialization;
      updateData.hospital = hospital;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Routes - Get all users with filtering
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const adminUser = await User.findById(req.user.userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { role, search, page = 1, limit = 10 } = req.query;
    
    // Build filter query
    let filter = { role: { $ne: 'admin' } }; // Exclude admin users by default
    if (role && role !== 'all') {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Routes - Update user role
app.put('/api/admin/users/:userId/role', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const adminUser = await User.findById(req.user.userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (!['patient', 'doctor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: updatedUser, message: 'User role updated successfully' });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Routes - Update user details
app.put('/api/admin/users/:userId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const adminUser = await User.findById(req.user.userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { userId } = req.params;
    const updateData = { ...req.body };
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData._id;
    delete updateData.createdAt;
    
    // Set updated timestamp
    updateData.updatedAt = new Date();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: updatedUser, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Routes - Get pending doctor requests
app.get('/api/admin/doctor-requests', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const adminUser = await User.findById(req.user.userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { status, specialization, search, page = 1, limit = 10 } = req.query;
    
    // Build filter query for doctors
    let filter = { role: 'doctor' };
    
    if (status && status !== 'all') {
      filter.approvalStatus = status;
    }
    
    if (specialization && specialization !== 'all') {
      filter.specialization = { $regex: specialization, $options: 'i' };
    }
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { license_number: { $regex: search, $options: 'i' } },
        { experience: { $regex: search, $options: 'i' } }
      ];
    }

    // Get doctors with pagination
    const doctors = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    // Format the response to match frontend expectations
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor._id,
      name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      email: doctor.email,
      phone: doctor.phone,
      license: doctor.license_number,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
      department: doctor.specialization, // Using specialization as department for now
      experience: doctor.experience || 'Not specified',
      requestDate: doctor.createdAt.toISOString().split('T')[0],
      requestTime: doctor.createdAt.toTimeString().split(' ')[0].substring(0, 5),
      status: doctor.approvalStatus,
      priority: 'medium', // Default priority
      verification: 'pending', // Default verification status
      documents: ['License'], // Default documents
      createdAt: doctor.createdAt
    }));

    res.json({
      doctors: formattedDoctors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get doctor requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Routes - Approve/Reject doctor request
app.put('/api/admin/doctor-requests/:userId/status', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const adminUser = await User.findById(req.user.userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { userId } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected".' });
    }

    const updateData = {
      approvalStatus: status,
      updatedAt: new Date()
    };

    // Add rejection reason if status is rejected
    if (status === 'rejected' && reason) {
      updateData.rejectionReason = reason;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (updatedUser.role !== 'doctor') {
      return res.status(400).json({ message: 'User is not a doctor' });
    }

    res.json({ 
      user: updatedUser, 
      message: `Doctor request ${status} successfully` 
    });
  } catch (error) {
    console.error('Update doctor request status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Routes - Delete user
app.delete('/api/admin/users/:userId', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const adminUser = await User.findById(req.user.userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { userId } = req.params;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Routes - Get user statistics
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const adminUser = await User.findById(req.user.userId);
    if (!adminUser || adminUser.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    // Get recent registrations (last 30 days) - exclude admin users
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      role: { $ne: 'admin' }
    });

    res.json({
      totalUsers,
      totalPatients,
      totalDoctors,
      totalAdmins,
      recentRegistrations
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout (optional - mainly for cleanup)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  // In a real app, you might want to blacklist the token
  res.json({ message: 'Logged out successfully' });
});

// Audit Log Schema
const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // view | edit | prescription | chat | login | ...
  entityType: { type: String }, // patient | report | message | ...
  entityId: { type: String },
  ip: { type: String },
  status: { type: String, default: 'OK' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

auditLogSchema.index({ userId: 1, createdAt: -1 });
const AuditLog = mongoose.model('AuditLog', auditLogSchema);

// Referral Schema
const referralSchema = new mongoose.Schema({
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referredTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
referralSchema.index({ referredBy: 1, referredTo: 1, patientId: 1, status: 1, createdAt: -1 });
const Referral = mongoose.model('Referral', referralSchema);

// Create referral (Doctor only)
// POST /api/referrals { referredTo, patientId, reason, notes }
app.post('/api/referrals', authenticateToken, async (req, res) => {
  try {
    const doctorUser = await User.findById(req.user.userId);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctor only.' });
    }

    const { referredTo, patientId, reason, notes } = req.body || {};
    if (!referredTo || !patientId || !reason) {
      return res.status(400).json({ message: 'referredTo, patientId and reason are required' });
    }

    // Validate users
    const toDoc = await User.findById(referredTo);
    const patient = await User.findById(patientId);
    if (!toDoc || toDoc.role !== 'doctor' || toDoc.approvalStatus !== 'approved') {
      return res.status(400).json({ message: 'Target doctor not valid' });
    }
    if (!patient || patient.role !== 'patient') {
      return res.status(400).json({ message: 'Patient not valid' });
    }

    // Enforce same hospital
    if (!doctorUser.hospital || !toDoc.hospital || String(doctorUser.hospital).trim() !== String(toDoc.hospital).trim()) {
      return res.status(400).json({ message: 'Referral allowed only within the same hospital' });
    }

    // Ensure the patient has an approved appointment with the referring doctor (patient chose this doctor)
    const hasApprovedAppt = await Appointment.exists({ patientId, doctorId: doctorUser._id, status: 'approved' });
    if (!hasApprovedAppt) {
      return res.status(400).json({ message: 'Referral requires an approved appointment with this patient' });
    }

    const referral = new Referral({ referredBy: doctorUser._id, referredTo, patientId, reason, notes });
    await referral.save();

    const payload = {
      id: referral._id,
      referredBy: String(doctorUser._id),
      referredTo: String(referredTo),
      patientId: String(patientId),
      reason,
      notes: notes || '',
      status: referral.status,
      createdAt: referral.createdAt
    };

    // notify referred doctor
    emitToUser(String(referredTo), 'notification', { type: 'referral_created', referral: payload, createdAt: new Date().toISOString() });

    // audit
    await AuditLog.create({ userId: doctorUser._id, action: 'referral_create', entityType: 'referral', entityId: String(referral._id), metadata: { referredTo, patientId } });

    res.status(201).json({ referral: payload });
  } catch (error) {
    console.error('Create referral error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// List referrals for doctor
// GET /api/doctor/referrals/sent
app.get('/api/doctor/referrals/sent', authenticateToken, async (req, res) => {
  try {
    const doctorUser = await User.findById(req.user.userId);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctor only.' });
    }
    const list = await Referral.find({ referredBy: doctorUser._id })
      .sort({ createdAt: -1 })
      .populate('referredTo', 'firstName lastName email specialization')
      .populate('patientId', 'firstName lastName email profilePicture');
    const referrals = list.map(r => ({
      id: r._id,
      referredBy: String(r.referredBy),
      referredTo: r.referredTo ? { id: r.referredTo._id, name: `Dr. ${r.referredTo.firstName} ${r.referredTo.lastName}`.trim(), email: r.referredTo.email, specialization: r.referredTo.specialization } : null,
      patient: r.patientId ? { id: r.patientId._id, name: `${r.patientId.firstName} ${r.patientId.lastName}`.trim(), email: r.patientId.email, avatar: r.patientId.profilePicture } : null,
      reason: r.reason,
      notes: r.notes || '',
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));
    res.json({ referrals });
  } catch (error) {
    console.error('List sent referrals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/doctor/referrals/received
app.get('/api/doctor/referrals/received', authenticateToken, async (req, res) => {
  try {
    const doctorUser = await User.findById(req.user.userId);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctor only.' });
    }
    const list = await Referral.find({ referredTo: doctorUser._id })
      .sort({ createdAt: -1 })
      .populate('referredBy', 'firstName lastName email specialization')
      .populate('patientId', 'firstName lastName email profilePicture');
    const referrals = list.map(r => ({
      id: r._id,
      referredTo: String(r.referredTo),
      referredBy: r.referredBy ? { id: r.referredBy._id, name: `Dr. ${r.referredBy.firstName} ${r.referredBy.lastName}`.trim(), email: r.referredBy.email, specialization: r.referredBy.specialization } : null,
      patient: r.patientId ? { id: r.patientId._id, name: `${r.patientId.firstName} ${r.patientId.lastName}`.trim(), email: r.patientId.email, avatar: r.patientId.profilePicture } : null,
      reason: r.reason,
      notes: r.notes || '',
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));
    res.json({ referrals });
  } catch (error) {
    console.error('List received referrals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update referral status (accept/decline/complete)
// PUT /api/referrals/:id/status { status }
app.put('/api/referrals/:id/status', authenticateToken, async (req, res) => {
  try {
    const doctorUser = await User.findById(req.user.userId);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctor only.' });
    }
    const { id } = req.params;
    const { status } = req.body || {};
    if (!['accepted', 'declined', 'completed'].includes((status || '').toLowerCase())) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const referral = await Referral.findById(id);
    if (!referral) return res.status(404).json({ message: 'Referral not found' });

    const lower = status.toLowerCase();
    // Only referredTo can accept/decline; either doctor can mark completed
    if ((lower === 'accepted' || lower === 'declined') && String(referral.referredTo) !== String(doctorUser._id)) {
      return res.status(403).json({ message: 'Only target doctor can change this status' });
    }
    if (lower === 'completed' && ![String(referral.referredTo), String(referral.referredBy)].includes(String(doctorUser._id))) {
      return res.status(403).json({ message: 'Only involved doctors can complete' });
    }

    referral.status = lower;
    referral.updatedAt = new Date();
    await referral.save();

    const payload = {
      id: referral._id,
      referredBy: String(referral.referredBy),
      referredTo: String(referral.referredTo),
      patientId: String(referral.patientId),
      reason: referral.reason,
      notes: referral.notes || '',
      status: referral.status,
      updatedAt: referral.updatedAt
    };

    // notify both doctors and patient
    emitToUser(String(referral.referredBy), 'notification', { type: 'referral_status', referral: payload, createdAt: new Date().toISOString() });
    emitToUser(String(referral.referredTo), 'notification', { type: 'referral_status', referral: payload, createdAt: new Date().toISOString() });
    emitToUser(String(referral.patientId), 'notification', { type: 'referral_status', referral: payload, createdAt: new Date().toISOString() });

    // audit
    await AuditLog.create({ userId: doctorUser._id, action: 'referral_update', entityType: 'referral', entityId: String(referral._id), metadata: { status: lower } });

    res.json({ referral: payload });
  } catch (error) {
    console.error('Update referral status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Secure: Doctor access to referred patient's history
// GET /api/doctor/patients/:patientId/history
app.get('/api/doctor/patients/:patientId/history', authenticateToken, async (req, res) => {
  try {
    const doctorUser = await User.findById(req.user.userId);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctor only.' });
    }
    const { patientId } = req.params;

    // Ensure patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') return res.status(404).json({ message: 'Patient not found' });

    // Access control: doctor must be referredTo with accepted referral OR have an approved appointment with patient
    const hasAcceptedReferral = await Referral.exists({ patientId, referredTo: doctorUser._id, status: 'accepted' });
    const hasApprovedAppointment = await Appointment.exists({ patientId, doctorId: doctorUser._id, status: 'approved' });
    if (!hasAcceptedReferral && !hasApprovedAppointment) {
      return res.status(403).json({ message: 'Not authorized to view this patient history' });
    }

    const reports = await MRIReport.find({ patientId }).sort({ scanDate: -1 }).lean();
    const appts = await Appointment.find({ patientId, doctorId: doctorUser._id }).sort({ createdAt: -1 }).lean();

    // audit
    await AuditLog.create({ userId: doctorUser._id, action: 'patient_history_view', entityType: 'patient', entityId: String(patientId), metadata: { via: hasAcceptedReferral ? 'referral' : 'appointment' } });

    res.json({
      patient: {
        id: String(patient._id),
        name: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || patient.email,
        email: patient.email,
      },
      reports,
      appointments: appts
    });
  } catch (error) {
    console.error('Get referred patient history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Doctor: Audit logs for own actions
app.get('/api/doctor/audit-logs', authenticateToken, async (req, res) => {
  try {
    const doctorUser = await User.findById(req.user.userId);
    if (!doctorUser || doctorUser.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctor only.' });
    }

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '50', 10), 1), 200);
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({ logs, page, limit });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create Razorpay order for subscription payment
// POST /api/payments/razorpay/order { amountInRupees, receipt, notes }
app.post('/api/payments/razorpay/order', authenticateToken, async (req, res) => {
  try {
    const { amountInRupees, receipt = `rcpt_${Date.now()}`, notes = {}, plan = 'Premium', billingCycle = 'monthly', isTestMode = false } = req.body || {};
    const amountPaise = Math.max(1, Math.floor(Number(amountInRupees) * 100));
    const keyId = isTestMode ? (process.env.RAZORPAY_TEST_KEY_ID || process.env.RAZORPAY_KEY_ID) : process.env.RAZORPAY_KEY_ID;
    const keySecret = isTestMode ? (process.env.RAZORPAY_TEST_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET) : process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return res.status(500).json({ message: 'Razorpay not configured on server' });
    }
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt,
      notes: { ...notes, userId: String(req.user.userId), plan, billingCycle, environment: isTestMode ? 'test' : 'live' }
    });
    res.json({ order });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

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

// Create appointment with payment integration
// POST /api/appointments/book-with-payment { doctorId, date, time, notes, mode, isTestMode? }
app.post('/api/appointments/book-with-payment', authenticateToken, async (req, res) => {
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

    // Create appointment with pending status (will be approved only after payment)
    const appointment = new Appointment({
      patientId: req.user.userId,
      doctorId,
      date,
      time,
      mode: mode === 'offline' ? 'offline' : 'online',
      notes,
      status: 'pending' // Will be approved only after successful payment
    });
    await appointment.save();

    // Create payment order
    const amount = Number(doctor.consultationFeeInRupees || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Doctor has not set a valid consultation fee' });
    }

    const keyId = isTestMode ? (process.env.RAZORPAY_TEST_KEY_ID || process.env.RAZORPAY_KEY_ID) : process.env.RAZORPAY_KEY_ID;
    const keySecret = isTestMode ? (process.env.RAZORPAY_TEST_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET) : process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return res.status(500).json({ message: 'Razorpay not configured on server' });
    }
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const notes_payment = {
      type: 'consultation',
      doctorId: String(doctor._id),
      patientId: String(req.user.userId),
      appointmentId: String(appointment._id),
      environment: isTestMode ? 'test' : 'live'
    };
    const order = await razorpay.orders.create({
      amount: Math.max(1, Math.floor(amount * 100)),
      currency: 'INR',
      receipt: `consult_${Date.now()}`,
      notes: notes_payment
    });

    const cp = await ConsultationPayment.create({
      patientId: req.user.userId,
      doctorId: doctor._id,
      amountInRupees: amount,
      currency: 'INR',
      razorpay_order_id: order.id,
      appointmentId: appointment._id
    });

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
      paymentId: String(cp._id) 
    });
  } catch (error) {
    console.error('Create appointment with payment error:', error);
    res.status(500).json({ message: 'Failed to create appointment with payment' });
  }
});

// Create Razorpay order for a doctor's consultation fee
// POST /api/consultations/:doctorId/pay/order { appointmentId?, isTestMode? }
app.post('/api/consultations/:doctorId/pay/order', authenticateToken, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { isTestMode = false, appointmentId } = req.body || {};

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor' || doctor.approvalStatus !== 'approved') {
      return res.status(400).json({ message: 'Selected doctor is not available' });
    }
    const amount = Number(doctor.consultationFeeInRupees || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Doctor has not set a valid consultation fee' });
    }

    const keyId = isTestMode ? (process.env.RAZORPAY_TEST_KEY_ID || process.env.RAZORPAY_KEY_ID) : process.env.RAZORPAY_KEY_ID;
    const keySecret = isTestMode ? (process.env.RAZORPAY_TEST_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET) : process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return res.status(500).json({ message: 'Razorpay not configured on server' });
    }
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const notes = {
      type: 'consultation',
      doctorId: String(doctor._id),
      patientId: String(req.user.userId),
      appointmentId: appointmentId ? String(appointmentId) : undefined,
      environment: isTestMode ? 'test' : 'live'
    };
    const order = await razorpay.orders.create({
      amount: Math.max(1, Math.floor(amount * 100)),
      currency: 'INR',
      receipt: `consult_${Date.now()}`,
      notes
    });

    const cp = await ConsultationPayment.create({
      patientId: req.user.userId,
      doctorId: doctor._id,
      amountInRupees: amount,
      currency: 'INR',
      razorpay_order_id: order.id,
      appointmentId: appointmentId || undefined
    });

    res.json({ order, paymentId: String(cp._id) });
  } catch (error) {
    console.error('Create consultation order error:', error);
    res.status(500).json({ message: 'Failed to create consultation order' });
  }
});

// Verify consultation payment
// POST /api/consultations/pay/verify { razorpay_order_id, razorpay_payment_id, razorpay_signature, isTestMode?, paymentId }
app.post('/api/consultations/pay/verify', authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isTestMode = false, paymentId } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }
    const secret = isTestMode ? (process.env.RAZORPAY_TEST_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET) : process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Razorpay not configured on server' });
    }
    const expected = crypto.createHmac('sha256', secret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const payment = await ConsultationPayment.findOne({ razorpay_order_id });
    const payDoc = payment || (paymentId ? await ConsultationPayment.findById(paymentId) : null);
    if (!payDoc) {
      return res.status(404).json({ message: 'Payment record not found' });
    }
    if (String(payDoc.patientId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized for this payment' });
    }

    payDoc.razorpay_payment_id = razorpay_payment_id;
    payDoc.status = 'paid';
    payDoc.updatedAt = new Date();
    await payDoc.save();

    // If payment is for an existing appointment, automatically approve it
    let approvedAppointment = null;
    if (payDoc.appointmentId) {
      const appointment = await Appointment.findById(payDoc.appointmentId);
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
      id: String(payDoc._id),
      doctorId: String(payDoc.doctorId),
      patientId: String(payDoc.patientId),
      amountInRupees: payDoc.amountInRupees,
      status: payDoc.status,
      appointmentId: payDoc.appointmentId ? String(payDoc.appointmentId) : null
    }, appointment: approvedAppointment });
  } catch (error) {
    console.error('Verify consultation payment error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// Verify Razorpay payment signature
// POST /api/payments/razorpay/verify { razorpay_order_id, razorpay_payment_id, razorpay_signature }
app.post('/api/payments/razorpay/verify', authenticateToken, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isTestMode = false } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }
    const secret = isTestMode ? (process.env.RAZORPAY_TEST_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET) : process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ message: 'Razorpay not configured on server' });
    }
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const isValid = expected === razorpay_signature;
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    // Mark subscription active for the user, derive plan from order notes
    // We fetch the order to read notes.plan and notes.billingCycle safely
    let planFromNotes = 'Premium';
    try {
      const keyId = isTestMode ? (process.env.RAZORPAY_TEST_KEY_ID || process.env.RAZORPAY_KEY_ID) : process.env.RAZORPAY_KEY_ID;
      const keySecret = isTestMode ? (process.env.RAZORPAY_TEST_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET) : process.env.RAZORPAY_KEY_SECRET;
      const rz = new Razorpay({ key_id: keyId, key_secret: keySecret });
      const order = await rz.orders.fetch(razorpay_order_id);
      const notedPlan = order?.notes?.plan;
      if (['Basic', 'Premium', 'Family'].includes(notedPlan)) {
        planFromNotes = notedPlan;
      }
    } catch (e) {
      // If fetch fails, fallback to Premium
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { membershipType: planFromNotes, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    res.json({ success: true, user, membershipType: planFromNotes });
  } catch (error) {
    console.error('Verify Razorpay payment error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// Admin: Get user consultation history
// GET /api/admin/users/:userId/consultations
app.get('/api/admin/users/:userId/consultations', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const admin = await User.findById(req.user.userId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { userId } = req.params;
    
    // Get all appointments for this user (as patient)
    const appointments = await Appointment.find({ patientId: userId })
      .populate('doctorId', 'firstName lastName specialization hospital')
      .sort({ createdAt: -1 })
      .lean();

    // Format the consultation history
    const consultations = appointments.map(apt => ({
      id: apt._id,
      doctor: {
        id: apt.doctorId._id,
        name: `Dr. ${apt.doctorId.firstName} ${apt.doctorId.lastName}`,
        specialization: apt.doctorId.specialization,
        hospital: apt.doctorId.hospital
      },
      date: apt.date,
      time: apt.time,
      mode: apt.mode,
      status: apt.status,
      notes: apt.notes,
      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt
    }));

    res.json({ consultations });
  } catch (error) {
    console.error('Get user consultations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// MRI Reports Schema
const mriReportSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scanDate: { type: Date, required: true },
  scanType: { type: String, required: true, default: 'Brain MRI' },
  status: { type: String, enum: ['Pending Diagnosis', 'Analyzed', 'Failed'], default: 'Pending Diagnosis' },
  predictedResult: { type: String, required: true },
  confidence: { type: Number, min: 0, max: 100, required: true },
  heatmapImage: { type: String },
  doctorComments: {
    notes: { type: String },
    prescription: { type: String },
    suggestedTests: [{ type: String }]
  },
  nextAppointment: { type: Date },
  lifestyleSuggestions: {
    exercise: { type: String },
    diet: { type: String },
    posture: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MRIReport = mongoose.model('MRIReport', mriReportSchema);

// Patient Reports API Endpoints

// Get all MRI reports for the current patient
app.get('/api/patient/reports', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    let reports = await MRIReport.find({ patientId: userId })
      .sort({ scanDate: -1 })
      .lean();
    
    // If no reports exist, create some sample data
    if (reports.length === 0) {
      const sampleReports = [
        {
          patientId: userId,
          scanDate: new Date('2024-12-15'),
          scanType: 'Brain MRI',
          status: 'Analyzed',
          predictedResult: 'Normal',
          confidence: 94.2,
          heatmapImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop',
          doctorComments: {
            notes: 'No abnormalities detected. Brain structure appears normal with good symmetry.',
            prescription: 'Continue current medication. Follow up in 6 months.',
            suggestedTests: ['Blood work', 'Neurological examination']
          },
          nextAppointment: new Date('2025-06-15'),
          lifestyleSuggestions: {
            exercise: '30 minutes of moderate exercise daily',
            diet: 'Increase omega-3 fatty acids, reduce processed foods',
            posture: 'Maintain proper posture during work hours'
          }
        },
        {
          patientId: userId,
          scanDate: new Date('2024-11-20'),
          scanType: 'Brain MRI',
          status: 'Analyzed',
          predictedResult: 'Mild Cognitive Impairment',
          confidence: 87.5,
          heatmapImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=200&fit=crop',
          doctorComments: {
            notes: 'Slight hippocampal volume reduction observed. Recommend cognitive assessment.',
            prescription: 'Donepezil 5mg daily, Vitamin E supplements',
            suggestedTests: ['MMSE', 'MoCA', 'Neuropsychological testing']
          },
          nextAppointment: new Date('2025-02-20'),
          lifestyleSuggestions: {
            exercise: 'Aerobic exercise 3x per week, brain training exercises',
            diet: 'Mediterranean diet, blueberries, green tea',
            posture: 'Regular breaks from screen time, neck stretches'
          }
        },
        {
          patientId: userId,
          scanDate: new Date('2024-10-10'),
          scanType: 'Brain MRI',
          status: 'Pending Diagnosis',
          predictedResult: 'Tumor (Benign)',
          confidence: 76.8,
          heatmapImage: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300&h=200&fit=crop',
          doctorComments: {
            notes: 'Small mass detected in left frontal lobe. Requires further evaluation.',
            prescription: 'Steroids to reduce inflammation, pain management',
            suggestedTests: ['Contrast MRI', 'Biopsy', 'PET scan']
          },
          nextAppointment: new Date('2024-12-20'),
          lifestyleSuggestions: {
            exercise: 'Light walking, avoid heavy lifting',
            diet: 'Anti-inflammatory foods, plenty of water',
            posture: 'Gentle neck movements, avoid sudden head movements'
          }
        }
      ];
      
      await MRIReport.insertMany(sampleReports);
      reports = await MRIReport.find({ patientId: userId })
        .sort({ scanDate: -1 })
        .lean();
    }
    
    res.json({ reports });
  } catch (error) {
    console.error('Get patient reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a specific MRI report by ID
app.get('/api/patient/reports/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const report = await MRIReport.findOne({ _id: id, patientId: userId }).lean();
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.json({ report });
  } catch (error) {
    console.error('Get report by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download report as PDF (placeholder - in real app, generate actual PDF)
app.get('/api/patient/reports/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const report = await MRIReport.findOne({ _id: id, patientId: userId }).lean();
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // In a real app, you would generate a PDF here
    // For now, we'll return a simple text response
    const pdfContent = `MRI Report
Scan Date: ${report.scanDate}
Scan Type: ${report.scanType}
Status: ${report.status}
Predicted Result: ${report.predictedResult}
Confidence: ${report.confidence}%
Doctor Notes: ${report.doctorComments?.notes || 'N/A'}
Prescription: ${report.doctorComments?.prescription || 'N/A'}`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="mri-report-${id}.pdf"`);
    res.send(pdfContent);
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share report via email
app.post('/api/patient/reports/:id/share/email', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, message } = req.body;
    const userId = req.user.userId;
    
    const report = await MRIReport.findOne({ _id: id, patientId: userId }).lean();
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // In a real app, you would send an email here
    console.log(`Sharing report ${id} via email to ${email} with message: ${message}`);
    
    res.json({ success: true, message: 'Report shared via email successfully' });
  } catch (error) {
    console.error('Share report via email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Share report via WhatsApp
app.post('/api/patient/reports/:id/share/whatsapp', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { phoneNumber, message } = req.body;
    const userId = req.user.userId;
    
    const report = await MRIReport.findOne({ _id: id, patientId: userId }).lean();
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // In a real app, you would send a WhatsApp message here
    console.log(`Sharing report ${id} via WhatsApp to ${phoneNumber} with message: ${message}`);
    
    res.json({ success: true, message: 'Report shared via WhatsApp successfully' });
  } catch (error) {
    console.error('Share report via WhatsApp error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patient statistics
app.get('/api/patient/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const totalScans = await MRIReport.countDocuments({ patientId: userId });
    const analyzedReports = await MRIReport.countDocuments({ 
      patientId: userId, 
      status: 'Analyzed' 
    });
    const pendingReports = await MRIReport.countDocuments({ 
      patientId: userId, 
      status: 'Pending Diagnosis' 
    });
    
    // Get next appointment from the most recent report
    const nextReport = await MRIReport.findOne({ 
      patientId: userId, 
      nextAppointment: { $exists: true, $ne: null } 
    }).sort({ nextAppointment: 1 }).lean();
    
    const stats = {
      totalScans: totalScans || 0,
      analyzedReports: analyzedReports || 0,
      pendingReports: pendingReports || 0,
      nextAppointment: nextReport?.nextAppointment || null
    };
    
    res.json({ stats });
  } catch (error) {
    console.error('Get patient stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload new MRI scan
app.post('/api/patient/upload-mri', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { scanData } = req.body;
    
    // In a real app, you would process the uploaded file and generate AI analysis
    const newReport = new MRIReport({
      patientId: userId,
      scanDate: new Date(),
      scanType: scanData.scanType || 'Brain MRI',
      status: 'Pending Diagnosis',
      predictedResult: 'Analysis in progress...',
      confidence: 0,
      heatmapImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop',
      doctorComments: {
        notes: 'Scan uploaded successfully. Analysis pending.',
        prescription: 'Awaiting analysis results.',
        suggestedTests: ['AI Analysis in progress']
      },
      lifestyleSuggestions: {
        exercise: 'Continue regular activities',
        diet: 'Maintain current diet',
        posture: 'Continue current posture practices'
      }
    });
    
    await newReport.save();
    
    res.json({ report: newReport });
  } catch (error) {
    console.error('Upload MRI scan error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update report status (for doctors)
app.put('/api/patient/reports/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, doctorComments } = req.body;
    const userId = req.user.userId;
    
    // Check if user is a doctor
    const user = await User.findById(userId);
    if (!user || user.role !== 'doctor') {
      return res.status(403).json({ message: 'Access denied. Doctor only.' });
    }
    
    const report = await MRIReport.findById(id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Update report
    report.status = status;
    if (doctorComments) {
      report.doctorComments = { ...report.doctorComments, ...doctorComments };
    }
    report.updatedAt = new Date();
    
    await report.save();
    
    res.json({ report });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Test endpoint to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
});