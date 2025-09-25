-- MESMTF Database Schema
-- Medical Expert System for Malaria and Typhoid Fever

CREATE DATABASE IF NOT EXISTS mesmtf_db;
USE mesmtf_db;

-- Users table (for all user types)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'doctor', 'patient', 'pharmacist', 'nurse', 'receptionist') NOT NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Patients table (extends users)
CREATE TABLE patients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    patient_id VARCHAR(20) UNIQUE NOT NULL,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    address TEXT,
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    medical_history TEXT,
    allergies TEXT,
    blood_type VARCHAR(5),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Doctors table (extends users)
CREATE TABLE doctors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    specialization VARCHAR(100),
    experience_years INT,
    consultation_fee DECIMAL(10,2),
    available_days JSON,
    available_times JSON,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Appointments table
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

-- Diagnoses table
CREATE TABLE diagnoses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT,
    appointment_id INT,
    symptoms JSON NOT NULL,
    preliminary_diagnosis VARCHAR(100),
    final_diagnosis VARCHAR(100),
    confidence_score INT,
    requires_xray BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE SET NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- Treatments table
CREATE TABLE treatments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    diagnosis_id INT NOT NULL,
    treatment_plan TEXT NOT NULL,
    prescribed_drugs JSON,
    dosage_instructions TEXT,
    follow_up_date DATE,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id) ON DELETE CASCADE
);

-- Drugs table
CREATE TABLE drugs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    generic_name VARCHAR(100),
    drug_type ENUM('malaria', 'typhoid', 'both', 'general') NOT NULL,
    dosage_form VARCHAR(50),
    strength VARCHAR(50),
    description TEXT,
    side_effects TEXT,
    contraindications TEXT,
    stock_quantity INT DEFAULT 0,
    unit_price DECIMAL(10,2),
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions table
CREATE TABLE prescriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    prescription_id VARCHAR(20) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    diagnosis_id INT,
    drugs JSON NOT NULL,
    instructions TEXT,
    status ENUM('pending', 'dispensed', 'cancelled') DEFAULT 'pending',
    dispensed_by INT,
    dispensed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
    FOREIGN KEY (diagnosis_id) REFERENCES diagnoses(id) ON DELETE SET NULL,
    FOREIGN KEY (dispensed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Medical records table
CREATE TABLE medical_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    record_type ENUM('diagnosis', 'treatment', 'prescription', 'lab_result', 'xray', 'other') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    file_type VARCHAR(50),
    file_size INT,
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Activity logs table
CREATE TABLE activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- System settings table
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Expert system rules table
CREATE TABLE expert_rules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    disease_type ENUM('malaria', 'typhoid', 'both') NOT NULL,
    symptom VARCHAR(100) NOT NULL,
    severity ENUM('very_strong', 'strong', 'weak', 'very_weak') NOT NULL,
    weight INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES 
('admin', 'admin@mesmtf.gov', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System', 'Administrator', 'admin');

-- Insert expert system rules for Malaria
INSERT INTO expert_rules (disease_type, symptom, severity, weight, description) VALUES
('malaria', 'abdominal_pain', 'very_strong', 4, 'Severe abdominal pain'),
('malaria', 'vomiting', 'very_strong', 4, 'Persistent vomiting'),
('malaria', 'sore_throat', 'very_strong', 4, 'Sore throat'),
('malaria', 'headache', 'strong', 3, 'Severe headache'),
('malaria', 'fatigue', 'strong', 3, 'Extreme fatigue'),
('malaria', 'cough', 'strong', 3, 'Persistent cough'),
('malaria', 'chest_pain', 'weak', 2, 'Chest pain'),
('malaria', 'back_pain', 'weak', 2, 'Back pain'),
('malaria', 'muscle_pain', 'weak', 2, 'Muscle pain'),
('malaria', 'diarrhea', 'very_weak', 1, 'Diarrhea'),
('malaria', 'sweating', 'very_weak', 1, 'Excessive sweating'),
('malaria', 'rash', 'very_weak', 1, 'Skin rash');

-- Insert expert system rules for Typhoid
INSERT INTO expert_rules (disease_type, symptom, severity, weight, description) VALUES
('typhoid', 'abdominal_pain', 'very_strong', 4, 'Severe abdominal pain'),
('typhoid', 'stomach_issues', 'very_strong', 4, 'Stomach issues'),
('typhoid', 'constipation', 'strong', 3, 'Constipation'),
('typhoid', 'headache', 'strong', 3, 'Severe headache'),
('typhoid', 'persistent_high_fever', 'strong', 3, 'Persistent high fever'),
('typhoid', 'weakness', 'weak', 2, 'General weakness'),
('typhoid', 'tiredness', 'weak', 2, 'Extreme tiredness'),
('typhoid', 'loss_of_appetite', 'very_weak', 1, 'Loss of appetite'),
('typhoid', 'rash', 'very_weak', 1, 'Skin rash');

-- Insert sample drugs
INSERT INTO drugs (name, generic_name, drug_type, dosage_form, strength, description, stock_quantity, unit_price) VALUES
('Coartem', 'Artemether-Lumefantrine', 'malaria', 'Tablet', '20mg/120mg', 'Antimalarial medication', 100, 25.00),
('Chloroquine', 'Chloroquine Phosphate', 'malaria', 'Tablet', '250mg', 'Antimalarial medication', 150, 15.00),
('Quinine', 'Quinine Sulfate', 'malaria', 'Tablet', '300mg', 'Antimalarial medication', 75, 30.00),
('Ciprofloxacin', 'Ciprofloxacin', 'typhoid', 'Tablet', '500mg', 'Antibiotic for typhoid', 200, 20.00),
('Azithromycin', 'Azithromycin', 'typhoid', 'Tablet', '500mg', 'Antibiotic for typhoid', 180, 35.00),
('Ceftriaxone', 'Ceftriaxone', 'typhoid', 'Injection', '1g', 'Antibiotic injection for typhoid', 50, 150.00),
('Paracetamol', 'Acetaminophen', 'general', 'Tablet', '500mg', 'Pain reliever and fever reducer', 500, 5.00);

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('site_name', 'MESMTF - Medical Expert System', 'Website name'),
('site_email', 'info@mesmtf.gov', 'Contact email'),
('max_appointments_per_day', '20', 'Maximum appointments per doctor per day'),
('appointment_duration', '30', 'Appointment duration in minutes'),
('diagnosis_confidence_threshold', '70', 'Minimum confidence percentage for diagnosis'),
('session_timeout', '3600', 'Session timeout in seconds');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_patient_id ON patients(patient_id);
CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_diagnoses_patient_id ON diagnoses(patient_id);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);