# MESMTF - Medical Expert System for Malaria and Typhoid Fever

A comprehensive web-based medical expert system developed for the Ministry of Health and Social Services as part of the Programming Competition 2025.

## 🏥 System Overview

The MESMTF system provides a complete e-Health solution covering:
- **AI-Powered Diagnosis** - Rule-based expert system for Malaria and Typhoid Fever
- **Patient Management** - Complete patient registration and medical records
- **Appointment System** - Doctor scheduling and appointment booking
- **Pharmacy Management** - Drug inventory and prescription management
- **Reporting System** - Medical reports and statistical analysis
- **Multi-User Support** - Role-based access for patients, doctors, nurses, pharmacists, and administrators

## 🚀 Quick Start with XAMPP

### Prerequisites
- XAMPP (Apache, MySQL, PHP 7.4+)
- Web browser (Chrome, Firefox, Safari, Edge)

### Installation Steps

1. **Start XAMPP Services**
   ```
   - Start Apache
   - Start MySQL
   ```

2. **Copy Project Files**
   ```
   Copy the entire 'mesmtf' folder to: C:\xampp\htdocs\
   ```

3. **Create Database**
   - Open phpMyAdmin: http://localhost/phpmyadmin
   - Import the database schema: `database/schema.sql`
   - Or run the SQL commands manually

4. **Configure Database Connection**
   - Edit `includes/config.php` if needed
   - Default settings work with XAMPP default configuration

5. **Access the System**
   ```
   Open browser and go to: http://localhost/mesmtf
   ```

## 👥 Default Login Credentials

### Administrator
- **Username:** admin
- **Email:** admin@mesmtf.gov
- **Password:** password
- **Role:** Administrator

## 🏗️ System Architecture

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Bootstrap 5
- **JavaScript** - Interactive features and AJAX
- **Bootstrap 5** - Responsive design framework
- **Font Awesome** - Icons and visual elements

### Backend
- **PHP 7.4+** - Server-side scripting
- **MySQL** - Database management
- **PDO** - Database abstraction layer
- **Session Management** - User authentication

### Expert System
- **Rule-Based Inference** - Production rules for diagnosis
- **Confidence Scoring** - Weighted symptom analysis
- **Treatment Recommendations** - Drug and procedure suggestions

## 📁 Project Structure

```
mesmtf/
├── assets/
│   ├── css/
│   │   └── style.css          # Main stylesheet
│   ├── js/
│   │   └── main.js            # JavaScript functions
│   └── images/                # Image assets
├── includes/
│   ├── config.php             # Database configuration
│   └── functions.php          # Common functions
├── modules/                   # Core system modules
├── admin/                     # Administrator interface
├── patient/                   # Patient dashboard
├── doctor/                    # Doctor interface
├── pharmacy/                  # Pharmacy management
├── database/
│   └── schema.sql             # Database schema
├── index.php                  # Home page
├── login.php                  # User login
├── register.php               # User registration
├── diagnosis.php              # AI diagnosis module
└── logout.php                 # Logout handler
```

## 🔧 Core Features

### 1. AI Diagnosis System
- **Symptom Analysis** - Weighted scoring system
- **Confidence Levels** - Percentage-based diagnosis confidence
- **Treatment Recommendations** - Drug and procedure suggestions
- **X-Ray Requirements** - Automatic detection for severe symptoms

### 2. User Management
- **Multi-Role Support** - Patients, Doctors, Nurses, Pharmacists, Admins
- **Secure Authentication** - Password hashing and session management
- **Profile Management** - User information and preferences

### 3. Appointment System
- **Doctor Scheduling** - Available time slots
- **Patient Booking** - Easy appointment scheduling
- **Status Tracking** - Scheduled, Confirmed, Completed, Cancelled

### 4. Medical Records
- **Patient History** - Complete medical record management
- **Diagnosis Tracking** - AI and doctor diagnoses
- **File Uploads** - Medical documents and images

### 5. Pharmacy Management
- **Drug Inventory** - Stock management
- **Prescription Processing** - Digital prescription handling
- **Drug Information** - Dosage and side effects

## 🎯 Expert System Rules

### Malaria Symptoms (Weighted)
- **Very Strong (4):** Abdominal pain, Vomiting, Sore throat
- **Strong (3):** Headache, Fatigue, Cough
- **Weak (2):** Chest pain, Back pain, Muscle pain
- **Very Weak (1):** Diarrhea, Sweating, Rash

### Typhoid Symptoms (Weighted)
- **Very Strong (4):** Abdominal pain, Stomach issues
- **Strong (3):** Constipation, Headache, Persistent high fever
- **Weak (2):** Weakness, Tiredness
- **Very Weak (1):** Loss of appetite, Rash

### Treatment Protocol
- **Very Strong Symptoms** → Chest X-ray + Drug treatment
- **Other Symptoms** → Drug treatment only

## 🔒 Security Features

- **Password Hashing** - bcrypt encryption
- **Session Management** - Secure session handling
- **SQL Injection Prevention** - PDO prepared statements
- **XSS Protection** - Input sanitization
- **Role-Based Access** - User permission system
- **Activity Logging** - User action tracking

## 📱 Responsive Design

- **Mobile-First** - Optimized for mobile devices
- **Tablet Support** - Responsive tablet layout
- **Desktop Optimized** - Full desktop experience
- **Cross-Browser** - Chrome, Firefox, Safari, Edge

## 🚀 Deployment

### Local Development
1. Use XAMPP for local development
2. Access via `http://localhost/mesmtf`

### Production Deployment
1. Upload files to web server
2. Configure database connection
3. Set proper file permissions
4. Enable HTTPS for security
5. Configure email settings

## 🛠️ Customization

### Adding New Diseases
1. Add symptoms to `expert_rules` table
2. Update diagnosis functions in `functions.php`
3. Add treatment recommendations
4. Update frontend symptom lists

### Styling Customization
- Edit `assets/css/style.css`
- Modify Bootstrap variables
- Add custom CSS classes

### Database Schema
- Modify `database/schema.sql`
- Update related PHP functions
- Test all functionality

## 📊 System Requirements

### Server Requirements
- **PHP:** 7.4 or higher
- **MySQL:** 5.7 or higher
- **Apache:** 2.4 or higher
- **Memory:** 256MB minimum
- **Storage:** 100MB minimum

### Browser Support
- **Chrome:** 80+
- **Firefox:** 75+
- **Safari:** 13+
- **Edge:** 80+

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check XAMPP MySQL service
   - Verify database credentials in `config.php`
   - Ensure database exists

2. **Session Issues**
   - Check PHP session configuration
   - Verify file permissions
   - Clear browser cookies

3. **File Upload Problems**
   - Check PHP upload limits
   - Verify file permissions
   - Check allowed file types

4. **Styling Issues**
   - Clear browser cache
   - Check CSS file paths
   - Verify Bootstrap CDN

## 📞 Support

For technical support or questions:
- **Email:** support@mesmtf.gov
- **Documentation:** See project documentation
- **Issues:** Report bugs via issue tracker

## 📄 License

This project is developed for the Ministry of Health and Social Services as part of Programming Competition 2025.

## 🏆 Competition Notes

This system demonstrates:
- **Full-Stack Development** - Complete web application
- **AI Implementation** - Expert system with rule-based inference
- **Database Design** - Normalized relational database
- **Security Best Practices** - Authentication and authorization
- **Responsive Design** - Mobile-first approach
- **User Experience** - Intuitive interface design

---

**Developed for:** Programming Competition 2025  
**Client:** Ministry of Health and Social Services  
**Duration:** 19-28 September 2025  
**Version:** 1.0.0