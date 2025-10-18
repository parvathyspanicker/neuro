import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// User Schema (same as in server.js)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'patient', 'doctor'],
    default: 'patient'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

async function updateUserRoles() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/neurocare');
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`\n📊 Found ${users.length} users in the database:`);
    
    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
    });

    // Update specific user roles
    const updates = [
      {
        email: 'tiljithomas2026@mca.ajce.in',
        newRole: 'admin'
      },
      // Add more users here as needed
      // Example: Update other users to doctor and patient roles
      // {
      //   email: 'doctor@example.com',
      //   newRole: 'doctor'
      // },
      // {
      //   email: 'patient@example.com',
      //   newRole: 'patient'
      // }
    ];

    console.log('\n🔄 Updating user roles...');
    
    for (const update of updates) {
      const user = await User.findOne({ email: update.email });
      if (user) {
        const oldRole = user.role;
        user.role = update.newRole;
        await user.save();
        console.log(`✅ Updated ${user.firstName} ${user.lastName} (${user.email}) from ${oldRole} to ${update.newRole}`);
      } else {
        console.log(`❌ User with email ${update.email} not found`);
      }
    }

    console.log('\n📊 Updated user list:');
    const updatedUsers = await User.find({});
    updatedUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\n✅ Role updates completed!');

  } catch (error) {
    console.error('❌ Error updating user roles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the function
updateUserRoles(); 