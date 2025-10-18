# Supabase Authentication Setup

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for the project to be ready

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy your Project URL and anon/public key
3. Create a `.env` file in the root of your project with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:5173` for development)
3. Add redirect URLs:
   - `http://localhost:5173/dashboard`
   - `http://localhost:5173/login`
   - `http://localhost:5173/register`

## 4. Email Templates (Optional)

1. Go to Authentication > Email Templates
2. Customize the confirmation and recovery email templates

## 5. User Management

1. Go to Authentication > Users to see registered users
2. You can manually verify users or enable email confirmation

## 6. Database Tables (Optional)

If you want to store additional user data, create a `profiles` table:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

## 7. Features Implemented

- ✅ User registration with email/password
- ✅ User login with email/password
- ✅ Protected routes
- ✅ User session management
- ✅ Logout functionality
- ✅ Error handling
- ✅ Loading states
- ✅ Form validation

## 8. Usage

1. Users can register with email and password
2. Email verification is required (configurable in Supabase)
3. Users can log in with their credentials
4. Protected routes automatically redirect to login
5. User data is available in the `user` object from `useAuth()`

## 9. Security Features

- Password validation (minimum 6 characters)
- Email format validation
- Protected routes with automatic redirects
- Session management
- Secure logout

## 10. Next Steps

- Implement social login (Google, GitHub, etc.)
- Add user profile management
- Implement role-based access control
- Add audit logging