# NeuroCare Hybrid Authentication Setup

This guide explains how to set up the hybrid authentication system where:
- **Google Sign-In** uses Supabase
- **Email/Password Login & Registration** uses MongoDB

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   MongoDB       │
│   (React)       │    │   (Google Auth) │    │   (Email/Pass)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ├── Google Sign-In ────►│                       │
         │                       │                       │
         └── Email/Password ────►│                       └──►
```

## Prerequisites

1. **Supabase Account** - For Google OAuth
2. **MongoDB Database** - For email/password authentication
3. **Node.js** - For backend server

## Setup Instructions

### 1. Supabase Configuration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use existing one
3. Go to **Authentication > Settings > Auth Providers**
4. Enable **Google** provider
5. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
6. Go to **Settings > API** to get your project URL and anon key

### 2. Environment Variables

Create a `.env` file in the `neurocare` directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# MongoDB API Configuration
VITE_MONGODB_API_URL=http://localhost:3001/api
```

### 3. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd neurocare/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file in backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/neurocare
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   PORT=3001
   NODE_ENV=development
   ```

4. Start MongoDB (if running locally):
   ```bash
   # Install MongoDB if not already installed
   # Start MongoDB service
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

### 4. Frontend Setup

1. Navigate to the neurocare directory:
   ```bash
   cd neurocare
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## How It Works

### Authentication Flow

1. **Google Sign-In**:
   - User clicks "Sign in with Google"
   - Redirects to Google OAuth
   - Google redirects back to Supabase
   - Supabase creates/updates user in Supabase database
   - User is authenticated via Supabase

2. **Email/Password Authentication**:
   - User enters email/password
   - Frontend calls MongoDB API
   - Backend validates credentials
   - JWT token is generated and stored
   - User is authenticated via MongoDB

### User Management

- **Google users** are stored in Supabase
- **Email/password users** are stored in MongoDB
- The system can distinguish between both types
- Users can sign out from either system

## API Endpoints

### MongoDB Backend (`http://localhost:3001/api`)

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout user
- `GET /health` - Health check

### Request/Response Examples

#### Register
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "date_of_birth": "1990-01-01"
}

Response:
{
  "message": "User registered successfully",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "date_of_birth": "1990-01-01T00:00:00.000Z",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

#### Login
```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "date_of_birth": "1990-01-01T00:00:00.000Z",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

## Security Considerations

1. **JWT Secret**: Change the JWT secret in production
2. **HTTPS**: Use HTTPS in production
3. **CORS**: Configure CORS properly for production
4. **Rate Limiting**: Implement rate limiting for auth endpoints
5. **Password Hashing**: Already implemented with bcrypt
6. **Token Expiration**: JWT tokens expire in 7 days

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure backend CORS is configured correctly
2. **MongoDB Connection**: Ensure MongoDB is running and accessible
3. **Supabase Configuration**: Verify Supabase URL and keys are correct
4. **Google OAuth**: Check Google OAuth credentials in Supabase

### Debug Steps

1. Check browser console for frontend errors
2. Check backend console for server errors
3. Verify environment variables are loaded correctly
4. Test API endpoints with Postman or similar tool

## Production Deployment

1. **Environment Variables**: Set proper production values
2. **Database**: Use production MongoDB instance
3. **Supabase**: Use production Supabase project
4. **HTTPS**: Enable HTTPS for all endpoints
5. **Monitoring**: Add logging and monitoring
6. **Backup**: Set up database backups

## File Structure

```
neurocare/
├── src/
│   ├── contexts/
│   │   └── AuthContext.jsx      # Hybrid auth context
│   ├── lib/
│   │   ├── supabase.js          # Supabase client
│   │   └── mongodb.js           # MongoDB service
│   └── pages/
│       ├── Login.jsx            # Login with both methods
│       └── Register.jsx         # Register with MongoDB
├── backend/
│   ├── server.js                # Express server
│   ├── package.json             # Backend dependencies
│   └── env.example             # Environment template
└── HYBRID_AUTH_SETUP.md        # This file
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs
3. Verify configuration
4. Test endpoints individually 