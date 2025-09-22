import { createClient } from '@/lib/supabase/server';

export interface UserProfileFilters {
  role?: string;
  search?: string;
  isActive?: boolean;
}

export interface UserProfilePagination {
  page: number;
  limit: number;
}

export class UserProfileService {
  private supabase = createClient();

  /**
   * Get all user profiles with optional filtering and pagination
   */
  async getUserProfiles(filters: UserProfileFilters = {}, pagination: UserProfilePagination = { page: 1, limit: 10 }) {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .from('user_profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.role) {
      query = query.eq('role', filters.role);
    }

    if (filters.search) {
      query = query.or(`
        first_name.ilike.%${filters.search}%,
        last_name.ilike.%${filters.search}%,
        username.ilike.%${filters.search}%,
        email.ilike.%${filters.search}%
      `);
    }

    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: profiles, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch user profiles: ${error.message}`);
    }

    return {
      profiles: profiles || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Get user profile by ID
   */
  async getUserProfileById(id: string) {
    const { data: profile, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('User profile not found');
      }
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    return profile;
  }

  /**
   * Get current user profile (by auth user ID)
   */
  async getCurrentUserProfile(userId: string) {
    const { data: profile, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist, create a default one
        return this.createDefaultProfile(userId);
      }
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }

    return profile;
  }

  /**
   * Create default profile for new user
   */
  async createDefaultProfile(userId: string, email?: string) {
    const defaultProfile = {
      id: userId,
      email: email || '',
      username: email?.split('@')[0] || 'user',
      first_name: '',
      last_name: '',
      phone: '',
      address: '',
      bio: '',
      role: 'patient',
      avatar_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: newProfile, error } = await this.supabase
      .from('user_profiles')
      .insert(defaultProfile)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create default profile: ${error.message}`);
    }

    return newProfile;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(id: string, updateData: any) {
    // Check if username is being changed and if it's already taken
    if (updateData.username) {
      const { data: existingProfile } = await this.supabase
        .from('user_profiles')
        .select('id')
        .eq('username', updateData.username)
        .neq('id', id)
        .single();

      if (existingProfile) {
        throw new Error('Username already taken');
      }
    }

    const { data: updatedProfile, error } = await this.supabase
      .from('user_profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('User profile not found');
      }
      throw new Error(`Failed to update user profile: ${error.message}`);
    }

    return updatedProfile;
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(id: string, role: string, updatedBy: string) {
    // Check if the user updating has admin role
    const { data: updaterProfile } = await this.supabase
      .from('user_profiles')
      .select('role')
      .eq('id', updatedBy)
      .single();

    if (!updaterProfile || updaterProfile.role !== 'admin') {
      throw new Error('Insufficient permissions to update user role');
    }

    const validRoles = ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'patient'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role');
    }

    const { data: updatedProfile, error } = await this.supabase
      .from('user_profiles')
      .update({
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('User profile not found');
      }
      throw new Error(`Failed to update user role: ${error.message}`);
    }

    return updatedProfile;
  }

  /**
   * Deactivate user profile
   */
  async deactivateUserProfile(id: string, deactivatedBy: string) {
    const { data: updatedProfile, error } = await this.supabase
      .from('user_profiles')
      .update({
        is_active: false,
        deactivated_at: new Date().toISOString(),
        deactivated_by: deactivatedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('User profile not found');
      }
      throw new Error(`Failed to deactivate user profile: ${error.message}`);
    }

    return updatedProfile;
  }

  /**
   * Reactivate user profile
   */
  async reactivateUserProfile(id: string, reactivatedBy: string) {
    const { data: updatedProfile, error } = await this.supabase
      .from('user_profiles')
      .update({
        is_active: true,
        reactivated_at: new Date().toISOString(),
        reactivated_by: reactivatedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('User profile not found');
      }
      throw new Error(`Failed to reactivate user profile: ${error.message}`);
    }

    return updatedProfile;
  }

  /**
   * Search user profiles
   */
  async searchUserProfiles(searchTerm: string, filters: UserProfileFilters = {}) {
    const searchFilters = {
      ...filters,
      search: searchTerm
    };

    return this.getUserProfiles(searchFilters, { page: 1, limit: 50 });
  }

  /**
   * Get user profile statistics
   */
  async getUserProfileStats() {
    const [
      totalUsers,
      activeUsers,
      usersByRole,
      newUsersThisMonth
    ] = await Promise.all([
      this.supabase.from('user_profiles').select('id', { count: 'exact' }),
      this.supabase.from('user_profiles').select('id', { count: 'exact' }).eq('is_active', true),
      this.supabase.from('user_profiles').select('role', { count: 'exact' }).eq('is_active', true),
      this.supabase
        .from('user_profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    ]);

    // Group users by role
    const roleStats = usersByRole.reduce((acc: any, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    return {
      total: totalUsers.count || 0,
      active: activeUsers.count || 0,
      inactive: (totalUsers.count || 0) - (activeUsers.count || 0),
      newThisMonth: newUsersThisMonth.count || 0,
      byRole: roleStats
    };
  }

  /**
   * Get available roles
   */
  getAvailableRoles() {
    return [
      { value: 'admin', label: 'Administrator', description: 'Full system access' },
      { value: 'doctor', label: 'Doctor', description: 'Medical diagnosis and treatment' },
      { value: 'nurse', label: 'Nurse', description: 'Patient care and assistance' },
      { value: 'receptionist', label: 'Receptionist', description: 'Appointment and patient management' },
      { value: 'pharmacist', label: 'Pharmacist', description: 'Pharmacy and prescription management' },
      { value: 'patient', label: 'Patient', description: 'Patient portal access' }
    ];
  }

  /**
   * Check if user has permission for specific action
   */
  async checkUserPermission(userId: string, action: string, resource?: string) {
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('role, is_active')
      .eq('id', userId)
      .single();

    if (!profile || !profile.is_active) {
      return false;
    }

    const permissions = {
      admin: ['*'], // Admin has all permissions
      doctor: ['read:patients', 'write:patients', 'read:appointments', 'write:appointments', 'read:diagnoses', 'write:diagnoses', 'read:treatments', 'write:treatments'],
      nurse: ['read:patients', 'write:patients', 'read:appointments', 'write:appointments', 'read:treatments', 'write:treatments'],
      receptionist: ['read:patients', 'write:patients', 'read:appointments', 'write:appointments'],
      pharmacist: ['read:patients', 'read:prescriptions', 'write:prescriptions', 'read:drugs', 'write:drugs'],
      patient: ['read:own:profile', 'write:own:profile', 'read:own:appointments', 'read:own:diagnoses']
    };

    const userPermissions = permissions[profile.role as keyof typeof permissions] || [];
    
    if (userPermissions.includes('*')) {
      return true;
    }

    if (resource && userPermissions.includes(`read:${resource}`)) {
      return true;
    }

    if (userPermissions.includes(action)) {
      return true;
    }

    return false;
  }
}
