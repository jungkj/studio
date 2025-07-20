import { getSupabaseClient } from './supabaseConfig';

class SpotifyTokenService {
  private static instance: SpotifyTokenService;

  private constructor() {}

  public static getInstance(): SpotifyTokenService {
    if (!SpotifyTokenService.instance) {
      SpotifyTokenService.instance = new SpotifyTokenService();
    }
    return SpotifyTokenService.instance;
  }

  /**
   * Store the Spotify refresh token in Supabase (admin only)
   */
  async storeRefreshToken(refreshToken: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('spotify_tokens')
        .upsert({
          user_id: user.id,
          refresh_token: refreshToken,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error storing refresh token:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error in storeRefreshToken:', error);
      return { success: false, error: 'Failed to store refresh token' };
    }
  }

  /**
   * Get the admin's Spotify refresh token (public access)
   */
  async getAdminRefreshToken(): Promise<string | null> {
    try {
      const supabase = getSupabaseClient();
      // Get the admin user's refresh token
      // You'll need to replace this with your actual admin user ID
      const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID;
      
      if (!ADMIN_USER_ID) {
        // Fallback: get the first (and likely only) token
        const { data, error } = await supabase
          .from('spotify_tokens')
          .select('refresh_token')
          .limit(1)
          .single();

        if (error || !data) {
          console.error('Error getting refresh token:', error);
          return null;
        }

        return data.refresh_token;
      }

      const { data, error } = await supabase
        .from('spotify_tokens')
        .select('refresh_token')
        .eq('user_id', ADMIN_USER_ID)
        .single();

      if (error || !data) {
        console.error('Error getting admin refresh token:', error);
        return null;
      }

      return data.refresh_token;
    } catch (error) {
      console.error('Error in getAdminRefreshToken:', error);
      return null;
    }
  }

  /**
   * Check if current user has a stored refresh token
   */
  async hasRefreshToken(): Promise<boolean> {
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const { data, error } = await supabase
        .from('spotify_tokens')
        .select('id')
        .eq('user_id', user.id)
        .single();

      return !error && !!data;
    } catch (error) {
      console.error('Error checking refresh token:', error);
      return false;
    }
  }
}

export const spotifyTokenService = SpotifyTokenService.getInstance();