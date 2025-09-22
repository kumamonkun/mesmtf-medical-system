import { z } from 'zod';

// Patient validation schemas
export const patientSchema = z.object({
  patient_id: z.string()
    .min(1, 'Patient ID is required')
    .max(20, 'Patient ID must be less than 20 characters')
    .regex(/^[A-Z0-9-]+$/, 'Patient ID must contain only uppercase letters, numbers, and hyphens'),
  first_name: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  last_name: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  date_of_birth: z.string()
    .date('Invalid date format')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 150;
    }, 'Invalid birth date'),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Gender must be male, female, or other' })
  }),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits')
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Invalid phone number format'),
  email: z.string()
    .email('Invalid email format')
    .max(100, 'Email must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  address: z.string()
    .min(1, 'Address is required')
    .max(200, 'Address must be less than 200 characters'),
  emergency_contact_name: z.string()
    .min(1, 'Emergency contact name is required')
    .max(100, 'Emergency contact name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Emergency contact name can only contain letters, spaces, hyphens, and apostrophes'),
  emergency_contact_phone: z.string()
    .min(10, 'Emergency contact phone must be at least 10 digits')
    .max(15, 'Emergency contact phone must be less than 15 digits')
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, 'Invalid emergency contact phone format'),
  medical_history: z.string()
    .max(1000, 'Medical history must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  allergies: z.string()
    .max(500, 'Allergies must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
    errorMap: () => ({ message: 'Invalid blood type' })
  }).optional(),
  chronic_conditions: z.string()
    .max(500, 'Chronic conditions must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['active', 'inactive', 'critical'], {
    errorMap: () => ({ message: 'Status must be active, inactive, or critical' })
  }).optional()
});

// Patient update schema (all fields optional)
export const patientUpdateSchema = patientSchema.partial();

// Patient search schema
export const patientSearchSchema = z.object({
  q: z.string().max(100, 'Search term must be less than 100 characters').optional(),
  status: z.enum(['active', 'inactive', 'critical']).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  age_min: z.string().regex(/^\d+$/, 'Age must be a number').optional(),
  age_max: z.string().regex(/^\d+$/, 'Age must be a number').optional(),
  has_allergies: z.enum(['true', 'false']).optional(),
  has_chronic_conditions: z.enum(['true', 'false']).optional(),
  sort_by: z.enum(['created_at', 'first_name', 'last_name', 'patient_id', 'date_of_birth']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional()
});

// Patient filters schema
export const patientFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  gender: z.string().optional(),
  bloodType: z.string().optional(),
  ageMin: z.number().min(0).max(150).optional(),
  ageMax: z.number().min(0).max(150).optional(),
  hasAllergies: z.boolean().optional(),
  hasChronicConditions: z.boolean().optional()
});

// Patient pagination schema
export const patientPaginationSchema = z.object({
  page: z.number().min(1, 'Page must be at least 1'),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100')
});

// Patient ID validation
export const patientIdSchema = z.string().uuid('Invalid patient ID format');

// Patient creation response schema
export const patientResponseSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  date_of_birth: z.string(),
  gender: z.string(),
  phone: z.string(),
  email: z.string().nullable(),
  address: z.string(),
  emergency_contact_name: z.string(),
  emergency_contact_phone: z.string(),
  medical_history: z.string().nullable(),
  allergies: z.string().nullable(),
  blood_type: z.string().nullable(),
  chronic_conditions: z.string().nullable(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.string().uuid()
});

// Patient list response schema
export const patientListResponseSchema = z.object({
  patients: z.array(patientResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number()
  })
});

// Patient search response schema
export const patientSearchResponseSchema = z.object({
  patients: z.array(patientResponseSchema.extend({ age: z.number() })),
  total: z.number(),
  filters: z.record(z.any())
});

// Error response schema
export const errorResponseSchema = z.object({
  error: z.string(),
  details: z.array(z.object({
    field: z.string(),
    message: z.string()
  })).optional()
});

// Validation helper functions
export function validatePatientData(data: any) {
  return patientSchema.parse(data);
}

export function validatePatientUpdate(data: any) {
  return patientUpdateSchema.parse(data);
}

export function validatePatientSearch(data: any) {
  return patientSearchSchema.parse(data);
}

export function validatePatientFilters(data: any) {
  return patientFiltersSchema.parse(data);
}

export function validatePatientPagination(data: any) {
  return patientPaginationSchema.parse(data);
}

export function validatePatientId(id: string) {
  return patientIdSchema.parse(id);
}

// Custom validation functions
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePatientIdFormat(patientId: string): boolean {
  const patientIdRegex = /^[A-Z0-9-]+$/;
  return patientIdRegex.test(patientId) && patientId.length <= 20;
}

export function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Format based on length
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  return phone; // Return original if can't format
}

export function generatePatientId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `P-${year}-${random}`;
}
