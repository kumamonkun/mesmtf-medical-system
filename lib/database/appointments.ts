import { createClient } from '@/lib/supabase/server';

export interface AppointmentFilters {
  status?: string;
  date?: string;
  doctorId?: string;
  patientId?: string;
  type?: string;
}

export interface AppointmentPagination {
  page: number;
  limit: number;
}

export class AppointmentService {
  private supabase = createClient();

  /**
   * Get all appointments with optional filtering and pagination
   */
  async getAppointments(filters: AppointmentFilters = {}, pagination: AppointmentPagination = { page: 1, limit: 10 }) {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('appointments')
      .select(`
        *,
        patient:patients!appointments_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone,
          email
        ),
        doctor:doctors!appointments_doctor_id_fkey(
          id,
          name,
          specialty,
          phone
        )
      `, { count: 'exact' })
      .order('appointment_date', { ascending: true });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query
        .gte('appointment_date', startOfDay.toISOString())
        .lte('appointment_date', endOfDay.toISOString());
    }

    if (filters.doctorId) {
      query = query.eq('doctor_id', filters.doctorId);
    }

    if (filters.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: appointments, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch appointments: ${error.message}`);
    }

    return {
      appointments: appointments || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(id: string) {
    const { data: appointment, error } = await this.supabase
      .from('appointments')
      .select(`
        *,
        patient:patients!appointments_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone,
          email,
          date_of_birth,
          gender
        ),
        doctor:doctors!appointments_doctor_id_fkey(
          id,
          name,
          specialty,
          phone,
          email
        ),
        created_by_user:user_profiles!appointments_created_by_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Appointment not found');
      }
      throw new Error(`Failed to fetch appointment: ${error.message}`);
    }

    return appointment;
  }

  /**
   * Create new appointment
   */
  async createAppointment(appointmentData: any, createdBy: string) {
    // Check if patient exists
    const { data: patient } = await this.supabase
      .from('patients')
      .select('id')
      .eq('id', appointmentData.patient_id)
      .single();

    if (!patient) {
      throw new Error('Patient not found');
    }

    // Check if doctor exists
    const { data: doctor } = await this.supabase
      .from('doctors')
      .select('id')
      .eq('id', appointmentData.doctor_id)
      .single();

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    // Check for conflicting appointments
    const appointmentDate = new Date(appointmentData.appointment_date);
    const duration = appointmentData.duration || 30;
    const endTime = new Date(appointmentDate.getTime() + duration * 60000);

    const { data: conflictingAppointments } = await this.supabase
      .from('appointments')
      .select('id, appointment_date, duration')
      .eq('doctor_id', appointmentData.doctor_id)
      .eq('status', 'scheduled')
      .or(`and(appointment_date.lt.${endTime.toISOString()},appointment_date.gte.${appointmentDate.toISOString()})`);

    if (conflictingAppointments && conflictingAppointments.length > 0) {
      throw new Error('Doctor has a conflicting appointment at this time');
    }

    const { data: newAppointment, error } = await this.supabase
      .from('appointments')
      .insert({
        ...appointmentData,
        created_by: createdBy,
        status: 'scheduled',
        duration: duration
      })
      .select(`
        *,
        patient:patients!appointments_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone
        ),
        doctor:doctors!appointments_doctor_id_fkey(
          id,
          name,
          specialty
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create appointment: ${error.message}`);
    }

    return newAppointment;
  }

  /**
   * Update appointment
   */
  async updateAppointment(id: string, updateData: any) {
    // Check if appointment exists and can be modified
    const { data: existingAppointment } = await this.supabase
      .from('appointments')
      .select('id, status, doctor_id, appointment_date, duration')
      .eq('id', id)
      .single();

    if (!existingAppointment) {
      throw new Error('Appointment not found');
    }

    if (existingAppointment.status === 'completed' || existingAppointment.status === 'cancelled') {
      throw new Error('Cannot modify completed or cancelled appointments');
    }

    // If changing doctor or time, check for conflicts
    if (updateData.doctor_id || updateData.appointment_date) {
      const doctorId = updateData.doctor_id || existingAppointment.doctor_id;
      const appointmentDate = new Date(updateData.appointment_date || existingAppointment.appointment_date);
      const duration = updateData.duration || existingAppointment.duration || 30;
      const endTime = new Date(appointmentDate.getTime() + duration * 60000);

      const { data: conflictingAppointments } = await this.supabase
        .from('appointments')
        .select('id, appointment_date, duration')
        .eq('doctor_id', doctorId)
        .eq('status', 'scheduled')
        .neq('id', id)
        .or(`and(appointment_date.lt.${endTime.toISOString()},appointment_date.gte.${appointmentDate.toISOString()})`);

      if (conflictingAppointments && conflictingAppointments.length > 0) {
        throw new Error('Doctor has a conflicting appointment at this time');
      }
    }

    const { data: updatedAppointment, error } = await this.supabase
      .from('appointments')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        patient:patients!appointments_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone
        ),
        doctor:doctors!appointments_doctor_id_fkey(
          id,
          name,
          specialty
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update appointment: ${error.message}`);
    }

    return updatedAppointment;
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(id: string, cancelledBy: string) {
    const { data: existingAppointment } = await this.supabase
      .from('appointments')
      .select('id, status')
      .eq('id', id)
      .single();

    if (!existingAppointment) {
      throw new Error('Appointment not found');
    }

    if (existingAppointment.status === 'completed' || existingAppointment.status === 'cancelled') {
      throw new Error('Cannot cancel completed or already cancelled appointments');
    }

    const { data: cancelledAppointment, error } = await this.supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: cancelledBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to cancel appointment: ${error.message}`);
    }

    return cancelledAppointment;
  }

  /**
   * Get appointments for a specific date
   */
  async getAppointmentsByDate(date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: appointments, error } = await this.supabase
      .from('appointments')
      .select(`
        *,
        patient:patients!appointments_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone
        ),
        doctor:doctors!appointments_doctor_id_fkey(
          id,
          name,
          specialty
        )
      `)
      .gte('appointment_date', startOfDay.toISOString())
      .lte('appointment_date', endOfDay.toISOString())
      .order('appointment_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch appointments for date: ${error.message}`);
    }

    return appointments || [];
  }

  /**
   * Get available time slots for a doctor on a specific date
   */
  async getAvailableSlots(doctorId: string, date: string, duration: number = 30) {
    const startOfDay = new Date(date);
    startOfDay.setHours(8, 0, 0, 0); // Start at 8 AM
    const endOfDay = new Date(date);
    endOfDay.setHours(17, 0, 0, 0); // End at 5 PM

    // Get existing appointments for the doctor on this date
    const { data: existingAppointments } = await this.supabase
      .from('appointments')
      .select('appointment_date, duration')
      .eq('doctor_id', doctorId)
      .eq('status', 'scheduled')
      .gte('appointment_date', startOfDay.toISOString())
      .lte('appointment_date', endOfDay.toISOString())
      .order('appointment_date', { ascending: true });

    // Generate available slots
    const slots = [];
    const currentTime = new Date(startOfDay);
    
    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime.getTime() + duration * 60000);
      
      // Check if this slot conflicts with existing appointments
      const hasConflict = existingAppointments?.some(appointment => {
        const appointmentStart = new Date(appointment.appointment_date);
        const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.duration || 30) * 60000);
        
        return (currentTime < appointmentEnd && slotEnd > appointmentStart);
      });

      if (!hasConflict) {
        slots.push({
          start: currentTime.toISOString(),
          end: slotEnd.toISOString(),
          time: currentTime.toTimeString().slice(0, 5)
        });
      }

      currentTime.setMinutes(currentTime.getMinutes() + 30); // 30-minute intervals
    }

    return slots;
  }

  /**
   * Get appointment statistics
   */
  async getAppointmentStats() {
    const [
      totalAppointments,
      scheduledAppointments,
      completedAppointments,
      cancelledAppointments,
      todayAppointments
    ] = await Promise.all([
      this.supabase.from('appointments').select('id', { count: 'exact' }),
      this.supabase.from('appointments').select('id', { count: 'exact' }).eq('status', 'scheduled'),
      this.supabase.from('appointments').select('id', { count: 'exact' }).eq('status', 'completed'),
      this.supabase.from('appointments').select('id', { count: 'exact' }).eq('status', 'cancelled'),
      this.supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .gte('appointment_date', new Date().toISOString().split('T')[0])
        .lt('appointment_date', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    ]);

    return {
      total: totalAppointments.count || 0,
      scheduled: scheduledAppointments.count || 0,
      completed: completedAppointments.count || 0,
      cancelled: cancelledAppointments.count || 0,
      today: todayAppointments.count || 0
    };
  }
}
