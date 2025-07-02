import { useState, useEffect } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { getSupabaseClient } from '../utils/supabaseConfig';
import { Profile } from '../utils/supabaseTypes';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

interface AuthActions {
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithGitHub: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    isAuthenticated: false,
    isAdmin: false
  });

  const supabase = getSupabaseClient();

  // Fetch user profile
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception in fetchProfile:', error);
      return null;
    }
  };

  // Update state helper
  const updateAuthState = async (user: User | null, session: Session | null) => {
    if (user && session) {
      const profile = await fetchProfile(user.id);
      setState({
        user,
        profile,
        session,
        loading: false,
        isAuthenticated: true,
        isAdmin: profile?.is_admin || false
      });
    } else {
      setState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        isAuthenticated: false,
        isAdmin: false
      });
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setState(prev => ({ ...prev, loading: false }));
          }
          return;
        }

        if (mounted) {
          await updateAuthState(session?.user || null, session);
        }
      } catch (error) {
        console.error('Exception in initializeAuth:', error);
        if (mounted) {
          setState(prev => ({ ...prev, loading: false }));
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (mounted) {
          await updateAuthState(session?.user || null, session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { error };
    } catch (error) {
      console.error('Exception in signInWithEmail:', error);
      return { error: error as AuthError };
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName || email.split('@')[0]
          }
        }
      });

      return { error };
    } catch (error) {
      console.error('Exception in signUpWithEmail:', error);
      return { error: error as AuthError };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      return { error };
    } catch (error) {
      console.error('Exception in signInWithGoogle:', error);
      return { error: error as AuthError };
    }
  };

  // Sign in with GitHub
  const signInWithGitHub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      return { error };
    } catch (error) {
      console.error('Exception in signInWithGitHub:', error);
      return { error: error as AuthError };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Exception in signOut:', error);
      return { error: error as AuthError };
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      return { error };
    } catch (error) {
      console.error('Exception in resetPassword:', error);
      return { error: error as AuthError };
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!state.user) {
        return { error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', state.user.id);

      if (error) {
        console.error('Error updating profile:', error);
        return { error: error.message };
      }

      // Refresh profile data
      await refreshProfile();

      return { error: null };
    } catch (error) {
      console.error('Exception in updateProfile:', error);
      return { error: 'Failed to update profile' };
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (state.user) {
      const profile = await fetchProfile(state.user.id);
      setState(prev => ({
        ...prev,
        profile,
        isAdmin: profile?.is_admin || false
      }));
    }
  };

  return {
    // State
    ...state,
    
    // Actions
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithGitHub,
    signOut,
    resetPassword,
    updateProfile,
    refreshProfile
  };
}

// Export types for use in components
export type { AuthState, AuthActions }; 