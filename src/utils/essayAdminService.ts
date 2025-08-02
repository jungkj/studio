import { 
  Essay, 
  EssayInsert, 
  EssayUpdate,
  PaginatedResponse,
  QueryOptions,
  Database
} from './supabaseTypes';
import { getSupabaseClient, getSupabaseServiceClient } from './supabaseConfig';
import { SupabaseClient } from '@supabase/supabase-js';

export class EssayAdminService {
  private supabase = getSupabaseClient();
  private serviceClient: SupabaseClient<Database> | null = null;
  private isAdminAuthenticated: boolean = false;

  /**
   * Set admin authentication status
   */
  setAdminAuth(isAuthenticated: boolean) {
    this.isAdminAuthenticated = isAuthenticated;
  }

  /**
   * Get or initialize service client for admin operations
   */
  private getAdminClient(): SupabaseClient<Database> {
    if (!this.isAdminAuthenticated) {
      throw new Error('Admin authentication required');
    }

    // Try to use service role client for admin operations
    if (!this.serviceClient) {
      try {
        this.serviceClient = getSupabaseServiceClient();
        console.log('Using service role client for admin operations');
      } catch (e) {
        // Fall back to regular client if service role key not available
        console.warn('Service role key not available, using regular client with potential RLS restrictions');
        this.serviceClient = this.supabase;
      }
    }
    
    return this.serviceClient;
  }

  /**
   * Create a new essay without requiring Supabase authentication
   * Admin authentication is handled at the application level
   */
  async createEssayAsAdmin(essay: EssayInsert): Promise<{ data: Essay | null; error: string | null }> {
    try {
      // Check if admin is authenticated at app level
      if (!this.isAdminAuthenticated) {
        return { data: null, error: 'Admin authentication required' };
      }

      const adminClient = this.getAdminClient();

      // Generate slug if not provided
      const slug = essay.slug || this.generateSlug(essay.title);

      // Check if slug already exists
      const { data: existingEssay } = await adminClient
        .from('essays')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existingEssay) {
        return { data: null, error: 'An essay with this slug already exists' };
      }

      // Create essay data without user_id requirement
      const essayData: EssayInsert = {
        ...essay,
        slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Set a default admin user_id (UUID format)
        user_id: '00000000-0000-0000-0000-000000000000'
      };

      const { data, error } = await adminClient
        .from('essays')
        .insert(essayData)
        .select()
        .single();

      if (error) {
        console.error('Error creating essay:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception in createEssayAsAdmin:', error);
      return { data: null, error: 'Failed to create essay' };
    }
  }

  /**
   * Bulk upload essays for admin users
   */
  async bulkUploadEssays(essays: EssayInsert[]): Promise<{ 
    successful: number; 
    failed: number; 
    errors: Array<{ title: string; error: string }> 
  }> {
    let successful = 0;
    let failed = 0;
    const errors: Array<{ title: string; error: string }> = [];

    for (const essay of essays) {
      const result = await this.createEssayAsAdmin(essay);
      
      if (result.data) {
        successful++;
      } else {
        failed++;
        errors.push({ 
          title: essay.title, 
          error: result.error || 'Unknown error' 
        });
      }
    }

    return { successful, failed, errors };
  }

  /**
   * Generate a URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Get all essays (same as regular service)
   */
  async getEssays(options: QueryOptions = {}): Promise<PaginatedResponse<Essay>> {
    try {
      const {
        limit = 10,
        offset = 0,
        orderBy = 'created_at',
        ascending = false,
        search
      } = options;

      let query = this.supabase
        .from('essays')
        .select('*', { count: 'exact' })
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1);

      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%,tags.cs.{${search}}`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching essays:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count, error: null };
    } catch (error) {
      console.error('Exception in getEssays:', error);
      return { data: [], count: 0, error: 'Failed to fetch essays' };
    }
  }

  /**
   * Update an essay (admin version)
   */
  async updateEssay(id: string, updates: EssayUpdate): Promise<{ data: Essay | null; error: string | null }> {
    try {
      if (!this.isAdminAuthenticated) {
        return { data: null, error: 'Admin authentication required' };
      }

      const adminClient = this.getAdminClient();
      
      const updateData: EssayUpdate = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      if (updates.slug) {
        const { data: existingEssay } = await adminClient
          .from('essays')
          .select('id')
          .eq('slug', updates.slug)
          .neq('id', id)
          .single();

        if (existingEssay) {
          return { data: null, error: 'An essay with this slug already exists' };
        }
      }

      const { data, error } = await adminClient
        .from('essays')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating essay:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception in updateEssay:', error);
      return { data: null, error: 'Failed to update essay' };
    }
  }

  /**
   * Delete an essay (admin version)
   */
  async deleteEssay(id: string): Promise<{ error: string | null }> {
    try {
      if (!this.isAdminAuthenticated) {
        return { error: 'Admin authentication required' };
      }

      const adminClient = this.getAdminClient();
      
      const { error } = await adminClient
        .from('essays')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting essay:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Exception in deleteEssay:', error);
      return { error: 'Failed to delete essay' };
    }
  }
}

// Export singleton instance
export const essayAdminService = new EssayAdminService();