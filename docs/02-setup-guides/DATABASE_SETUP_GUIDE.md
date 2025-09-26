# 🗄️ Database Setup Guide for MESMTF

## 📋 **Step-by-Step Database Setup**

### **Step 1: Create Supabase Project**

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** with your account
3. **Click "New Project"**
4. **Fill in the details:**
   - **Name**: `MESMTF Medical System`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your location
5. **Click "Create new project"**
6. **Wait for setup** (takes 2-3 minutes)

### **Step 2: Get Your Credentials**

Once your project is ready:

1. **Go to Settings → API**
2. **Copy these values:**
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

### **Step 3: Create Environment Variables File**

Create a file called `.env.local` in your project root with:

```env
# MESMTF Environment Variables
# Replace these with your actual Supabase credentials

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

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

### **Step 4: Apply Database Schema**

1. **Go to your Supabase project dashboard**
2. **Click on "SQL Editor" in the left sidebar**
3. **Click "New Query"**
4. **Copy the entire contents of `supabase-schema.sql`**
5. **Paste it into the SQL editor**
6. **Click "Run" to execute the schema**

### **Step 5: Enable Anonymous Authentication**

1. **Go to Authentication → Settings**
2. **Scroll down to "Anonymous sign-ins"**
3. **Toggle "Enable anonymous sign-ins" to ON**
4. **Click "Save"**

### **Step 6: Test Database Connection**

Run this command to test your setup:

```bash
node test-database-connection.js
```

### **Step 7: Start the Application**

```bash
npm run dev
```

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Missing environment variables"**
   - Make sure `.env.local` exists and has correct values
   - Restart your development server after adding env vars

2. **"Table doesn't exist"**
   - Make sure you ran the `supabase-schema.sql` file
   - Check the SQL editor for any errors

3. **"RLS policy violation"**
   - This is expected for anonymous users
   - The policies are working correctly

4. **"Connection failed"**
   - Check your Supabase URL and key
   - Make sure your project is active

### **Verification Checklist:**

- [ ] Supabase project created
- [ ] Environment variables set
- [ ] Database schema applied
- [ ] Anonymous auth enabled
- [ ] Test script runs successfully
- [ ] Application starts without errors

## 🎉 **Success Indicators**

You'll know everything is working when:

1. **Test script shows ✅ marks**
2. **Application starts without errors**
3. **You can see data in Supabase dashboard**
4. **API endpoints return real data instead of errors**

## 📞 **Need Help?**

If you run into issues:

1. **Check the Supabase logs** in your project dashboard
2. **Verify your environment variables** are correct
3. **Make sure the schema was applied** completely
4. **Restart your development server** after changes

---

**Ready to proceed?** Let me know when you've completed these steps and I'll help you test everything!
