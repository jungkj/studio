import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './supabaseTypes';

// Supabase configuration interface
interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

// Get Supabase configuration from environment variables
const getSupabaseConfig = (): SupabaseConfig => {
  // For development, provide fallback values
  const config: SupabaseConfig = {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://qzxbinrlrzbfnqiuccon.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6eGJpbnJscnpiZm5xaXVjY29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNjgxOTUsImV4cCI6MjA2Njg0NDE5NX0.Ad_UHirGqj0zn5rF7sWU0cHvVRwb0dtNwtEI76UEocY',
    serviceRoleKey: import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  // Validate required configuration
  if (!config.url || !config.anonKey) {
    throw new Error('Missing required Supabase configuration. Please check your environment variables.');
  }

  return config;
};

// Create Supabase client instances
let supabaseClient: SupabaseClient<Database> | null = null;
let supabaseServiceClient: SupabaseClient<Database> | null = null;

// Get public Supabase client (with anon key)
export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (!supabaseClient) {
    const config = getSupabaseConfig();
    
    supabaseClient = createClient<Database>(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
  }
  
  return supabaseClient;
};

// Get service role client (for admin operations)
export const getSupabaseServiceClient = (): SupabaseClient<Database> => {
  if (!supabaseServiceClient) {
    const config = getSupabaseConfig();
    
    if (!config.serviceRoleKey) {
      throw new Error('Service role key not available. Admin operations not permitted.');
    }
    
    supabaseServiceClient = createClient<Database>(config.url, config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });
  }
  
  return supabaseServiceClient;
};

// Export configuration for debugging/logging
export const logSupabaseConfig = (): void => {
  const config = getSupabaseConfig();
  console.log('🗄️ Supabase Configuration:');
  console.log('🗄️ URL:', config.url);
  console.log('🗄️ Has Anon Key:', !!config.anonKey);
  console.log('🗄️ Has Service Role Key:', !!config.serviceRoleKey);
  console.log('🗄️ Anon Key Preview:', config.anonKey ? `${config.anonKey.substring(0, 20)}...` : 'Not set');
};

// Health check function
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.from('projects').select('count').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "table not found" which is ok for initial setup
      console.error('🗄️ Supabase connection error:', error);
      return false;
    }
    
    console.log('🗄️ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('🗄️ Supabase connection failed:', error);
    return false;
  }
};

// Export the main client as default
export default getSupabaseClient; 