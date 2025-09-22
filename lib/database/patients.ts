import { createClient } from '@/lib/supabase/server';

export interface PatientFilters {
  search?: string;
  status?: string;
  gender?: string;
  bloodType?: string;
  ageMin?: number;
  ageMax?: number;
  hasAllergies?: boolean;
  hasChronicConditions?: boolean;
}

export interface PatientPagination {
  page: number;
  limit: number;
}

export class PatientService {
  private supabase = createClient();

  /**
   * Get all patients with optional filtering and pagination
   */
  async getPatients(filters: PatientFilters = {}, pagination: PatientPagination = { page: 1, limit: 10 }) {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.search) {
      query = query.or(`
        first_name.ilike.%${filters.search}%,
        last_name.ilike.%${filters.search}%,
        patient_id.ilike.%${filters.search}%,
        phone.ilike.%${filters.search}%,
        email.ilike.%${filters.search}%
      `);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.gender) {
      query = query.eq('gender', filters.gender);
    }

    if (filters.bloodType) {
      query = query.eq('blood_type', filters.bloodType);
    }

    if (filters.hasAllergies === true) {
      query = query.not('allergies', 'is', null).neq('allergies', '');
    } else if (filters.hasAllergies === false) {
      query = query.or('allergies.is.null,allergies.eq.');
    }

    if (filters.hasChronicConditions === true) {
      query = query.not('chronic_conditions', 'is', null).neq('chronic_conditions', '');
    } else if (filters.hasChronicConditions === false) {
      query = query.or('chronic_conditions.is.null,chronic_conditions.eq.');
    }

    // Apply age filters
    if (filters.ageMin || filters.ageMax) {
      const currentDate = new Date();
      
      if (filters.ageMax) {
        const minBirthDate = new Date(
          currentDate.getFullYear() - filters.ageMax, 
          currentDate.getMonth(), 
          currentDate.getDate()
        );
        query = query.gte('date_of_birth', minBirthDate.toISOString().split('T')[0]);
      }
      
      if (filters.ageMin) {
        const maxBirthDate = new Date(
          currentDate.getFullYear() - filters.ageMin, 
          currentDate.getMonth(), 
          currentDate.getDate()
        );
        query = query.lte('date_of_birth', maxBirthDate.toISOString().split('T')[0]);
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: patients, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch patients: ${error.message}`);
    }

    return {
      patients: patients || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Get patient by ID
   */
  async getPatientById(id: string) {
    const { data: patient, error } = await this.supabase
      .from('patients')
      .select(`
        *,
        created_by_user:user_profiles!patients_created_by_fkey(
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
        throw new Error('Patient not found');
      }
      throw new Error(`Failed to fetch patient: ${error.message}`);
    }

    return patient;
  }

  /**
   * Create new patient
   */
  async createPatient(patientData: any, createdBy: string) {
    // Check if patient ID already exists
    const { data: existingPatient } = await this.supabase
      .from('patients')
      .select('id')
      .eq('patient_id', patientData.patient_id)
      .single();

    if (existingPatient) {
      throw new Error('Patient ID already exists');
    }

    const { data: newPatient, error } = await this.supabase
      .from('patients')
      .insert({
        ...patientData,
        created_by: createdBy,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create patient: ${error.message}`);
    }

    return newPatient;
  }

  /**
   * Update patient
   */
  async updatePatient(id: string, updateData: any) {
    const { data: updatedPatient, error } = await this.supabase
      .from('patients')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Patient not found');
      }
      throw new Error(`Failed to update patient: ${error.message}`);
    }

    return updatedPatient;
  }

  /**
   * Delete patient (soft delete by updating status)
   */
  async deletePatient(id: string) {
    // Check if patient has related records
    const { data: relatedRecords } = await this.supabase
      .from('appointments')
      .select('id')
      .eq('patient_id', id)
      .limit(1);

    if (relatedRecords && relatedRecords.length > 0) {
      throw new Error('Cannot delete patient with existing appointments. Please deactivate instead.');
    }

    const { error } = await this.supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete patient: ${error.message}`);
    }

    return { message: 'Patient deleted successfully' };
  }

  /**
   * Get patient medical history
   */
  async getPatientMedicalHistory(patientId: string) {
    const { data: history, error } = await this.supabase
      .from('diagnoses')
      .select(`
        *,
        doctor:doctors!diagnoses_doctor_id_fkey(
          id,
          name,
          specialty
        )
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch medical history: ${error.message}`);
    }

    return history || [];
  }

  /**
   * Search patients with advanced filters
   */
  async searchPatients(searchTerm: string, filters: PatientFilters = {}) {
    const searchFilters = {
      ...filters,
      search: searchTerm
    };

    return this.getPatients(searchFilters, { page: 1, limit: 50 });
  }

  /**
   * Get patient statistics
   */
  async getPatientStats() {
    const [
      totalPatients,
      activePatients,
      criticalPatients,
      newPatientsThisMonth
    ] = await Promise.all([
      this.supabase.from('patients').select('id', { count: 'exact' }),
      this.supabase.from('patients').select('id', { count: 'exact' }).eq('status', 'active'),
      this.supabase.from('patients').select('id', { count: 'exact' }).eq('status', 'critical'),
      this.supabase
        .from('patients')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    ]);

    return {
      total: totalPatients.count || 0,
      active: activePatients.count || 0,
      critical: criticalPatients.count || 0,
      newThisMonth: newPatientsThisMonth.count || 0
    };
  }
}
