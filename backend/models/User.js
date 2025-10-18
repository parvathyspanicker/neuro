const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  date_of_birth: { type: String },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  rejectionReason: { type: String },
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
  experience: { type: String },
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

module.exports = { User };

