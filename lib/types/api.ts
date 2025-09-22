// Enhanced type definitions for the medical system API

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SearchParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Medical Records
export interface MedicalRecord {
  id: string;
  patient_id: string;
  record_type: MedicalRecordType;
  title: string;
  description: string;
  content?: string;
  diagnosis_id?: string;
  treatment_id?: string;
  prescription_id?: string;
  visit_date: string;
  doctor_id?: string;
  department?: string;
  priority?: Priority;
  status: RecordStatus;
  tags?: string[];
  attachments?: string[];
  follow_up_required?: boolean;
  follow_up_date?: string;
  notes?: string;
  confidential?: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Relations
  patient?: Patient;
  doctor?: Doctor;
  diagnosis?: Diagnosis;
  treatment?: Treatment;
  prescription?: Prescription;
  created_by_user?: UserProfile;
}

export type MedicalRecordType = 
  | 'consultation' 
  | 'diagnosis' 
  | 'treatment' 
  | 'lab_result' 
  | 'imaging' 
  | 'prescription' 
  | 'vaccination' 
  | 'surgery' 
  | 'emergency' 
  | 'follow_up' 
  | 'other';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type RecordStatus = 'draft' | 'active' | 'archived' | 'deleted';

// Patients
export interface Patient {
  id: string;
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: Gender;
  phone: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  blood_type?: BloodType;
  medical_history?: string[];
  allergies?: string[];
  chronic_conditions?: string[];
  status: PatientStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type Gender = 'male' | 'female' | 'other';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type PatientStatus = 'active' | 'inactive' | 'critical';

// Doctors
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email?: string;
  license_number?: string;
  department?: string;
  status: DoctorStatus;
  created_at: string;
  updated_at: string;
}

export type DoctorStatus = 'active' | 'inactive' | 'on_leave';

// Diagnoses
export interface Diagnosis {
  id: string;
  patient_id: string;
  diagnosis: string;
  symptoms: string[];
  confidence_level?: number;
  notes?: string;
  doctor_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Treatments
export interface Treatment {
  id: string;
  patient_id: string;
  treatment_name: string;
  description: string;
  status: TreatmentStatus;
  start_date: string;
  end_date?: string;
  doctor_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type TreatmentStatus = 'planned' | 'ongoing' | 'completed' | 'cancelled';

// Prescriptions
export interface Prescription {
  id: string;
  patient_id: string;
  drug_id: string;
  dosage: string;
  frequency: string;
  instructions: string;
  status: PrescriptionStatus;
  start_date: string;
  end_date?: string;
  doctor_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type PrescriptionStatus = 'active' | 'completed' | 'cancelled' | 'expired';

// User Profiles
export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  email?: string;
  department?: string;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'patient';
export type UserStatus = 'active' | 'inactive' | 'suspended';

// API Request/Response Types
export interface CreateMedicalRecordRequest {
  patient_id: string;
  record_type: MedicalRecordType;
  title: string;
  description: string;
  content?: string;
  diagnosis_id?: string;
  treatment_id?: string;
  prescription_id?: string;
  visit_date: string;
  doctor_id?: string;
  department?: string;
  priority?: Priority;
  status?: RecordStatus;
  tags?: string[];
  attachments?: string[];
  follow_up_required?: boolean;
  follow_up_date?: string;
  notes?: string;
  confidential?: boolean;
}

export interface UpdateMedicalRecordRequest extends Partial<CreateMedicalRecordRequest> {
  id: string;
}

export interface MedicalRecordsListResponse {
  medicalRecords: MedicalRecord[];
  pagination: PaginationInfo;
}

// Error Types
export interface ApiError {
  success: false;
  error: string;
  details?: any;
}

// Form Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Search and Filter Types
export interface MedicalRecordFilters {
  patient_id?: string;
  record_type?: MedicalRecordType;
  doctor_id?: string;
  department?: string;
  priority?: Priority;
  status?: RecordStatus;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface PatientFilters {
  gender?: Gender;
  blood_type?: BloodType;
  status?: PatientStatus;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// Dashboard Analytics Types
export interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  totalDiagnoses: number;
  totalTreatments: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'patient_created' | 'appointment_scheduled' | 'diagnosis_made' | 'treatment_started';
  description: string;
  timestamp: string;
  user_id: string;
  user_name: string;
}

// Export/Import Types
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  dateRange?: {
    from: string;
    to: string;
  };
  filters?: MedicalRecordFilters | PatientFilters;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}
