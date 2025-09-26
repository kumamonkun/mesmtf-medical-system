-- MESMTF Row Level Security (RLS) Policies
-- This file contains all RLS policies for the MESMTF system

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE drugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_administration ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_system_rules ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USER_PROFILES TABLE POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles 
FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles 
FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON user_profiles 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can insert new profiles
CREATE POLICY "Admins can insert profiles" ON user_profiles 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =============================================
-- PATIENTS TABLE POLICIES
-- =============================================

-- Patients can view their own data
CREATE POLICY "Patients can view own data" ON patients 
FOR SELECT USING (
  id IN (
    SELECT id FROM patients 
    WHERE patient_id = (
      SELECT username FROM user_profiles 
      WHERE id = auth.uid()
    )
  )
);

-- Medical staff can view all patients
CREATE POLICY "Medical staff can view patients" ON patients 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'receptionist')
  )
);

-- Medical staff can manage patients
CREATE POLICY "Medical staff can manage patients" ON patients 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'receptionist')
  )
);

-- =============================================
-- DOCTORS TABLE POLICIES
-- =============================================

-- Everyone can view doctors (for appointment booking)
CREATE POLICY "Everyone can view doctors" ON doctors 
FOR SELECT USING (true);

-- Only admins can manage doctors
CREATE POLICY "Admins can manage doctors" ON doctors 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =============================================
-- APPOINTMENTS TABLE POLICIES
-- =============================================

-- Patients can view their own appointments
CREATE POLICY "Patients can view own appointments" ON appointments 
FOR SELECT USING (
  patient_id IN (
    SELECT id FROM patients 
    WHERE patient_id = (
      SELECT username FROM user_profiles 
      WHERE id = auth.uid()
    )
  )
);

-- Medical staff can view all appointments
CREATE POLICY "Medical staff can view appointments" ON appointments 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'receptionist')
  )
);

-- Medical staff can manage appointments
CREATE POLICY "Medical staff can manage appointments" ON appointments 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'receptionist')
  )
);

-- =============================================
-- DIAGNOSES TABLE POLICIES
-- =============================================

-- Patients can view their own diagnoses
CREATE POLICY "Patients can view own diagnoses" ON diagnoses 
FOR SELECT USING (
  patient_id IN (
    SELECT id FROM patients 
    WHERE patient_id = (
      SELECT username FROM user_profiles 
      WHERE id = auth.uid()
    )
  )
);

-- Medical staff can view all diagnoses
CREATE POLICY "Medical staff can view diagnoses" ON diagnoses 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse')
  )
);

-- Doctors and admins can manage diagnoses
CREATE POLICY "Doctors can manage diagnoses" ON diagnoses 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'doctor')
  )
);

-- =============================================
-- TREATMENTS TABLE POLICIES
-- =============================================

-- Patients can view their own treatments
CREATE POLICY "Patients can view own treatments" ON treatments 
FOR SELECT USING (
  patient_id IN (
    SELECT id FROM patients 
    WHERE patient_id = (
      SELECT username FROM user_profiles 
      WHERE id = auth.uid()
    )
  )
);

-- Medical staff can view all treatments
CREATE POLICY "Medical staff can view treatments" ON treatments 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse')
  )
);

-- Doctors and admins can manage treatments
CREATE POLICY "Doctors can manage treatments" ON treatments 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'doctor')
  )
);

-- =============================================
-- DRUGS TABLE POLICIES
-- =============================================

-- Everyone can view drugs (for prescriptions)
CREATE POLICY "Everyone can view drugs" ON drugs 
FOR SELECT USING (true);

-- Only admins and pharmacists can manage drugs
CREATE POLICY "Admins and pharmacists can manage drugs" ON drugs 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'pharmacist')
  )
);

-- =============================================
-- PRESCRIPTIONS TABLE POLICIES
-- =============================================

-- Patients can view their own prescriptions
CREATE POLICY "Patients can view own prescriptions" ON prescriptions 
FOR SELECT USING (
  patient_id IN (
    SELECT id FROM patients 
    WHERE patient_id = (
      SELECT username FROM user_profiles 
      WHERE id = auth.uid()
    )
  )
);

-- Medical staff can view all prescriptions
CREATE POLICY "Medical staff can view prescriptions" ON prescriptions 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'pharmacist')
  )
);

-- Doctors and admins can create prescriptions
CREATE POLICY "Doctors can create prescriptions" ON prescriptions 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'doctor')
  )
);

-- Pharmacists can update prescriptions (fulfillment)
CREATE POLICY "Pharmacists can update prescriptions" ON prescriptions 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'pharmacist')
  )
);

-- =============================================
-- DRUG_ADMINISTRATION TABLE POLICIES
-- =============================================

-- Patients can view their own drug administration records
CREATE POLICY "Patients can view own drug administration" ON drug_administration 
FOR SELECT USING (
  patient_id IN (
    SELECT id FROM patients 
    WHERE patient_id = (
      SELECT username FROM user_profiles 
      WHERE id = auth.uid()
    )
  )
);

-- Medical staff can view all drug administration records
CREATE POLICY "Medical staff can view drug administration" ON drug_administration 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'pharmacist')
  )
);

-- Nurses and pharmacists can manage drug administration
CREATE POLICY "Nurses can manage drug administration" ON drug_administration 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'nurse', 'pharmacist')
  )
);

-- =============================================
-- MEDICAL_REPORTS TABLE POLICIES
-- =============================================

-- Patients can view their own medical reports
CREATE POLICY "Patients can view own medical reports" ON medical_reports 
FOR SELECT USING (
  patient_id IN (
    SELECT id FROM patients 
    WHERE patient_id = (
      SELECT username FROM user_profiles 
      WHERE id = auth.uid()
    )
  )
);

-- Medical staff can view all medical reports
CREATE POLICY "Medical staff can view medical reports" ON medical_reports 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'receptionist')
  )
);

-- Medical staff can manage medical reports
CREATE POLICY "Medical staff can manage medical reports" ON medical_reports 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'receptionist')
  )
);

-- =============================================
-- EXPERT_SYSTEM_RULES TABLE POLICIES
-- =============================================

-- Everyone can view expert system rules (for diagnosis)
CREATE POLICY "Everyone can view expert system rules" ON expert_system_rules 
FOR SELECT USING (true);

-- Only admins can manage expert system rules
CREATE POLICY "Admins can manage expert system rules" ON expert_system_rules 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =============================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is medical staff
CREATE OR REPLACE FUNCTION is_medical_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'doctor', 'nurse', 'receptionist')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is doctor
CREATE OR REPLACE FUNCTION is_doctor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'doctor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is pharmacist
CREATE OR REPLACE FUNCTION is_pharmacist()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'pharmacist')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's patient ID
CREATE OR REPLACE FUNCTION get_user_patient_id()
RETURNS UUID AS $$
DECLARE
  patient_id UUID;
BEGIN
  SELECT p.id INTO patient_id
  FROM patients p
  JOIN user_profiles up ON p.patient_id = up.username
  WHERE up.id = auth.uid();
  
  RETURN patient_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient_id ON diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_doctor_id ON diagnoses(doctor_id);
CREATE INDEX IF NOT EXISTS idx_treatments_patient_id ON treatments(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_drug_administration_patient_id ON drug_administration(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_reports_patient_id ON medical_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);

-- =============================================
-- AUDIT TRIGGERS (Optional)
-- =============================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  record_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    table_name,
    operation,
    record_id,
    old_values,
    new_values,
    user_id
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END,
    auth.uid()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
-- DROP TRIGGER IF EXISTS audit_patients ON patients;
-- CREATE TRIGGER audit_patients
--   AFTER INSERT OR UPDATE OR DELETE ON patients
--   FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- DROP TRIGGER IF EXISTS audit_appointments ON appointments;
-- CREATE TRIGGER audit_appointments
--   AFTER INSERT OR UPDATE OR DELETE ON appointments
--   FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- DROP TRIGGER IF EXISTS audit_diagnoses ON diagnoses;
-- CREATE TRIGGER audit_diagnoses
--   AFTER INSERT OR UPDATE OR DELETE ON diagnoses
--   FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- DROP TRIGGER IF EXISTS audit_prescriptions ON prescriptions;
-- CREATE TRIGGER audit_prescriptions
--   AFTER INSERT OR UPDATE OR DELETE ON prescriptions
--   FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
