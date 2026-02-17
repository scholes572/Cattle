// Re-export all Supabase API functions
// The actual implementation is in supabase.ts
export { cattleApi, milkApi, authApi, activityApi, dataApi, supabase, getAuthToken } from './supabase';
export type { ApiResponse } from './supabase';
