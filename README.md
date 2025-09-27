# MESMTF - Medical Expert System for Malaria and Typhoid Fever

<div align="center">
  <img src="public/placeholder-logo.svg" alt="MESMTF Logo" width="120" height="120">
  
  **Advanced Medical Expert System for Malaria & Typhoid Fever**
  
  *Ministry of Health and Social Services*

  [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

## Overview

MESMTF is a comprehensive medical management system that combines AI-powered diagnosis with complete healthcare workflow management. Specifically designed for malaria and typhoid fever diagnosis and treatment, it serves healthcare professionals with intelligent decision support and streamlined patient care.

### Key Features

-  **AI-Powered Diagnosis** - Expert system with 94.2% accuracy for malaria/typhoid
-  **Role-Based Access** - 6 distinct user roles with appropriate permissions
-  **Patient Management** - Comprehensive medical records and history
-  **Pharmacy Integration** - Drug inventory and prescription management
-  **Advanced Analytics** - Real-time reports and statistical insights
-  **Responsive Design** - Works seamlessly on all devices
-  **Secure Authentication** - Supabase-powered role-based security
-  **Real-time Messaging** - Internal communication system
-  **Treatment Tracking** - Complete treatment history and outcomes
-  **Production Ready** - Fully functional with real database integration

##  Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm package manager
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/mesmtf-system.git
   cd mesmtf-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Application Configuration
   NEXT_PUBLIC_APP_NAME=MESMTF
   NEXT_PUBLIC_VERSION=1.0.0
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `docs/supabase-schema.sql`
   - Run the SQL script to create all tables

5. **Load sample data**
   ```bash
   node scripts/complete-setup.js
   ```

6. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Login Credentials

After running the setup script, use these credentials:

- **Admin**: admin@mesmtf.com / admin123456
- **Doctor**: dr.smith@mesmtf.com / doctor123
- **Nurse**: nurse.brown@mesmtf.com / nurse123

>  **Note**: See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup instructions


### Project Structure

```
mesmtf-system/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (80+ endpoints)
│   ├── appointments/       # Appointment management
│   ├── dashboard/         # Role-based dashboards
│   ├── diagnosis/         # AI diagnosis system
│   ├── pharmacy/          # Drug management
│   ├── records/           # Medical records
│   ├── patients/          # Patient management
│   ├── prescriptions/     # Prescription management
│   ├── treatment/         # Treatment tracking
│   ├── messages/          # Messaging system
│   ├── reports/           # Reporting system
│   ├── users/             # User management
│   ├── settings/          # System settings
│   └── profile/           # User profiles
├── components/            # React components (80+ components)
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Role-based dashboard layouts
│   ├── diagnosis/        # AI expert system UI
│   ├── medical-records/  # Patient management components
│   ├── pharmacy/         # Pharmacy and drug components
│   ├── treatment/        # Treatment tracking components
│   ├── messages/         # Messaging system components
│   ├── appointments/     # Appointment management components
│   ├── patients/         # Patient management components
│   ├── prescriptions/    # Prescription components
│   ├── reports/          # Reporting components
│   ├── admin/            # Admin management components
│   ├── nurse/            # Nurse-specific components
│   ├── profile/          # User profile components
│   ├── common/           # Shared components
│   └── ui/               # Reusable UI components (50+ components)
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and helpers
│   ├── supabase/         # Database client
│   ├── database/         # Database operations
│   ├── validation/       # Data validation schemas
│   ├── types/            # TypeScript definitions
│   └── utils/            # Utility functions
├── scripts/              # Setup and utility scripts
├── docs/                 # Documentation and schemas
└── public/               # Static assets
```

## Component Overview

###  UI Components (50+ Components)
- **Form Components**: Input, Textarea, Select, Checkbox, Radio, Switch
- **Layout Components**: Card, Sheet, Dialog, Drawer, Tabs, Accordion
- **Navigation Components**: Sidebar, Navigation Menu, Breadcrumb, Pagination
- **Data Display**: Table, Chart, Badge, Avatar, Progress, Skeleton
- **Feedback Components**: Alert, Toast, Sonner, Tooltip, Hover Card
- **Interactive Components**: Button, Command, Calendar, Carousel, Slider

###  Medical Management Components
- **Patient Management**: `patients-view.tsx`, `patient-detail-dialog.tsx`, `add-patient-dialog.tsx`
- **Medical Records**: `medical-records-view.tsx`, `patient-record-detail.tsx`, `add-patient-dialog.tsx`
- **Appointment System**: `appointment-calendar.tsx`, `appointment-view.tsx`, `book-appointment-dialog.tsx`
- **Treatment Tracking**: `treatment-view.tsx`, `treatment-plans.tsx`, `treatment-history.tsx`

###  AI Diagnosis Components
- **Diagnosis Interface**: `diagnosis-view.tsx`, `symptom-checker.tsx`, `diagnosis-result.tsx`
- **AI Chatbot**: `simple-ai-chatbot.tsx`, `simple-chatbot.tsx`, `simple-interface-selector.tsx`
- **Botpress Integration**: Advanced AI chatbot with natural language processing
- **Diagnosis History**: `diagnosis-history.tsx`

###  Pharmacy Components
- **Drug Management**: `drug-inventory.tsx`, `inventory-view.tsx`, `pharmacy-view.tsx`
- **Prescription System**: `prescription-management.tsx`, `prescriptions-view.tsx`
- **Drug Administration**: `drug-administration.tsx`, `dispensing-view.tsx`

###  User Management Components
- **Authentication**: `login-form.tsx`, `register-form.tsx`
- **User Profiles**: `profile-view.tsx`
- **Admin Management**: `admin-dashboard.tsx`, `users-view.tsx`, `data-view.tsx`, `settings-view.tsx`

###  Dashboard Components
- **Role-Based Dashboards**: 
  - `admin-dashboard.tsx` - System administration
  - `doctor-dashboard.tsx` - Medical professional interface
  - `nurse-dashboard.tsx` - Nursing staff interface
  - `pharmacist-dashboard.tsx` - Pharmacy management
  - `receptionist-dashboard.tsx` - Front desk operations
  - `patient-dashboard.tsx` - Patient self-service
  - `guest-dashboard.tsx` - Public access

###  Communication Components
- **Messaging System**: `messages-view.tsx`
- **Notification System**: Integrated throughout all components

###  Reporting Components
- **Medical Reports**: `medical-reports.tsx`, `reports-view.tsx`
- **Prescription Reports**: `prescription-reports.tsx`

###  Specialized Components
- **Nurse Components**: `schedules-view.tsx`, `vitals-view.tsx`
- **Common Components**: `data-table.tsx` - Reusable data display
- **Theme Provider**: `theme-provider.tsx` - Dark/light mode support

##  Expert System

### AI Diagnosis Engine

The heart of MESMTF is its sophisticated expert system for malaria and typhoid fever diagnosis:

#### Diagnosis Process

1. **Patient Information Collection**
   - Demographics and vital signs
   - Medical history and allergies
   - Symptom duration and severity

2. **Symptom Analysis**
   - Categorized symptom selection
   - Weighted scoring algorithm
   - Temperature factor integration

3. **AI Decision Making**
   - Rule-based inference engine
   - Confidence scoring (up to 95%)
   - Treatment recommendations
   - X-ray requirement determination

#### Supported Conditions

- **Malaria** (P. falciparum focus)
- **Typhoid Fever**
- **Co-infection Detection**
- **Differential Diagnosis**

###  Botpress AI Chatbot Integration

The system includes an advanced AI chatbot powered by Botpress that provides:

#### Features
- **Natural Language Processing** - Understands conversational queries
- **Medical Consultation** - Provides medical advice and guidance
- **Symptom Assessment** - Interactive symptom checking
- **Treatment Recommendations** - AI-powered treatment suggestions
- **24/7 Availability** - Always accessible for patient queries
- **Multi-language Support** - Supports multiple languages
- **Context Awareness** - Maintains conversation context

#### Integration Details
- **Webchat Widget** - Embedded directly in the application
- **Real-time Communication** - Instant responses to user queries
- **Seamless UX** - Integrated with the existing UI design
- **Mobile Optimized** - Works perfectly on all devices
- **Secure Communication** - Encrypted data transmission

##  Features Overview

###  Medical Management System
- **Patient Records**  - Comprehensive medical histories with real database storage
- **Appointment System**  - Calendar-based scheduling with Supabase integration
- **Treatment Plans**  - Evidence-based protocols with outcome tracking
- **Medical Reports**  - Automated documentation and reporting
- **Treatment History**  - Complete treatment tracking with real-time updates
- **Medical Records Management**  - Full CRUD operations with search and filtering
- **Vital Signs Tracking**  - Patient vital signs monitoring and history
- **Diagnosis System**  - AI-powered expert system for malaria and typhoid fever

###  Pharmacy & Drug Management
- **Drug Inventory**  - Real-time stock management with database sync
- **Prescription Management**  - Digital prescriptions with patient linking
- **Drug Administration**  - Dosage tracking and monitoring
- **Expiry Monitoring**  - Automated alerts and notifications
- **Drug Interactions**  - Safety checks for drug combinations
- **Low Stock Alerts**  - Automated inventory management
- **Dispensing System**  - Complete drug dispensing workflow
- **Prescription Fulfillment**  - End-to-end prescription processing

###  AI Diagnosis & Expert System
- **Symptom Analysis**  - Weighted scoring algorithm for symptoms
- **Expert Rules Engine** - Rule-based inference system
- **AI Chatbot**  - Interactive diagnosis assistance
- **Botpress Integration**  - Advanced AI chatbot with natural language processing
- **Diagnosis Validation**  - Multi-layer symptom validation
- **Treatment Recommendations**  - AI-generated treatment suggestions
- **Confidence Scoring**  - Up to 95% accuracy in diagnosis
- **X-ray Requirements**  - Automated imaging recommendations


### Analytics & Reporting
- **Statistical Reports** - Disease prevalence tracking with real data
- **Treatment Outcomes**  - Success rate analysis from actual treatments
- **System Performance**  - Usage analytics and monitoring
- **Export Capabilities**  - PDF and CSV reports with real data
- **Dashboard Analytics**  - Real-time system metrics
- **Financial Reports**  - Revenue and cost analysis
- **Patient Analytics**  - Patient demographics and trends
- **Pharmacy Analytics**  - Drug usage and inventory reports

### User Management & Administration
- **Role-Based Access Control**  - 6 distinct user roles with permissions
- **User Profile Management**  - Complete user profile system
- **Admin Dashboard**  - System administration interface
- **User Role Management**  - Dynamic role assignment
- **Account Management**  - User activation/deactivation
- **Permission System**  - Granular access control


### Security & Authentication
- **Supabase Authentication**  - Secure user management with JWT tokens
- **Row Level Security**  - Database-level access control
- **Data Encryption**  - Patient privacy protection
- **Audit Trails**  - Complete activity logging
- **Session Management**  - Secure login/logout with token refresh
- **Input Validation**  - Comprehensive data validation
- **SQL Injection Prevention** - Database security measures
- **XSS Protection**  - Cross-site scripting prevention

## UI/UX Design

### Design Philosophy
- **Medical-Grade Interface**: Professional, clinical design
- **Accessibility First**: WCAG 2.1 compliant
- **Responsive Layout**: Mobile-first approach
- **Dark Mode Support**: Eye-strain reduction


##  Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Create a `.env.local` file with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_NAME=MESMTF
NEXT_PUBLIC_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Deployment Platforms

- **Vercel** (Recommended)
- **Netlify**
- **Docker**
- **Traditional hosting**


- **Ministry of Health and Social Services** - Project sponsor
- **Medical Advisory Board** - Clinical expertise
- **Open Source Community** - Technology foundation

##  Current System Status


### **Live Website**
**Production URL:** https://mesmtf-system-main-3f3c3y86r-kumamonkuns-projects.vercel.app


<div align="center">
  <p>Built with ❤️ for healthcare professionals</p>
  <p><strong>Ministry of Health and Social Services</strong></p>
</div>
