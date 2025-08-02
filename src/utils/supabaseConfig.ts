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
  const config: SupabaseConfig = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  // During build time, we might not have env vars yet
  if (typeof window === 'undefined' && (!config.url || !config.anonKey)) {
    console.warn('Supabase configuration missing during build. Using placeholder values.');
    return {
      url: 'https://placeholder.supabase.co',
      anonKey: 'placeholder-key',
      serviceRoleKey: undefined,
    };
  }

  // Validate required configuration for runtime
  if (!config.url || !config.anonKey) {
    console.error('Missing required Supabase configuration. Please check your environment variables.');
    // Return placeholder to prevent app crash
    return {
      url: 'https://placeholder.supabase.co',
      anonKey: 'placeholder-key',
      serviceRoleKey: undefined,
    };
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
      },
      global: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
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
      },
      global: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
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
    // Check essays table since that's what we're trying to load
    const { data, error } = await client.from('essays').select('count').limit(1);
    
    if (error) {
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