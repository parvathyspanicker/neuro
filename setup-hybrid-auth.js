#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 NeuroCare Hybrid Authentication Setup');
console.log('=====================================\n');

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  try {
    console.log('This script will help you set up the hybrid authentication system.\n');

    // Check if .env file exists
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const overwrite = await question('A .env file already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        process.exit(0);
      }
    }

    console.log('\n📋 Supabase Configuration');
    console.log('------------------------');
    const supabaseUrl = await question('Enter your Supabase Project URL: ');
    const supabaseKey = await question('Enter your Supabase Anon Key: ');

    console.log('\n📋 MongoDB Configuration');
    console.log('----------------------');
    const mongodbApiUrl = await question('Enter MongoDB API URL (default: http://localhost:3001/api): ') || 'http://localhost:3001/api';

    // Create .env file
    const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseKey}

# MongoDB API Configuration
VITE_MONGODB_API_URL=${mongodbApiUrl}
`;

    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Frontend .env file created successfully!');

    // Check if backend directory exists
    const backendPath = path.join(__dirname, 'backend');
    if (!fs.existsSync(backendPath)) {
      console.log('\n⚠️  Backend directory not found. Please create it manually.');
      console.log('   See HYBRID_AUTH_SETUP.md for backend setup instructions.');
    } else {
      const backendEnvPath = path.join(backendPath, '.env');
      if (fs.existsSync(backendEnvPath)) {
        const overwriteBackend = await question('\nBackend .env file exists. Overwrite? (y/N): ');
        if (overwriteBackend.toLowerCase() !== 'y') {
          console.log('Backend .env file not modified.');
        } else {
          const backendEnvContent = `# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/neurocare

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Port
PORT=3001

# Environment
NODE_ENV=development
`;
          fs.writeFileSync(backendEnvPath, backendEnvContent);
          console.log('✅ Backend .env file created successfully!');
        }
      } else {
        const backendEnvContent = `# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/neurocare

# JWT Secret (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Port
PORT=3001

# Environment
NODE_ENV=development
`;
        fs.writeFileSync(backendEnvPath, backendEnvContent);
        console.log('✅ Backend .env file created successfully!');
      }
    }

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Configure Google OAuth in your Supabase dashboard');
    console.log('2. Start MongoDB (if running locally)');
    console.log('3. Install backend dependencies: cd backend && npm install');
    console.log('4. Start backend server: cd backend && npm run dev');
    console.log('5. Start frontend: npm run dev');
    console.log('\n📖 For detailed instructions, see HYBRID_AUTH_SETUP.md');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setup(); 