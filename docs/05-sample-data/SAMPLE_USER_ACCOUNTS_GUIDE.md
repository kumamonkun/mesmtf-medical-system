# 🔐 Sample User Accounts for MESMTF Testing

## 🚨 **Important: Manual Account Creation Required**

The `user_profiles` table has a foreign key constraint to `auth.users`, so you need to create these accounts manually through the Supabase Auth interface.

## 📋 **Test User Accounts to Create**

### **1. Admin Account**
Email: admin@mesmtf.com
Password: admin123456
- **Role:** Admin
- **Name:** System Administrator

### **2. Doctor Accounts**
- **Email:** `dr.smith@mesmtf.com`
- **Password:** `doctor123`
- **Role:** Doctor
- **Name:** Dr. Sarah Smith
- **Specialization:** Internal Medicine

- **Email:** `dr.jones@mesmtf.com`
- **Password:** `doctor123`
- **Role:** Doctor
- **Name:** Dr. Michael Jones
- **Specialization:** Infectious Diseases

- **Email:** `dr.wilson@mesmtf.com`
- **Password:** `doctor123`
- **Role:** Doctor
- **Name:** Dr. Emma Wilson
- **Specialization:** Emergency Medicine

### **3. Nurse Accounts**
- **Email:** `nursebrown@gmail.com`
- **Password:** `nurse123`
- **Role:** Nurse
- **Name:** Nurse Lisa Brown


### **4. Pharmacist Account**
- **Email:** `pharmacist.garcia@mesmtf.com`
- **Password:** `pharmacist123`
- **Role:** Pharmacist
- **Name:** Pharmacist Maria Garcia

### **5. Receptionist Account**
- **Email:** `receptionist.taylor@mesmtf.com`
- **Password:** `receptionist123`
- **Role:** Receptionist
- **Name:** Receptionist Robert Taylor

### **6. Patient Accounts**
- **Email:** `patient.johnson@mesmtf.com`
- **Password:** `patient123`
- **Role:** Patient
- **Name:** Sarah Johnson

- 
## 🛠️ **How to Create These Accounts**

### **Option 1: Through Your Application (Recommended)**
1. **Start your application:** `npm run dev`
2. **Go to the registration page**
3. **Register each user** with the email and password above
4. **The system will automatically create the user profile**

### **Option 2: Through Supabase Dashboard**
1. **Go to:** https://supabase.com/dashboard/project/apcsneiwvwekxbqrasee
2. **Navigate to:** Authentication → Users
3. **Click:** "Add User"
4. **Create each user** with the credentials above
5. **Manually add user profiles** in the database

### **Option 3: Quick Test with One Account**
1. **Create just one test account** (e.g., `admin@mesmtf.com` / `admin123`)
2. **Test the login functionality**
3. **Create more accounts as needed**

## 🎯 **Testing Scenarios**

### **Admin Login:**
- **Email:** `admin@mesmtf.com`
- **Password:** `admin123`
- **Should see:** Admin dashboard with all system controls

### **Doctor Login:**
- **Email:** `dr.smith@mesmtf.com`
- **Password:** `doctor123`
- **Should see:** Doctor dashboard with patient management

### **Patient Login:**
- **Email:** `patient.johnson@mesmtf.com`
- **Password:** `patient123`
- **Should see:** Patient dashboard with appointments and prescriptions

## 🔧 **Alternative: Use Guest Login**

If you want to test immediately without creating accounts:
1. **Use the "Login as Guest" option** in your application
2. **This will give you limited access** to view the system
3. **You can see the sample data** but with restricted functionality

## 📝 **Notes**

- **All passwords are simple** for testing purposes
- **In production, use strong passwords**
- **The system will automatically create user profiles** when you register
- **Each role has different dashboard views** and permissions
- **Sample data is already in the database** and ready to use

## 🚀 **Quick Start**

1. **Start your app:** `npm run dev`
2. **Go to registration page**
3. **Create admin account:** `admin@mesmtf.com` / `admin123`
4. **Login and explore the system!**

**Your MESMTF system is ready for testing with these sample accounts!** 🏥✨
