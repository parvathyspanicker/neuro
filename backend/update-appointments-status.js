const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurocare', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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

async function updateAppointmentStatus() {
  try {
    console.log('🔄 Updating appointment statuses...');
    
    // Update all pending appointments to approved
    const result = await Appointment.updateMany(
      { status: 'pending' },
      { 
        status: 'approved',
        updatedAt: new Date()
      }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} appointments from 'pending' to 'approved'`);
    
    // Show current status distribution
    const statusCounts = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n📊 Current appointment status distribution:');
    statusCounts.forEach(status => {
      console.log(`   ${status._id}: ${status.count} appointments`);
    });
    
    console.log('\n🎉 All appointments are now automatically approved!');
    
  } catch (error) {
    console.error('❌ Error updating appointments:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateAppointmentStatus();

