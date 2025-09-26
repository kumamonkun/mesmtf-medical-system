# 🗄️ Database Documentation

This section contains all database-related files including schema, policies, and migration scripts.

## 📋 Files in this section:

### [supabase-schema.sql](./supabase-schema.sql)
- **Complete database schema**
- **Table definitions**
- **Relationships and constraints**
- **Indexes and triggers**

### [supabase-rls-policies.sql](./supabase-rls-policies.sql)
- **Row Level Security policies**
- **User access controls**
- **Data privacy rules**
- **Role-based permissions**

## 🚀 Database Setup

1. **Create Supabase Project** → Follow [Setup Guide](../02-setup-guides/DATABASE_SETUP_GUIDE.md)
2. **Run Schema Script** → Execute `supabase-schema.sql`
3. **Apply RLS Policies** → Execute `supabase-rls-policies.sql`
4. **Load Sample Data** → Use [Sample Data](../05-sample-data/) guides

## 🔐 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Role-based access control**
- **Data encryption at rest**
- **Audit logging**

## 📊 Database Structure

### Core Tables:
- `user_profiles` - User account information
- `patients` - Patient records
- `appointments` - Appointment scheduling
- `medical_records` - Medical history
- `prescriptions` - Prescription management
- `drugs` - Drug inventory
- `diagnoses` - Diagnosis records

## 🔗 Related Documentation

- [Setup Guides](../02-setup-guides/) - Database setup
- [Sample Data](../05-sample-data/) - Test data
- [Implementation Guides](../03-implementation-guides/) - Backend implementation

