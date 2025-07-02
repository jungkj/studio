// Generated types for Supabase database schema
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          content: string | null;
          technology_stack: string[] | null;
          github_url: string | null;
          live_url: string | null;
          image_url: string | null;
          status: 'draft' | 'in_progress' | 'completed' | 'archived';
          priority: 'low' | 'medium' | 'high';
          tags: string[] | null;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          content?: string | null;
          technology_stack?: string[] | null;
          github_url?: string | null;
          live_url?: string | null;
          image_url?: string | null;
          status?: 'draft' | 'in_progress' | 'completed' | 'archived';
          priority?: 'low' | 'medium' | 'high';
          tags?: string[] | null;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          content?: string | null;
          technology_stack?: string[] | null;
          github_url?: string | null;
          live_url?: string | null;
          image_url?: string | null;
          status?: 'draft' | 'in_progress' | 'completed' | 'archived';
          priority?: 'low' | 'medium' | 'high';
          tags?: string[] | null;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string | null;
        };
      };
      essays: {
        Row: {
          id: string;
          title: string;
          content: string;
          excerpt: string | null;
          slug: string;
          published: boolean;
          featured: boolean;
          tags: string[] | null;
          category: string | null;
          reading_time: number | null;
          word_count: number | null;
          image_url: string | null;
          meta_title: string | null;
          meta_description: string | null;
          created_at: string;
          updated_at: string;
          published_at: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          excerpt?: string | null;
          slug: string;
          published?: boolean;
          featured?: boolean;
          tags?: string[] | null;
          category?: string | null;
          reading_time?: number | null;
          word_count?: number | null;
          image_url?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          excerpt?: string | null;
          slug?: string;
          published?: boolean;
          featured?: boolean;
          tags?: string[] | null;
          category?: string | null;
          reading_time?: number | null;
          word_count?: number | null;
          image_url?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
          user_id?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          website: string | null;
          github_username: string | null;
          linkedin_url: string | null;
          twitter_handle: string | null;
          location: string | null;
          is_admin: boolean;
          preferences: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          github_username?: string | null;
          linkedin_url?: string | null;
          twitter_handle?: string | null;
          location?: string | null;
          is_admin?: boolean;
          preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          github_username?: string | null;
          linkedin_url?: string | null;
          twitter_handle?: string | null;
          location?: string | null;
          is_admin?: boolean;
          preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          color: string | null;
          icon: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          content: string;
          essay_id: string | null;
          project_id: string | null;
          author_name: string;
          author_email: string;
          author_website: string | null;
          is_approved: boolean;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          essay_id?: string | null;
          project_id?: string | null;
          author_name: string;
          author_email: string;
          author_website?: string | null;
          is_approved?: boolean;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          essay_id?: string | null;
          project_id?: string | null;
          author_name?: string;
          author_email?: string;
          author_website?: string | null;
          is_approved?: boolean;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      project_status: 'draft' | 'in_progress' | 'completed' | 'archived';
      priority_level: 'low' | 'medium' | 'high';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types for easier use
export type Project = Database['public']['Tables']['projects']['Row'];
export type Essay = Database['public']['Tables']['essays']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];

export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type EssayInsert = Database['public']['Tables']['essays']['Insert'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];

export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
export type EssayUpdate = Database['public']['Tables']['essays']['Update'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];
export type CommentUpdate = Database['public']['Tables']['comments']['Update'];

// Utility types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'archived';
export type PriorityLevel = 'low' | 'medium' | 'high';

// Query response types
export interface PaginatedResponse<T> {
  data: T[];
  count: number | null;
  error: string | null;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
  search?: string;
} 