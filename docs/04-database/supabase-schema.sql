-- MESMTF Database Schema for Supabase
-- Medical Expert System for Malaria and Typhoid Fever

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable anonymous authentication
-- Note: This needs to be enabled in Supabase Dashboard > Authentication > Settings
-- Set "Enable anonymous sign-ins" to true

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'nurse', 'pharmacist', 'receptionist', 'admin')),
  specialization TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  phone TEXT,
  email TEXT,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_history TEXT,
  allergies TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  license_number TEXT UNIQUE NOT NULL,
  specialization TEXT NOT NULL,
  years_of_experience INTEGER,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create diagnoses table
CREATE TABLE IF NOT EXISTS diagnoses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  symptoms TEXT[] NOT NULL,
  diagnosis TEXT NOT NULL,
  confidence_level INTEGER CHECK (confidence_level >= 0 AND confidence_level <= 100),
  expert_system_result TEXT,
  doctor_notes TEXT,
  requires_xray BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_sessions table for AI chatbot conversations
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]'::jsonb,
  patient_data JSONB DEFAULT '{}'::jsonb,
  diagnosis_state TEXT DEFAULT 'collecting' CHECK (diagnosis_state IN ('collecting', 'analyzing', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create treatments table
CREATE TABLE IF NOT EXISTS treatments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  diagnosis_id UUID REFERENCES diagnoses(id) ON DELETE CASCADE,
  treatment_plan TEXT NOT NULL,
  duration_days INTEGER,
  instructions TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drugs table
CREATE TABLE IF NOT EXISTS drugs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  generic_name TEXT,
  dosage_form TEXT NOT NULL,
  strength TEXT,
  manufacturer TEXT,
  description TEXT,
  contraindications TEXT,
  side_effects TEXT,
  is_prescription_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  treatment_id UUID REFERENCES treatments(id) ON DELETE CASCADE,
  drug_id UUID REFERENCES drugs(id) ON DELETE CASCADE,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  instructions TEXT,
  quantity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drug_administration table
CREATE TABLE IF NOT EXISTS drug_administration (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE CASCADE,
  administered_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  administered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  quantity_administered INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medical_reports table
CREATE TABLE IF NOT EXISTS medical_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('diagnosis', 'treatment', 'prescription', 'administration', 'statistical')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  generated_by UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expert_system_rules table
CREATE TABLE IF NOT EXISTS expert_system_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  disease_name TEXT NOT NULL,
  symptoms TEXT[] NOT NULL,
  severity_level TEXT NOT NULL CHECK (severity_level IN ('very_strong', 'strong', 'weak', 'very_weak')),
  diagnosis TEXT NOT NULL,
  treatment_recommendation TEXT,
  requires_xray BOOLEAN DEFAULT false,
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient_id ON diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_created_at ON diagnoses(created_at);
CREATE INDEX IF NOT EXISTS idx_drugs_name ON drugs(name);
CREATE INDEX IF NOT EXISTS idx_prescriptions_treatment_id ON prescriptions(treatment_id);
CREATE INDEX IF NOT EXISTS idx_medical_reports_patient_id ON medical_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_reports_type ON medical_reports(report_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_diagnoses_updated_at BEFORE UPDATE ON diagnoses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_treatments_updated_at BEFORE UPDATE ON treatments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON drugs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expert_system_rules_updated_at BEFORE UPDATE ON expert_system_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_administration ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Note: Anonymous users don't have profiles in user_profiles table
-- They are handled separately in the application layer

-- Patients policies
CREATE POLICY "Admins and receptionists can manage patients" ON patients FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'receptionist'))
);
CREATE POLICY "Doctors can view patients" ON patients FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse'))
);

-- Appointments policies
CREATE POLICY "Users can view own appointments" ON appointments FOR SELECT USING (
  patient_id IN (SELECT id FROM patients WHERE patient_id = (SELECT username FROM user_profiles WHERE id = auth.uid()))
  OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'receptionist'))
);
CREATE POLICY "Staff can manage appointments" ON appointments FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'receptionist'))
);

-- Insert sample data for testing
INSERT INTO drugs (name, generic_name, dosage_form, strength, manufacturer, description, is_prescription_required) VALUES
('Chloroquine', 'Chloroquine Phosphate', 'Tablet', '250mg', 'Generic', 'Antimalarial drug for treatment and prevention of malaria', true),
('Artemether-Lumefantrine', 'Coartem', 'Tablet', '20mg/120mg', 'Novartis', 'Combination antimalarial therapy', true),
('Ciprofloxacin', 'Ciprofloxacin Hydrochloride', 'Tablet', '500mg', 'Generic', 'Antibiotic for typhoid fever treatment', true),
('Azithromycin', 'Azithromycin Dihydrate', 'Tablet', '500mg', 'Generic', 'Macrolide antibiotic for typhoid fever', true),
('Paracetamol', 'Acetaminophen', 'Tablet', '500mg', 'Generic', 'Pain reliever and fever reducer', false);

-- Insert expert system rules for Malaria and Typhoid
INSERT INTO expert_system_rules (disease_name, symptoms, severity_level, diagnosis, treatment_recommendation, requires_xray, confidence_score) VALUES
('Malaria', ARRAY['abdominal pain', 'vomiting', 'sore throat'], 'very_strong', 'Malaria', 'Chloroquine + Chest X-ray required', true, 95),
('Malaria', ARRAY['headache', 'fatigue', 'cough'], 'strong', 'Malaria', 'Artemether-Lumefantrine', false, 85),
('Malaria', ARRAY['chest pain', 'back pain', 'muscle pain'], 'weak', 'Possible Malaria', 'Further evaluation needed', false, 60),
('Malaria', ARRAY['diarrhea', 'sweating', 'rash'], 'very_weak', 'Possible Malaria', 'Monitor symptoms', false, 40),
('Typhoid Fever', ARRAY['abdominal pain', 'stomach issues'], 'very_strong', 'Typhoid Fever', 'Ciprofloxacin + Chest X-ray required', true, 95),
('Typhoid Fever', ARRAY['constipation', 'headache', 'persistent high fever'], 'strong', 'Typhoid Fever', 'Azithromycin', false, 85),
('Typhoid Fever', ARRAY['weakness', 'tiredness'], 'weak', 'Possible Typhoid', 'Further evaluation needed', false, 60),
('Typhoid Fever', ARRAY['loss of appetite', 'rash'], 'very_weak', 'Possible Typhoid', 'Monitor symptoms', false, 40);
