# User Role Management Guide

This guide explains how to manage user roles in the NeuroCare AI application.

## Available Roles

- **admin**: Full administrative access to manage users, doctors, and system settings
- **doctor**: Medical professionals who can access patient records and perform diagnoses
- **patient**: Regular users who can access their own medical records and chat with AI
- **user**: Basic user role (legacy)

## How to Update User Roles

### Method 1: Using the Admin Dashboard (Recommended)

1. **Login as Admin**:
   - Use the admin credentials: `admin@neurocare.com` / `admin123`
   - Or login with your account if it has admin role

2. **Access User Management**:
   - Go to the Admin Dashboard
   - Click on "User Management" in the sidebar
   - You'll see all users with their current roles

3. **Update Roles**:
   - Use the dropdown in the "Actions" column to change user roles
   - Changes are applied immediately

### Method 2: Using the Script

1. **Navigate to backend directory**:
   ```bash
   cd neurocare/backend
   ```

2. **Edit the script**:
   - Open `update-user-roles.js`
   - Modify the `updates` array to include your users:

   ```javascript
   const updates = [
     {
       email: 'tiljithomas2026@mca.ajce.in',
       newRole: 'admin'
     },
     {
       email: 'doctor@example.com',
       newRole: 'doctor'
     },
     {
       email: 'patient@example.com',
       newRole: 'patient'
     }
   ];
   ```

3. **Run the script**:
   ```bash
   node update-user-roles.js
   ```

### Method 3: Using API Endpoints

#### Update Single User Role
```bash
curl -X PUT http://localhost:3001/api/users/USER_ID/role \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

#### Bulk Update Multiple Users
```bash
curl -X PUT http://localhost:3001/api/users/bulk-update-roles \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {"userId": "USER_ID_1", "role": "admin"},
      {"userId": "USER_ID_2", "role": "doctor"},
      {"userId": "USER_ID_3", "role": "patient"}
    ]
  }'
```

## Your Current User

Based on your data, you have a user with:
- **Email**: `tiljithomas2026@mca.ajce.in`
- **Current Role**: `patient`
- **User ID**: `688c8a0f900f40fb363313ea`

To update this user to admin role, you can:

1. **Use the script** (already configured)
2. **Use the admin dashboard** after logging in
3. **Use the API** with the user ID

## Security Notes

- Only users with `admin` role can update user roles
- Role changes are logged for audit purposes
- The system validates role values before applying changes
- Invalid roles will be rejected

## Troubleshooting

### Common Issues

1. **"Only admins can update user roles"**
   - Make sure you're logged in as an admin user
   - Check that your account has the `admin` role

2. **"User not found"**
   - Verify the user ID or email is correct
   - Check that the user exists in the database

3. **"Invalid role"**
   - Make sure the role is one of: `admin`, `doctor`, `patient`, `user`
   - Check for typos in the role name

### Getting Admin Access

If you don't have admin access:

1. **Create an admin user**:
   ```bash
   cd neurocare/backend
   node create-admin.js
   ```

2. **Or update your existing user**:
   - Use the script: `node update-user-roles.js`
   - Or manually update in the database

## Database Schema

The user schema includes:
```javascript
{
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  role: {
    type: String,
    enum: ['user', 'admin', 'patient', 'doctor'],
    default: 'patient'
  },
  createdAt: Date
}
``` 