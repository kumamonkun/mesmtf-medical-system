# MESMTF Code Structure & Documentation

## 📁 **Project Structure Overview**

This document explains the code structure and organization of the MESMTF Medical Expert System.

### **🏗️ Architecture**

```
mesmtf-system-main/
├── app/                          # Next.js App Router pages
│   ├── api/                      # API endpoints (80+ endpoints)
│   │   ├── admin/                # Admin management APIs
│   │   ├── analytics/            # System analytics APIs
│   │   ├── appointments/         # Appointment management APIs
│   │   ├── diagnoses/            # Medical diagnosis APIs
│   │   ├── drugs/                # Drug management APIs
│   │   ├── files/                # File upload/management APIs
│   │   ├── medical-records/      # Medical records APIs
│   │   ├── notifications/        # Notification system APIs
│   │   ├── patients/             # Patient management APIs
│   │   ├── prescriptions/        # Prescription APIs
│   │   ├── reports/              # Reporting APIs
│   │   ├── treatments/           # Treatment tracking APIs
│   │   └── users/                # User management APIs
│   ├── dashboard/                # Main dashboard page
│   ├── patients/                 # Patient management page
│   ├── appointments/             # Appointment scheduling page
│   ├── diagnosis/                # AI diagnosis page
│   ├── pharmacy/                 # Pharmacy management page
│   ├── prescriptions/            # Prescription management page
│   ├── records/                  # Medical records page
│   ├── reports/                  # System reports page
│   ├── settings/                 # System settings page
│   ├── users/                    # User management page
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # React components (80+ components)
│   ├── admin/                    # Admin-specific components
│   ├── appointments/             # Appointment components
│   ├── auth/                     # Authentication components
│   ├── common/                   # Shared/common components
│   ├── dashboard/                # Dashboard components
│   ├── diagnosis/                # Diagnosis components
│   ├── medical-records/          # Medical records components
│   ├── patients/                 # Patient management components
│   ├── pharmacy/                 # Pharmacy components
│   ├── prescriptions/            # Prescription components
│   ├── reports/                  # Reporting components
│   ├── treatment/                # Treatment components
│   └── ui/                       # UI component library (50+ components)
├── lib/                          # Utility libraries
│   ├── api/                      # API middleware and utilities
│   ├── auth-context.tsx          # Authentication context
│   ├── database/                 # Database utilities
│   ├── supabase/                 # Supabase client configuration
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # General utilities
│   └── validation/               # Data validation schemas
├── hooks/                        # Custom React hooks
│   ├── use-admin-data.ts         # Admin data management hook
│   ├── use-api.ts                # API interaction hook
│   ├── use-doctor-data.ts        # Doctor data management hook
│   ├── use-mobile.ts             # Mobile detection hook
│   └── use-toast.ts              # Toast notification hook
├── scripts/                      # Setup and utility scripts
│   ├── complete-setup.js         # Complete system setup
│   ├── create-admin-account.js   # Admin account creation
│   ├── load-sample-data.js       # Sample data loading
│   └── setup-database.js         # Database setup
├── docs/                         # Documentation
│   ├── offline-implementation-guide.md  # Offline functionality guide
│   └── README.md                 # Documentation index
├── public/                       # Static assets
│   ├── favicon.ico               # Site favicon
│   ├── health-banner.jpg         # Health banner image
│   ├── logo-*.jpg                # Logo images
│   └── placeholder-*.jpg         # Placeholder images
├── package.json                  # Dependencies and scripts
├── next.config.mjs               # Next.js configuration
├── vercel.json                   # Vercel deployment configuration
├── tsconfig.json                 # TypeScript configuration
├── .gitignore                    # Git ignore rules
└── README.md                     # Project documentation
```

## 🔧 **Key Technologies**

### **Frontend**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### **Backend**
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication system
  - Real-time subscriptions
  - File storage
- **Next.js API Routes** - Server-side API endpoints

### **AI & External Services**
- **Botpress** - AI chatbot for medical diagnosis
- **Groq API** - AI language processing
- **Vercel Analytics** - Usage analytics

## 🏥 **Medical System Features**

### **User Roles & Access Control**
- **Admin** - Full system management
- **Doctor** - Medical diagnosis and patient management
- **Nurse** - Patient care and vital signs
- **Pharmacist** - Drug inventory and prescriptions
- **Receptionist** - Appointment scheduling
- **Patient** - Personal medical records

### **Core Medical Features**
- **Patient Management** - Complete patient records
- **Appointment System** - Scheduling and management
- **AI Diagnosis** - Botpress-powered medical diagnosis
- **Pharmacy System** - Drug inventory and prescriptions
- **Medical Records** - Comprehensive health records
- **Treatment Tracking** - Treatment history and progress
- **Reporting System** - Analytics and reports
- **File Management** - Document upload and storage

## 🔐 **Security Features**

### **Authentication & Authorization**
- **Supabase Auth** - Secure user authentication
- **Role-Based Access Control (RBAC)** - Granular permissions
- **Row Level Security (RLS)** - Database-level security
- **JWT Tokens** - Secure session management

### **Data Protection**
- **Input Validation** - Zod schema validation
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Content sanitization
- **HTTPS Enforcement** - Secure data transmission

## 📱 **Mobile & Responsive Design**

### **Mobile-First Approach**
- **Responsive Layout** - Works on all screen sizes
- **Touch-Friendly Interface** - Optimized for mobile devices
- **Progressive Web App Ready** - Can be installed on devices
- **Cross-Platform Compatibility** - Works on iOS, Android, Desktop

## 🚀 **Deployment & Hosting**

### **Production Deployment**
- **Vercel** - Primary hosting platform
- **Automatic Deployments** - GitHub integration
- **Environment Variables** - Secure configuration
- **Global CDN** - Fast loading worldwide

### **Development Workflow**
- **Git Version Control** - Code management
- **TypeScript** - Type safety
- **ESLint** - Code quality
- **Hot Reload** - Fast development

## 📊 **Performance & Monitoring**

### **Performance Features**
- **Code Splitting** - Optimized bundle sizes
- **Image Optimization** - Next.js image optimization
- **Caching Strategies** - Intelligent data caching
- **Lazy Loading** - On-demand component loading

### **Monitoring & Analytics**
- **Vercel Analytics** - Usage tracking
- **Error Logging** - Comprehensive error tracking
- **Performance Monitoring** - Core Web Vitals
- **User Analytics** - Usage patterns and insights

## 🛠️ **Development Guidelines**

### **Code Organization**
- **Component-Based Architecture** - Reusable UI components
- **Custom Hooks** - Shared logic extraction
- **Type Safety** - Comprehensive TypeScript usage
- **API-First Design** - RESTful API endpoints

### **Best Practices**
- **Medical Data Security** - HIPAA-compliant practices
- **Accessibility** - WCAG 2.1 compliance
- **Error Handling** - Comprehensive error management
- **Documentation** - Extensive code comments

## 📚 **Getting Started**

### **Prerequisites**
- Node.js 18+
- npm or pnpm
- Supabase account
- Git

### **Quick Start**
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database setup: `node scripts/setup-database.js`
5. Start development server: `npm run dev`

### **Production Deployment**
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy automatically

## 🤝 **Contributing**

### **Code Standards**
- Follow TypeScript best practices
- Add comprehensive comments
- Maintain medical data security
- Test all functionality
- Update documentation

### **Medical System Considerations**
- **Data Privacy** - Protect patient information
- **Accuracy** - Ensure medical data integrity
- **Accessibility** - Support all users
- **Reliability** - Maintain system uptime
- **Compliance** - Follow healthcare regulations

---

**Built with ❤️ for healthcare professionals by the Ministry of Health and Social Services**
