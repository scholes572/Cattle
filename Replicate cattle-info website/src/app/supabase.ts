import { createClient } from '@supabase/supabase-js';

// Your Supabase credentials
const supabaseUrl = 'https://rozxcpsievhwnytloagr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvenhjcHNpZXZod255dGxvYWdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzcwODcsImV4cCI6MjA4NjkxMzA4N30.0mpUkC9agrFIgyOfmsQxYug8EKhYxdNdFkOcVFqZMPg';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to get auth token
export function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

// API Response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  message?: string;
  cattle?: T;
  records?: T[];
  activities?: T[];
  data?: T;
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Log activity function
async function logActivity(userId: string, username: string, action: string, details: string) {
  const { error } = await supabase.from('activity').insert({
    id: generateId(),
    user_id: userId,
    username,
    action,
    details,
    timestamp: new Date().toISOString()
  });
  if (error) console.error('Failed to log activity:', error);
}

// ==================== Auth API ====================
export const authApi = {
  login: async (username: string, password: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();
    
    if (error || !data) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    // Generate a simple token (for localStorage)
    const token = btoa(JSON.stringify({ id: data.id, username: data.username, role: data.role }));
    
    // Log the login activity
    await logActivity(data.id, data.username, 'LOGIN', 'User logged in');
    
    return {
      success: true,
      user: { id: data.id, username: data.username, role: data.role },
      token
    };
  }
};

// ==================== Cattle API ====================
export const cattleApi = {
  getAll: async (): Promise<ApiResponse> => {
    const { data, error } = await supabase
      .from('cattle')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) return { success: false, error: error.message };
    
    // Map snake_case to camelCase for frontend
    const cattle = (data || []).map(c => ({
      id: c.id,
      tagNumber: c.tag_number,
      name: c.name,
      breed: c.breed,
      gender: c.gender,
      dateOfBirth: c.date_of_birth,
      weight: c.weight,
      color: c.color,
      status: c.status,
      sire: c.sire,
      dam: c.dam,
      notes: c.notes,
      imageUrl: c.image_url,
      imagePath: c.image_path,
      createdAt: c.created_at,
      updatedAt: c.updated_at
    }));
    
    return { success: true, cattle };
  },
  
  getById: async (id: string): Promise<ApiResponse> => {
    const { data, error } = await supabase
      .from('cattle')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return { success: false, error: error.message };
    
    const cattle = {
      id: data.id,
      tagNumber: data.tag_number,
      name: data.name,
      breed: data.breed,
      gender: data.gender,
      dateOfBirth: data.date_of_birth,
      weight: data.weight,
      color: data.color,
      status: data.status,
      sire: data.sire,
      dam: data.dam,
      notes: data.notes,
      imageUrl: data.image_url,
      imagePath: data.image_path,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
    return { success: true, cattle };
  },
  
  create: async (data: unknown): Promise<ApiResponse> => {
    const cattleData = data as Record<string, unknown>;
    const id = generateId();
    const now = new Date().toISOString();
    
    const { error } = await supabase.from('cattle').insert({
      id,
      tag_number: cattleData.tagNumber,
      name: cattleData.name,
      breed: cattleData.breed,
      gender: cattleData.gender,
      date_of_birth: cattleData.dateOfBirth,
      weight: cattleData.weight,
      color: cattleData.color,
      status: cattleData.status || 'active',
      sire: cattleData.sire,
      dam: cattleData.dam,
      notes: cattleData.notes,
      image_url: cattleData.imageUrl,
      image_path: cattleData.imagePath,
      created_at: now,
      updated_at: now
    });
    
    if (error) return { success: false, error: error.message };
    
    // Log activity
    const user = JSON.parse(atob(getAuthToken() || '{}'));
    if (user.id) {
      const details = [
        cattleData.breed ? `Breed: ${cattleData.breed}` : null,
        cattleData.gender ? `Gender: ${cattleData.gender}` : null,
        cattleData.dateOfBirth ? `DOB: ${cattleData.dateOfBirth}` : null,
        cattleData.weight ? `Weight: ${cattleData.weight}kg` : null,
        cattleData.status ? `Status: ${cattleData.status}` : null,
      ].filter(Boolean).join(', ');
      await logActivity(user.id, user.username, 'ADD_CATTLE', `Added new cattle: ${cattleData.name || cattleData.tagNumber} (${details})`);
    }
    
    return { success: true, cattle: { id, ...cattleData, createdAt: now, updatedAt: now } };
  },
  
  update: async (id: string, data: unknown): Promise<ApiResponse> => {
    const cattleData = data as Record<string, unknown>;
    const now = new Date().toISOString();
    
    const { error } = await supabase.from('cattle').update({
      tag_number: cattleData.tagNumber,
      name: cattleData.name,
      breed: cattleData.breed,
      gender: cattleData.gender,
      date_of_birth: cattleData.dateOfBirth,
      weight: cattleData.weight,
      color: cattleData.color,
      status: cattleData.status,
      sire: cattleData.sire,
      dam: cattleData.dam,
      notes: cattleData.notes,
      image_url: cattleData.imageUrl,
      image_path: cattleData.imagePath,
      updated_at: now
    }).eq('id', id);
    
    if (error) return { success: false, error: error.message };
    
    // Log activity
    const user = JSON.parse(atob(getAuthToken() || '{}'));
    if (user.id) {
      await logActivity(user.id, user.username, 'UPDATE_CATTLE', `Updated cattle: ${cattleData.name || cattleData.tagNumber}`);
    }
    
    return { success: true, cattle: { id, ...cattleData, updatedAt: now } };
  },
  
  delete: async (id: string): Promise<ApiResponse> => {
    // Get the cattle first for logging
    const { data: deletedCattle } = await supabase.from('cattle').select('*').eq('id', id).single();
    
    const { error } = await supabase.from('cattle').delete().eq('id', id);
    
    if (error) return { success: false, error: error.message };
    
    // Log activity
    const user = JSON.parse(atob(getAuthToken() || '{}'));
    if (user.id && deletedCattle) {
      const details = [
        deletedCattle.breed ? `Breed: ${deletedCattle.breed}` : null,
        deletedCattle.gender ? `Gender: ${deletedCattle.gender}` : null,
        deletedCattle.status ? `Status: ${deletedCattle.status}` : null,
      ].filter(Boolean).join(', ');
      await logActivity(user.id, user.username, 'DELETE_CATTLE', `Deleted cattle: ${deletedCattle.name || deletedCattle.tag_number} (${details})`);
    }
    
    return { success: true };
  }
};

// ==================== Milk API ====================
export const milkApi = {
  getAll: async (): Promise<ApiResponse> => {
    const { data, error } = await supabase
      .from('milk')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) return { success: false, error: error.message };
    
    const records = (data || []).map(m => ({
      id: m.id,
      cattleId: m.cattle_id,
      cattleName: m.cattle_name,
      cattleTagNumber: m.cattle_tag_number,
      date: m.date,
      morningLiters: m.morning_liters,
      eveningLiters: m.evening_liters,
      totalLiters: m.total_liters,
      notes: m.notes,
      createdAt: m.created_at
    }));
    
    return { success: true, records };
  },
  
  getByCattleId: async (cattleId: string): Promise<ApiResponse> => {
    const { data, error } = await supabase
      .from('milk')
      .select('*')
      .eq('cattle_id', cattleId)
      .order('date', { ascending: false });
    
    if (error) return { success: false, error: error.message };
    
    const records = (data || []).map(m => ({
      id: m.id,
      cattleId: m.cattle_id,
      cattleName: m.cattle_name,
      cattleTagNumber: m.cattle_tag_number,
      date: m.date,
      morningLiters: m.morning_liters,
      eveningLiters: m.evening_liters,
      totalLiters: m.total_liters,
      notes: m.notes,
      createdAt: m.created_at
    }));
    
    return { success: true, records };
  },
  
  create: async (data: unknown): Promise<ApiResponse> => {
    const milkData = data as Record<string, unknown>;
    const id = `milk-${generateId()}`;
    const now = new Date().toISOString();
    
    const { error } = await supabase.from('milk').insert({
      id,
      cattle_id: milkData.cattleId,
      cattle_name: milkData.cattleName,
      cattle_tag_number: milkData.cattleTagNumber,
      date: milkData.date,
      morning_liters: milkData.morningLiters,
      evening_liters: milkData.eveningLiters,
      total_liters: milkData.totalLiters,
      notes: milkData.notes,
      created_at: now
    });
    
    if (error) return { success: false, error: error.message };
    
    // Log activity
    const user = JSON.parse(atob(getAuthToken() || '{}'));
    if (user.id) {
      const cowName = milkData.cattleName || milkData.cattleTagNumber;
      const morning = milkData.morningLiters || 0;
      const evening = milkData.eveningLiters || 0;
      await logActivity(user.id, user.username, 'ADD_MILK', `Recorded milk for ${cowName}: ${morning}L (morning) + ${evening}L (evening) = ${milkData.totalLiters}L on ${milkData.date}`);
    }
    
    return { success: true, record: { id, ...milkData, createdAt: now } };
  },
  
  delete: async (id: string): Promise<ApiResponse> => {
    // Get the record first for logging
    const { data: deletedRecord } = await supabase.from('milk').select('*').eq('id', id).single();
    
    const { error } = await supabase.from('milk').delete().eq('id', id);
    
    if (error) return { success: false, error: error.message };
    
    // Log activity
    const user = JSON.parse(atob(getAuthToken() || '{}'));
    if (user.id && deletedRecord) {
      const cowName = deletedRecord.cattle_name || deletedRecord.cattle_tag_number;
      await logActivity(user.id, user.username, 'DELETE_MILK', `Deleted milk record for ${cowName}: ${deletedRecord.morning_liters}L (morning) + ${deletedRecord.evening_liters}L (evening) = ${deletedRecord.total_liters}L on ${deletedRecord.date}`);
    }
    
    return { success: true };
  }
};

// ==================== Activity API ====================
export const activityApi = {
  getAll: async (): Promise<ApiResponse> => {
    const { data, error } = await supabase
      .from('activity')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
    
    if (error) return { success: false, error: error.message };
    
    const activities = (data || []).map(a => ({
      id: a.id,
      userId: a.user_id,
      username: a.username,
      action: a.action,
      details: a.details,
      timestamp: a.timestamp
    }));
    
    return { success: true, activities };
  },
  
  clear: async (): Promise<ApiResponse> => {
    const { error } = await supabase.from('activity').delete().neq('id', '');
    if (error) return { success: false, error: error.message };
    return { success: true };
  }
};

// ==================== Export/Import Functions ====================
export const dataApi = {
  exportCattleJson: async (): Promise<{ success: boolean; data?: unknown; error?: string }> => {
    const { data, error } = await supabase.from('cattle').select('*');
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  },
  
  exportMilkJson: async (): Promise<{ success: boolean; data?: unknown; error?: string }> => {
    const { data, error } = await supabase.from('milk').select('*');
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  }
};

// ==================== Storage API for Images ====================
export const storageApi = {
  uploadImage: async (file: File, cattleId: string): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop() || 'jpg';
      const fileName = `${cattleId}-${timestamp}.${extension}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('cattle-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('cattle-images')
        .getPublicUrl(fileName);
      
      return { success: true, url: urlData.publicUrl };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: 'Failed to upload image' };
    }
  },
  
  deleteImage: async (imageUrl: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Extract filename from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      const { error } = await supabase.storage
        .from('cattle-images')
        .remove([fileName]);
      
      if (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, error: 'Failed to delete image' };
    }
  }
};
