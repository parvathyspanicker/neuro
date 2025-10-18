# Admin Login Guide

This guide explains how to login as an admin user in the NeuroCare AI application.

## Prerequisites

1. **Backend Server**: Make sure the backend server is running
2. **MongoDB**: Ensure MongoDB is running and accessible
3. **Environment Setup**: Configure your environment variables

## Step 1: Create Admin User

### Option A: Using the Script (Recommended)

1. Navigate to the backend directory:
   ```bash
   cd neurocare/backend
   ```

2. Create a `.env` file (if not exists) with your MongoDB connection:
   ```bash
   cp env.example .env
   ```

3. Run the admin creation script:
   ```bash
   node create-admin.js
   ```

4. You should see output like:
   ```
   ✅ Connected to MongoDB
   ✅ Admin user created successfully!
   Email: admin@neurocare.com
   Password: admin123
   Role: admin
   ```

### Option B: Manual Database Creation

If you prefer to create the admin user manually:

1. Connect to your MongoDB database
2. Insert a user document with role: 'admin'
3. Make sure to hash the password using bcrypt

## Step 2: Login as Admin

1. **Start the Application**:
   ```bash
   # Terminal 1: Start backend
   cd neurocare/backend
   npm start

   # Terminal 2: Start frontend
   cd neurocare
   npm run dev
   ```

2. **Access the Login Page**:
   - Go to `http://localhost:5173/login`
   - Use the **Email/Password** login option (not Google Sign-In)

3. **Enter Admin Credentials**:
   - **Email**: `admin@neurocare.com`
   - **Password**: `admin123`

4. **Access Admin Dashboard**:
   - After successful login, you'll be redirected to the dashboard
   - Look for the **"Admin Dashboard"** link in the sidebar (purple icon)
   - Click on it to access the admin panel

## Admin Features

Once logged in as admin, you can access:

- **Doctor Registration Management**: Review and approve doctor access requests
- **Patient Database**: View and manage all patient records
- **Medical Records**: Oversee all medical documentation
- **AI Analysis Monitoring**: Track AI diagnostic performance
- **System Analytics**: View comprehensive system statistics
- **User Management**: Control user access and roles

## Troubleshooting

### Common Issues:

1. **"Invalid credentials" error**:
   - Make sure the admin user was created successfully
   - Check that MongoDB is running
   - Verify the backend server is started

2. **Admin dashboard link not visible**:
   - Ensure you're logged in with an admin account
   - Check the browser console for any errors
   - Verify the user object has `role: 'admin'`

3. **Access denied to admin dashboard**:
   - Make sure you're using email/password login (not Google Sign-In)
   - Google Sign-In users default to 'patient' role
   - Only MongoDB users can have admin roles

### Debug Steps:

1. Check the browser console for authentication errors
2. Verify the backend server is running on port 3001
3. Check MongoDB connection in the backend logs
4. Ensure the `.env` file is properly configured

## Security Notes

- The default admin credentials are for development only
- Change the password in production
- Use strong passwords for admin accounts
- Consider implementing additional security measures for admin access

## Alternative Admin Creation

If you need to create additional admin users:

1. Modify the `create-admin.js` script with different credentials
2. Run the script again
3. Or manually insert admin users into the database

## Support

If you encounter issues:
1. Check the backend server logs
2. Verify MongoDB connection
3. Ensure all environment variables are set correctly
4. Check that the frontend can communicate with the backend 