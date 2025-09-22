import { z } from 'zod';

// Appointment validation schemas
export const appointmentSchema = z.object({
  patient_id: z.string()
    .uuid('Invalid patient ID format'),
  doctor_id: z.string()
    .uuid('Invalid doctor ID format'),
  appointment_date: z.string()
    .datetime('Invalid appointment date format')
    .refine((date) => {
      const appointmentDate = new Date(date);
      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(now.getFullYear() + 1);
      
      return appointmentDate >= now && appointmentDate <= oneYearFromNow;
    }, 'Appointment date must be in the future and within one year'),
  reason: z.string()
    .min(1, 'Reason is required')
    .max(500, 'Reason must be less than 500 characters'),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(240, 'Duration cannot exceed 4 hours')
    .optional(),
  type: z.enum(['consultation', 'follow_up', 'emergency', 'routine'], {
    errorMap: () => ({ message: 'Type must be consultation, follow_up, emergency, or routine' })
  }).optional(),
  room: z.string()
    .max(50, 'Room must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'], {
    errorMap: () => ({ message: 'Invalid status' })
  }).optional()
});

// Appointment update schema (all fields optional)
export const appointmentUpdateSchema = appointmentSchema.partial();

// Appointment search schema
export const appointmentSearchSchema = z.object({
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
  date: z.string().date('Invalid date format').optional(),
  doctor_id: z.string().uuid('Invalid doctor ID format').optional(),
  patient_id: z.string().uuid('Invalid patient ID format').optional(),
  type: z.enum(['consultation', 'follow_up', 'emergency', 'routine']).optional(),
  sort_by: z.enum(['appointment_date', 'created_at', 'status']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional()
});

// Appointment filters schema
export const appointmentFiltersSchema = z.object({
  status: z.string().optional(),
  date: z.string().optional(),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
  type: z.string().optional()
});

// Appointment pagination schema
export const appointmentPaginationSchema = z.object({
  page: z.number().min(1, 'Page must be at least 1'),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100')
});

// Appointment ID validation
export const appointmentIdSchema = z.string().uuid('Invalid appointment ID format');

// Appointment status update schema
export const appointmentStatusUpdateSchema = z.object({
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'], {
    errorMap: () => ({ message: 'Invalid status' })
  }),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
});

// Appointment reschedule schema
export const appointmentRescheduleSchema = z.object({
  appointment_date: z.string()
    .datetime('Invalid appointment date format')
    .refine((date) => {
      const appointmentDate = new Date(date);
      const now = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(now.getFullYear() + 1);
      
      return appointmentDate >= now && appointmentDate <= oneYearFromNow;
    }, 'Appointment date must be in the future and within one year'),
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(240, 'Duration cannot exceed 4 hours')
    .optional(),
  reason: z.string()
    .max(500, 'Reason must be less than 500 characters')
    .optional()
});

// Available slots request schema
export const availableSlotsSchema = z.object({
  doctor_id: z.string().uuid('Invalid doctor ID format'),
  date: z.string().date('Invalid date format'),
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(240, 'Duration cannot exceed 4 hours')
    .optional()
});

// Appointment response schema
export const appointmentResponseSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  doctor_id: z.string().uuid(),
  appointment_date: z.string(),
  reason: z.string(),
  notes: z.string().nullable(),
  duration: z.number(),
  type: z.string().nullable(),
  room: z.string().nullable(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.string().uuid(),
  cancelled_at: z.string().nullable(),
  cancelled_by: z.string().uuid().nullable(),
  patient: z.object({
    id: z.string().uuid(),
    patient_id: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    phone: z.string(),
    email: z.string().nullable()
  }).optional(),
  doctor: z.object({
    id: z.string().uuid(),
    name: z.string(),
    specialty: z.string(),
    phone: z.string()
  }).optional()
});

// Appointment list response schema
export const appointmentListResponseSchema = z.object({
  appointments: z.array(appointmentResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number()
  })
});

// Available slots response schema
export const availableSlotsResponseSchema = z.object({
  slots: z.array(z.object({
    start: z.string(),
    end: z.string(),
    time: z.string()
  })),
  doctor_id: z.string(),
  date: z.string(),
  duration: z.number()
});

// Appointment statistics response schema
export const appointmentStatsResponseSchema = z.object({
  total: z.number(),
  scheduled: z.number(),
  completed: z.number(),
  cancelled: z.number(),
  today: z.number()
});

// Validation helper functions
export function validateAppointmentData(data: any) {
  return appointmentSchema.parse(data);
}

export function validateAppointmentUpdate(data: any) {
  return appointmentUpdateSchema.parse(data);
}

export function validateAppointmentSearch(data: any) {
  return appointmentSearchSchema.parse(data);
}

export function validateAppointmentFilters(data: any) {
  return appointmentFiltersSchema.parse(data);
}

export function validateAppointmentPagination(data: any) {
  return appointmentPaginationSchema.parse(data);
}

export function validateAppointmentId(id: string) {
  return appointmentIdSchema.parse(id);
}

export function validateAppointmentStatusUpdate(data: any) {
  return appointmentStatusUpdateSchema.parse(data);
}

export function validateAppointmentReschedule(data: any) {
  return appointmentRescheduleSchema.parse(data);
}

export function validateAvailableSlotsRequest(data: any) {
  return availableSlotsSchema.parse(data);
}

// Custom validation functions
export function validateAppointmentTime(appointmentDate: string, duration: number = 30): boolean {
  const appointment = new Date(appointmentDate);
  const now = new Date();
  
  // Check if appointment is in the future
  if (appointment <= now) {
    return false;
  }
  
  // Check if appointment is within business hours (8 AM - 6 PM)
  const hour = appointment.getHours();
  if (hour < 8 || hour > 18) {
    return false;
  }
  
  // Check if appointment end time is within business hours
  const endTime = new Date(appointment.getTime() + duration * 60000);
  const endHour = endTime.getHours();
  if (endHour > 18) {
    return false;
  }
  
  return true;
}

export function validateAppointmentDuration(duration: number): boolean {
  return duration >= 15 && duration <= 240;
}

export function validateAppointmentDate(date: string): boolean {
  const appointmentDate = new Date(date);
  const now = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(now.getFullYear() + 1);
  
  return appointmentDate >= now && appointmentDate <= oneYearFromNow;
}

export function formatAppointmentTime(date: string): string {
  const appointmentDate = new Date(date);
  return appointmentDate.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getAppointmentStatusColor(status: string): string {
  const statusColors = {
    scheduled: 'blue',
    confirmed: 'green',
    in_progress: 'yellow',
    completed: 'green',
    cancelled: 'red',
    no_show: 'red'
  };
  
  return statusColors[status as keyof typeof statusColors] || 'gray';
}

export function getAppointmentTypeLabel(type: string): string {
  const typeLabels = {
    consultation: 'Consultation',
    follow_up: 'Follow-up',
    emergency: 'Emergency',
    routine: 'Routine'
  };
  
  return typeLabels[type as keyof typeof typeLabels] || type;
}

export function calculateAppointmentEndTime(startTime: string, duration: number): string {
  const start = new Date(startTime);
  const end = new Date(start.getTime() + duration * 60000);
  return end.toISOString();
}

export function isAppointmentInPast(appointmentDate: string): boolean {
  const appointment = new Date(appointmentDate);
  const now = new Date();
  return appointment < now;
}

export function isAppointmentToday(appointmentDate: string): boolean {
  const appointment = new Date(appointmentDate);
  const today = new Date();
  return appointment.toDateString() === today.toDateString();
}

export function getAppointmentDurationLabel(duration: number): string {
  if (duration < 60) {
    return `${duration} minutes`;
  } else {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (minutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`;
    }
  }
}
