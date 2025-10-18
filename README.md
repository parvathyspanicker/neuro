# NeuroCare AI - Medical Dashboard

A comprehensive healthcare platform for neurological diagnosis and patient management using AI-powered MRI analysis.

## Features

- **AI-Powered MRI Analysis**: Advanced brain scan analysis with 97.2% accuracy
- **Patient Management**: Comprehensive patient database and medical records
- **Doctor Registration**: Admin-controlled doctor access management
- **Real-time Chat**: AI health assistant and doctor communication
- **Video Consultations**: Premium video consultation features
- **Medical Reports**: Detailed analytics and reporting system

## Admin Access

The admin dashboard is now properly secured and only accessible to users with admin role:

- **Admin Dashboard**: Only visible to users with `role: 'admin'`
- **Protected Routes**: Admin routes are protected with `AdminProtectedRoute`
- **Conditional Access**: Admin links only appear for admin users in the dashboard

### User Roles

- **Patient**: Default role for regular users (Google sign-in users)
- **Admin**: Administrative access to manage doctors, patients, and system settings

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Access the application at `http://localhost:5173`

### Environment

Create a `.env` file in the frontend root if needed:

```
VITE_MONGODB_API_URL=http://localhost:3002/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
```

## Authentication

The application supports hybrid authentication:
- **Google Sign-In**: Via Supabase (defaults to patient role)
- **Email/Password**: Via MongoDB (supports admin role assignment)

## Admin Dashboard Features

- Doctor registration management
- Patient database administration
- Medical records oversight
- AI analysis monitoring
- System status and analytics
- User management and access control

## Technology Stack

- **Frontend**: React + Vite
- **Authentication**: Supabase + MongoDB
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **Charts**: Chart.js
- **Routing**: React Router

## Security

- Protected routes for authenticated users
- Admin-only access to administrative features
- Role-based access control
- Secure authentication flow
