# MESMTF Setup Guide

## Prerequisites
- Node.js 18+ installed
- Supabase account and project created
- Git installed

## Step 1: Environment Variables Setup

Create a `.env.local` file in the root directory with the following content:

```env
# MESMTF Environment Variables
# Replace these with your actual Supabase credentials

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_NAME=MESMTF
NEXT_PUBLIC_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=your_supabase_database_url

# Security
JWT_SECRET=your_jwt_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,text/plain

# Notification Configuration
NOTIFICATION_EMAIL_FROM=noreply@mesmtf.com
NOTIFICATION_SMS_PROVIDER=twilio

# Development
NODE_ENV=development
```

### How to get Supabase credentials:

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Go to Settings → API
3. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

## Step 2: Database Schema Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `docs/supabase-schema.sql`
4. Run the SQL script to create all tables and relationships

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Load Sample Data

```bash
node scripts/complete-setup.js
```

This script will:
- Test database connection
- Create admin account
- Load sample users, patients, and drugs
- Verify the setup

## Step 5: Start the Application

```bash
npm run dev
```

## Step 6: Access the System

1. Open [http://localhost:3000](http://localhost:3000)
2. Login with admin credentials:
   - **Email:** admin@mesmtf.com
   - **Password:** admin123456

## Default Login Credentials

After running the setup script, you can use these credentials:

- **Admin:** admin@mesmtf.com / admin123456
- **Doctor:** dr.smith@mesmtf.com / doctor123
- **Nurse:** nurse.brown@mesmtf.com / nurse123

## Troubleshooting

### Database Connection Issues
- Verify your Supabase credentials in `.env.local`
- Check that your Supabase project is active
- Ensure the database schema has been deployed

### Sample Data Not Loading
- Check that the service role key has proper permissions
- Verify that all tables exist in the database
- Check the console for specific error messages

### Authentication Issues
- Ensure RLS policies are properly set up
- Check that user profiles table exists
- Verify auth configuration in Supabase

## System Features

Once set up, the system includes:

✅ **Functional Components:**
- User authentication and role-based access
- Patient management system
- Drug inventory management
- AI diagnosis system for malaria/typhoid
- Appointment scheduling
- Medical records system
- Treatment history tracking
- Real-time messaging system

✅ **Updated Components:**
- Treatment history now uses real database data
- Messages system connected to database
- All API endpoints functional
- Admin and doctor dashboards use real data

## Next Steps

1. **Customize the system** for your specific needs
2. **Add more sample data** using the admin interface
3. **Configure notifications** and email settings
4. **Set up production deployment** when ready
5. **Train staff** on the system usage

## Support

For issues or questions:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure database schema is properly deployed
4. Check Supabase project status and permissions
