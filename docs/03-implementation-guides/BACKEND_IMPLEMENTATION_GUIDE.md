# MESMTF Backend Implementation Guide

## 📋 **Overview**

This document outlines the complete backend implementation requirements for the MESMTF (Medical Expert System for Malaria and Typhoid Fever) system. The frontend is currently using mock data and placeholder implementations that need to be replaced with real database operations and API endpoints.

## 🏗️ **Current State Analysis**

### ✅ **What's Already Implemented**
- **Database Schema**: Complete Supabase schema with all tables
- **Authentication**: Supabase Auth with role-based access
- **Frontend Components**: All UI components are built and functional
- **Expert System Logic**: AI diagnosis algorithm is implemented
- **Type Definitions**: TypeScript interfaces for all data models

### ❌ **What Needs Implementation**
- **API Endpoints**: No server-side API routes exist
- **Database Operations**: All data is currently mocked
- **File Uploads**: No file handling implemented
- **Real-time Features**: No WebSocket or real-time updates
- **Reporting System**: No backend report generation
- **Notification System**: No notification backend
- **Data Validation**: No server-side validation
- **Error Handling**: Limited error handling on backend

---

## 🎯 **Implementation Priority Matrix**

### **Phase 1: Core Database Operations (High Priority)**
1. **Patient Management API**
2. **Appointment Management API**
3. **Diagnosis Storage API**
4. **User Profile Management API**

### **Phase 2: Medical Features (High Priority)**
5. **Treatment Management API**
6. **Pharmacy Management API**
7. **Drug Administration API**
8. **Medical Records API**

### **Phase 3: Advanced Features (Medium Priority)**
9. **Reporting System API**
10. **File Upload System**
11. **Notification System**
12. **Analytics API**

### **Phase 4: System Features (Low Priority)**
13. **Audit Logging**
14. **Backup System**
15. **Performance Monitoring**
16. **Advanced Security**

---

## 📊 **Database Schema Status**

### **Tables Ready for Implementation**
| Table | Status | CRUD Operations Needed |
|-------|--------|----------------------|
| `user_profiles` | ✅ Ready | Create, Read, Update, Delete |
| `patients` | ✅ Ready | Create, Read, Update, Delete, Search |
| `doctors` | ✅ Ready | Create, Read, Update, Delete |
| `appointments` | ✅ Ready | Create, Read, Update, Delete, Search |
| `diagnoses` | ✅ Ready | Create, Read, Update, Delete |
| `treatments` | ✅ Ready | Create, Read, Update, Delete |
| `drugs` | ✅ Ready | Create, Read, Update, Delete |
| `prescriptions` | ✅ Ready | Create, Read, Update, Delete |
| `drug_administration` | ✅ Ready | Create, Read, Update, Delete |
| `medical_reports` | ✅ Ready | Create, Read, Update, Delete |
| `expert_system_rules` | ✅ Ready | Read, Update (Admin only) |

---

## 🔧 **API Endpoints to Implement**

### **1. Authentication & User Management**

#### **User Profiles API**
```
GET    /api/users/profile                    # Get current user profile
PUT    /api/users/profile                    # Update user profile
GET    /api/users/profiles                   # Get all user profiles (Admin)
POST   /api/users/profiles                   # Create user profile
DELETE /api/users/profiles/:id               # Delete user profile
```

#### **Role Management API**
```
GET    /api/users/roles                      # Get available roles
PUT    /api/users/:id/role                   # Update user role (Admin)
```

### **2. Patient Management API**

#### **Patients CRUD**
```
GET    /api/patients                         # Get all patients (with pagination, search, filters)
POST   /api/patients                         # Create new patient
GET    /api/patients/:id                     # Get patient by ID
PUT    /api/patients/:id                     # Update patient
DELETE /api/patients/:id                     # Delete patient
GET    /api/patients/search                  # Search patients
GET    /api/patients/:id/medical-history     # Get patient medical history
```

#### **Patient Search & Filtering**
```
GET    /api/patients/search?q=john&status=active&role=patient
GET    /api/patients/filter?status=critical&date_from=2025-01-01
```

### **3. Appointment Management API**

#### **Appointments CRUD**
```
GET    /api/appointments                     # Get all appointments
POST   /api/appointments                     # Create new appointment
GET    /api/appointments/:id                 # Get appointment by ID
PUT    /api/appointments/:id                 # Update appointment
DELETE /api/appointments/:id                 # Cancel appointment
GET    /api/appointments/patient/:patientId  # Get patient appointments
GET    /api/appointments/doctor/:doctorId    # Get doctor appointments
```

#### **Appointment Management**
```
PUT    /api/appointments/:id/confirm         # Confirm appointment
PUT    /api/appointments/:id/start           # Start appointment
PUT    /api/appointments/:id/complete        # Complete appointment
PUT    /api/appointments/:id/reschedule      # Reschedule appointment
GET    /api/appointments/calendar/:date      # Get appointments for date
GET    /api/appointments/available-slots     # Get available time slots
```

### **4. Diagnosis Management API**

#### **Diagnosis CRUD**
```
GET    /api/diagnoses                        # Get all diagnoses
POST   /api/diagnoses                        # Create new diagnosis
GET    /api/diagnoses/:id                    # Get diagnosis by ID
PUT    /api/diagnoses/:id                    # Update diagnosis
DELETE /api/diagnoses/:id                    # Delete diagnosis
GET    /api/diagnoses/patient/:patientId     # Get patient diagnoses
```

#### **Expert System API**
```
POST   /api/diagnoses/ai-diagnosis           # Run AI diagnosis
GET    /api/diagnoses/expert-rules           # Get expert system rules
PUT    /api/diagnoses/expert-rules/:id       # Update expert rule (Admin)
POST   /api/diagnoses/validate-symptoms      # Validate symptoms
```

### **5. Treatment Management API**

#### **Treatments CRUD**
```
GET    /api/treatments                       # Get all treatments
POST   /api/treatments                       # Create new treatment
GET    /api/treatments/:id                   # Get treatment by ID
PUT    /api/treatments/:id                   # Update treatment
DELETE /api/treatments/:id                   # Delete treatment
GET    /api/treatments/patient/:patientId    # Get patient treatments
PUT    /api/treatments/:id/status            # Update treatment status
```

### **6. Pharmacy Management API**

#### **Drugs Management**
```
GET    /api/drugs                            # Get all drugs
POST   /api/drugs                            # Add new drug
GET    /api/drugs/:id                        # Get drug by ID
PUT    /api/drugs/:id                        # Update drug
DELETE /api/drugs/:id                        # Delete drug
GET    /api/drugs/search                     # Search drugs
GET    /api/drugs/expiring                   # Get expiring drugs
GET    /api/drugs/low-stock                  # Get low stock drugs
```

#### **Prescriptions Management**
```
GET    /api/prescriptions                    # Get all prescriptions
POST   /api/prescriptions                    # Create prescription
GET    /api/prescriptions/:id                # Get prescription by ID
PUT    /api/prescriptions/:id                # Update prescription
DELETE /api/prescriptions/:id                # Delete prescription
GET    /api/prescriptions/patient/:patientId # Get patient prescriptions
PUT    /api/prescriptions/:id/fulfill        # Fulfill prescription
```

#### **Drug Administration**
```
GET    /api/drug-administration              # Get all administrations
POST   /api/drug-administration              # Record drug administration
GET    /api/drug-administration/:id          # Get administration by ID
PUT    /api/drug-administration/:id          # Update administration
GET    /api/drug-administration/patient/:patientId # Get patient administrations
```

### **7. Medical Records API**

#### **Medical Records Management**
```
GET    /api/medical-records                  # Get all medical records
POST   /api/medical-records                  # Create medical record
GET    /api/medical-records/:id              # Get record by ID
PUT    /api/medical-records/:id              # Update record
DELETE /api/medical-records/:id              # Delete record
GET    /api/medical-records/patient/:patientId # Get patient records
```

#### **File Management**
```
POST   /api/medical-records/:id/upload       # Upload medical document
GET    /api/medical-records/:id/files        # Get record files
DELETE /api/medical-records/:id/files/:fileId # Delete file
```

### **8. Reporting & Analytics API**

#### **Reports Generation**
```
GET    /api/reports/medical                  # Generate medical reports
GET    /api/reports/statistical              # Generate statistical reports
GET    /api/reports/prescription             # Generate prescription reports
POST   /api/reports/custom                   # Generate custom report
GET    /api/reports/export/:id               # Export report
```

#### **Analytics**
```
GET    /api/analytics/dashboard              # Get dashboard analytics
GET    /api/analytics/patients               # Get patient analytics
GET    /api/analytics/diagnoses              # Get diagnosis analytics
GET    /api/analytics/treatments             # Get treatment analytics
```

---

## 🗂️ **File Structure for Backend Implementation**

```
app/
├── api/                                    # Next.js API routes
│   ├── auth/                              # Authentication endpoints
│   │   ├── login/route.ts
│   │   ├── register/route.ts
│   │   └── profile/route.ts
│   ├── patients/                          # Patient management
│   │   ├── route.ts                       # GET, POST /api/patients
│   │   ├── [id]/route.ts                  # GET, PUT, DELETE /api/patients/:id
│   │   ├── search/route.ts                # GET /api/patients/search
│   │   └── [id]/medical-history/route.ts  # GET /api/patients/:id/medical-history
│   ├── appointments/                      # Appointment management
│   │   ├── route.ts                       # GET, POST /api/appointments
│   │   ├── [id]/route.ts                  # GET, PUT, DELETE /api/appointments/:id
│   │   ├── [id]/confirm/route.ts          # PUT /api/appointments/:id/confirm
│   │   ├── [id]/start/route.ts            # PUT /api/appointments/:id/start
│   │   ├── [id]/complete/route.ts         # PUT /api/appointments/:id/complete
│   │   ├── calendar/[date]/route.ts       # GET /api/appointments/calendar/:date
│   │   └── available-slots/route.ts       # GET /api/appointments/available-slots
│   ├── diagnoses/                         # Diagnosis management
│   │   ├── route.ts                       # GET, POST /api/diagnoses
│   │   ├── [id]/route.ts                  # GET, PUT, DELETE /api/diagnoses/:id
│   │   ├── ai-diagnosis/route.ts          # POST /api/diagnoses/ai-diagnosis
│   │   ├── expert-rules/route.ts          # GET, PUT /api/diagnoses/expert-rules
│   │   └── validate-symptoms/route.ts     # POST /api/diagnoses/validate-symptoms
│   ├── treatments/                        # Treatment management
│   │   ├── route.ts                       # GET, POST /api/treatments
│   │   ├── [id]/route.ts                  # GET, PUT, DELETE /api/treatments/:id
│   │   └── [id]/status/route.ts           # PUT /api/treatments/:id/status
│   ├── pharmacy/                          # Pharmacy management
│   │   ├── drugs/                         # Drug management
│   │   │   ├── route.ts                   # GET, POST /api/drugs
│   │   │   ├── [id]/route.ts              # GET, PUT, DELETE /api/drugs/:id
│   │   │   ├── search/route.ts            # GET /api/drugs/search
│   │   │   ├── expiring/route.ts          # GET /api/drugs/expiring
│   │   │   └── low-stock/route.ts         # GET /api/drugs/low-stock
│   │   ├── prescriptions/                 # Prescription management
│   │   │   ├── route.ts                   # GET, POST /api/prescriptions
│   │   │   ├── [id]/route.ts              # GET, PUT, DELETE /api/prescriptions/:id
│   │   │   └── [id]/fulfill/route.ts      # PUT /api/prescriptions/:id/fulfill
│   │   └── drug-administration/           # Drug administration
│   │       ├── route.ts                   # GET, POST /api/drug-administration
│   │       ├── [id]/route.ts              # GET, PUT /api/drug-administration/:id
│   │       └── patient/[id]/route.ts      # GET /api/drug-administration/patient/:id
│   ├── medical-records/                   # Medical records
│   │   ├── route.ts                       # GET, POST /api/medical-records
│   │   ├── [id]/route.ts                  # GET, PUT, DELETE /api/medical-records/:id
│   │   ├── [id]/upload/route.ts           # POST /api/medical-records/:id/upload
│   │   └── [id]/files/route.ts            # GET, DELETE /api/medical-records/:id/files
│   ├── reports/                           # Reporting system
│   │   ├── medical/route.ts               # GET /api/reports/medical
│   │   ├── statistical/route.ts           # GET /api/reports/statistical
│   │   ├── prescription/route.ts          # GET /api/reports/prescription
│   │   ├── custom/route.ts                # POST /api/reports/custom
│   │   └── export/[id]/route.ts           # GET /api/reports/export/:id
│   └── analytics/                         # Analytics
│       ├── dashboard/route.ts             # GET /api/analytics/dashboard
│       ├── patients/route.ts              # GET /api/analytics/patients
│       ├── diagnoses/route.ts             # GET /api/analytics/diagnoses
│       └── treatments/route.ts            # GET /api/analytics/treatments
├── lib/                                   # Backend utilities
│   ├── database/                          # Database operations
│   │   ├── patients.ts                    # Patient database operations
│   │   ├── appointments.ts                # Appointment database operations
│   │   ├── diagnoses.ts                   # Diagnosis database operations
│   │   ├── treatments.ts                  # Treatment database operations
│   │   ├── pharmacy.ts                    # Pharmacy database operations
│   │   └── medical-records.ts             # Medical records database operations
│   ├── validation/                        # Data validation schemas
│   │   ├── patient.ts                     # Patient validation schemas
│   │   ├── appointment.ts                 # Appointment validation schemas
│   │   ├── diagnosis.ts                   # Diagnosis validation schemas
│   │   └── prescription.ts                # Prescription validation schemas
│   ├── utils/                             # Backend utilities
│   │   ├── auth.ts                        # Authentication utilities
│   │   ├── validation.ts                  # Validation utilities
│   │   ├── file-upload.ts                 # File upload utilities
│   │   ├── report-generation.ts           # Report generation utilities
│   │   └── notifications.ts               # Notification utilities
│   └── types/                             # Backend type definitions
│       ├── api.ts                         # API response types
│       ├── database.ts                    # Database types
│       └── validation.ts                  # Validation types
└── middleware/                            # Custom middleware
    ├── auth.ts                            # Authentication middleware
    ├── validation.ts                      # Validation middleware
    └── rate-limiting.ts                   # Rate limiting middleware
```

---

## 🔒 **Security Implementation Requirements**

### **1. Row Level Security (RLS) Policies**

#### **User Profiles Table**
```sql
-- Users can view own profile
CREATE POLICY "Users can view own profile" ON user_profiles 
FOR SELECT USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON user_profiles 
FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
```

#### **Patients Table**
```sql
-- Patients can view own data
CREATE POLICY "Patients can view own data" ON patients 
FOR SELECT USING (
  id IN (SELECT id FROM patients WHERE patient_id = (SELECT username FROM user_profiles WHERE id = auth.uid()))
);

-- Medical staff can view all patients
CREATE POLICY "Medical staff can view patients" ON patients 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'receptionist'))
);

-- Medical staff can manage patients
CREATE POLICY "Medical staff can manage patients" ON patients 
FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'receptionist'))
);
```

### **2. API Authentication Middleware**
```typescript
// middleware/auth.ts
export function requireAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    return handler(req, res);
  };
}
```

### **3. Role-Based Access Control**
```typescript
// middleware/rbac.ts
export function requireRole(allowedRoles: string[]) {
  return (handler: NextApiHandler) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!profile || !allowedRoles.includes(profile.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      return handler(req, res);
    };
  };
}
```

---

## 📝 **Data Validation Requirements**

### **1. Patient Validation Schema**
```typescript
// lib/validation/patient.ts
import { z } from 'zod';

export const patientSchema = z.object({
  patient_id: z.string().min(1, 'Patient ID is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().date('Invalid date format'),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email format').optional(),
  address: z.string().min(1, 'Address is required'),
  emergency_contact_name: z.string().min(1, 'Emergency contact name is required'),
  emergency_contact_phone: z.string().min(10, 'Emergency contact phone must be at least 10 digits'),
  medical_history: z.string().optional(),
  allergies: z.string().optional(),
});
```

### **2. Appointment Validation Schema**
```typescript
// lib/validation/appointment.ts
export const appointmentSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  doctor_id: z.string().uuid('Invalid doctor ID'),
  appointment_date: z.string().datetime('Invalid appointment date'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
});
```

---

## 🔄 **Real-time Features Implementation**

### **1. WebSocket Integration**
```typescript
// lib/websocket/server.ts
import { Server } from 'socket.io';

export function setupWebSocket(server: any) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join user to their role-based room
    socket.on('join-role', (role) => {
      socket.join(role);
    });
    
    // Handle appointment updates
    socket.on('appointment-update', (data) => {
      io.to('receptionist').emit('appointment-changed', data);
    });
    
    // Handle diagnosis updates
    socket.on('diagnosis-update', (data) => {
      io.to('doctor').emit('diagnosis-changed', data);
    });
  });

  return io;
}
```

### **2. Real-time Notifications**
```typescript
// lib/utils/notifications.ts
export async function sendNotification(
  userId: string,
  type: 'appointment' | 'diagnosis' | 'prescription',
  message: string,
  data?: any
) {
  // Send to WebSocket
  io.to(userId).emit('notification', {
    type,
    message,
    data,
    timestamp: new Date().toISOString()
  });
  
  // Store in database for persistence
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      message,
      data,
      read: false
    });
}
```

---

## 📊 **Reporting System Implementation**

### **1. Report Generation Service**
```typescript
// lib/utils/report-generation.ts
export class ReportGenerator {
  async generateMedicalReport(patientId: string, dateRange: DateRange) {
    const patient = await this.getPatient(patientId);
    const diagnoses = await this.getDiagnoses(patientId, dateRange);
    const treatments = await this.getTreatments(patientId, dateRange);
    const prescriptions = await this.getPrescriptions(patientId, dateRange);
    
    return {
      patient,
      diagnoses,
      treatments,
      prescriptions,
      generatedAt: new Date().toISOString(),
      dateRange
    };
  }
  
  async generateStatisticalReport(dateRange: DateRange) {
    const totalPatients = await this.getTotalPatients(dateRange);
    const totalDiagnoses = await this.getTotalDiagnoses(dateRange);
    const diseaseBreakdown = await this.getDiseaseBreakdown(dateRange);
    const treatmentSuccess = await this.getTreatmentSuccess(dateRange);
    
    return {
      totalPatients,
      totalDiagnoses,
      diseaseBreakdown,
      treatmentSuccess,
      generatedAt: new Date().toISOString(),
      dateRange
    };
  }
}
```

### **2. PDF Generation**
```typescript
// lib/utils/pdf-generation.ts
import puppeteer from 'puppeteer';

export async function generatePDFReport(reportData: any, template: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const html = await renderReportTemplate(reportData, template);
  await page.setContent(html);
  
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true
  });
  
  await browser.close();
  return pdf;
}
```

---

## 🚀 **Implementation Timeline**

### **Week 1-2: Core Database Operations**
- [ ] Implement Patient Management API
- [ ] Implement Appointment Management API
- [ ] Implement User Profile Management API
- [ ] Setup RLS policies

### **Week 3-4: Medical Features**
- [ ] Implement Diagnosis Storage API
- [ ] Implement Treatment Management API
- [ ] Implement Pharmacy Management API
- [ ] Implement Drug Administration API

### **Week 5-6: Advanced Features**
- [ ] Implement Medical Records API
- [ ] Implement File Upload System
- [ ] Implement Reporting System
- [ ] Implement Analytics API

### **Week 7-8: System Features**
- [ ] Implement Notification System
- [ ] Implement Real-time Features
- [ ] Implement Audit Logging
- [ ] Performance Optimization

---

## 🧪 **Testing Strategy**

### **1. Unit Tests**
- Test each API endpoint individually
- Test database operations
- Test validation schemas
- Test utility functions

### **2. Integration Tests**
- Test complete workflows
- Test role-based access
- Test data consistency
- Test error handling

### **3. End-to-End Tests**
- Test complete user journeys
- Test cross-browser compatibility
- Test performance under load
- Test security vulnerabilities

---

## 📈 **Performance Considerations**

### **1. Database Optimization**
- Implement proper indexing
- Use database views for complex queries
- Implement query caching
- Optimize RLS policies

### **2. API Optimization**
- Implement response caching
- Use pagination for large datasets
- Implement rate limiting
- Optimize database queries

### **3. File Handling**
- Implement file compression
- Use CDN for file storage
- Implement file cleanup
- Optimize image processing

---

## 🔍 **Monitoring & Logging**

### **1. Application Monitoring**
- Implement error tracking (Sentry)
- Monitor API performance
- Track user activity
- Monitor database performance

### **2. Security Monitoring**
- Log all authentication attempts
- Monitor for suspicious activity
- Track data access patterns
- Implement security alerts

---

## 📚 **Documentation Requirements**

### **1. API Documentation**
- Complete API reference
- Request/response examples
- Error code documentation
- Authentication guide

### **2. Developer Documentation**
- Setup instructions
- Database schema documentation
- Deployment guide
- Troubleshooting guide

---

This comprehensive backend implementation guide provides a complete roadmap for transforming the MESMTF system from a frontend-only application with mock data to a fully functional medical management system with robust backend infrastructure.
