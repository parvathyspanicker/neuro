# NeuroCare Backend Setup

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

## Installation

1. Navigate to the backend directory:
```bash
cd neurocare/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/neurocare
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3002
```

## Running the Server

### Development mode (with auto-restart):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will run on `http://localhost:3002`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - Logout user

## Database Schema

### User Model
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String,
  date_of_birth: String,
  role: String (enum: ['patient', 'doctor'], default: 'patient'),
  // Doctor-specific fields
  license_number: String,
  specialization: String,
  hospital: String,
  // Additional fields
  membershipType: String (default: 'Basic'),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Integration

Make sure your frontend `.env` file has:
```
VITE_MONGODB_API_URL=http://localhost:3002/api
```