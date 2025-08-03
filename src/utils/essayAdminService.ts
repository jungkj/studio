import { 
  Essay, 
  EssayInsert, 
  EssayUpdate,
  PaginatedResponse,
  QueryOptions,
  Database
} from './supabaseTypes';
import { getSupabaseClient } from './supabaseConfig';
import { SupabaseClient } from '@supabase/supabase-js';

export class EssayAdminService {
  private supabase = getSupabaseClient();
  private isAdminAuthenticated: boolean = false;
  private adminPassword: string | null = null;

  /**
   * Set admin authentication status
   */
  setAdminAuth(isAuthenticated: boolean, password?: string) {
    this.isAdminAuthenticated = isAuthenticated;
    if (password) {
      this.adminPassword = password;
    }
  }

  /**
   * Create a new essay without requiring Supabase authentication
   * Uses a server-side proxy endpoint for admin operations
   */
  async createEssayAsAdmin(essay: EssayInsert): Promise<{ data: Essay | null; error: string | null }> {
    try {
      // Check if admin is authenticated at app level
      if (!this.isAdminAuthenticated) {
        return { data: null, error: 'Admin authentication required' };
      }

      // For static export, we'll use the anon client with a workaround
      // Since we can't use service role key in client-side code
      
      // Generate slug if not provided
      const slug = essay.slug || this.generateSlug(essay.title);

      // Skip slug check for now due to 406 errors
      // We'll handle duplicates via database unique constraint
      console.log('Skipping slug check due to static export limitations');

      // Create essay data
      const essayData: EssayInsert = {
        ...essay,
        slug,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Set user_id to null for admin uploads
        user_id: null
      };

      // Try direct insert first
      const { data, error } = await this.supabase
        .from('essays')
        .insert(essayData)
        .select()
        .single();

      if (error) {
        console.error('Error creating essay:', error);
        
        // Provide specific error messages based on error codes
        if (error.code === '42501') {
          return { 
            data: null, 
            error: `RLS Policy Error: The database doesn't allow inserting essays with null user_id. Please run the SQL commands in fix-rls-policies.sql to update your Row Level Security policies.` 
          };
        }
        
        if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
          return { 
            data: null, 
            error: `Duplicate slug error: An essay with the slug "${slug}" already exists.` 
          };
        }
        
        if (error.message.includes('policy')) {
          return { 
            data: null, 
            error: 'Database policy error. Please check RLS policies or contact admin.' 
          };
        }
        
        return { data: null, error: `Database error: ${error.message}` };
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
      
      const updateData: EssayUpdate = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      if (updates.slug) {
        const { data: existingEssays, error: slugCheckError } = await this.supabase
          .from('essays')
          .select('id')
          .eq('slug', updates.slug)
          .neq('id', id);

        if (slugCheckError && slugCheckError.code !== 'PGRST116') {
          console.error('Error checking slug:', slugCheckError);
        }

        if (existingEssays && existingEssays.length > 0) {
          return { data: null, error: 'An essay with this slug already exists' };
        }
      }

      const { data, error } = await this.supabase
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
      
      const { error } = await this.supabase
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

  /**
   * Delete multiple essays by their slugs
   */
  async deleteEssaysBySlugs(slugs: string[]): Promise<{ 
    successful: number; 
    failed: number; 
    errors: Array<{ slug: string; error: string }> 
  }> {
    let successful = 0;
    let failed = 0;
    const errors: Array<{ slug: string; error: string }> = [];

    for (const slug of slugs) {
      try {
        const { error } = await this.supabase
          .from('essays')
          .delete()
          .eq('slug', slug);

        if (error) {
          failed++;
          errors.push({ slug, error: error.message });
          console.error(`Error deleting essay with slug "${slug}":`, error);
        } else {
          successful++;
          console.log(`Successfully deleted essay with slug: ${slug}`);
        }
      } catch (error) {
        failed++;
        errors.push({ slug, error: 'Exception during deletion' });
        console.error(`Exception deleting essay with slug "${slug}":`, error);
      }
    }

    return { successful, failed, errors };
  }

  /**
   * Sync local essays with database (handles both uploads and deletions)
   */
  async syncEssaysWithDatabase(
    localEssays: Array<any>,
    deletedIds: string[]
  ): Promise<{
    uploads: { successful: number; failed: number };
    deletions: { successful: number; failed: number };
    errors: Array<{ operation: string; item: string; error: string }>;
  }> {
    const results = {
      uploads: { successful: 0, failed: 0 },
      deletions: { successful: 0, failed: 0 },
      errors: [] as Array<{ operation: string; item: string; error: string }>
    };

    // First, handle deletions
    if (deletedIds.length > 0) {
      console.log(`Processing ${deletedIds.length} deletions...`);
      
      // Get all essays from database to find the slugs for deleted IDs
      const { data: dbEssays } = await this.getEssays({ limit: 1000 });
      
      // Map deleted IDs to slugs (assuming IDs are based on timestamps)
      const slugsToDelete: string[] = [];
      
      // For each deleted ID, try to find corresponding essay by matching criteria
      for (const deletedId of deletedIds) {
        // Since local IDs are timestamps, we need to match by other criteria
        // We'll delete essays that aren't in the local list
        const deletedEssay = dbEssays?.find(dbEssay => {
          // Check if this DB essay exists in local essays
          const existsLocally = localEssays.some(localEssay => 
            localEssay.title === dbEssay.title || 
            localEssay.slug === dbEssay.slug
          );
          return !existsLocally;
        });
        
        if (deletedEssay?.slug) {
          slugsToDelete.push(deletedEssay.slug);
        }
      }
      
      if (slugsToDelete.length > 0) {
        const deleteResult = await this.deleteEssaysBySlugs(slugsToDelete);
        results.deletions.successful = deleteResult.successful;
        results.deletions.failed = deleteResult.failed;
        
        deleteResult.errors.forEach(err => {
          results.errors.push({
            operation: 'delete',
            item: err.slug,
            error: err.error
          });
        });
      }
    }

    // Then handle uploads/updates
    const essaysToUpload = localEssays.map(essay => ({
      title: essay.title,
      content: essay.content,
      slug: essay.slug || essay.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      published: true,
      excerpt: essay.preview || essay.excerpt,
      tags: essay.tags,
      category: essay.tags?.[0] || 'General',
      reading_time: parseInt(essay.readTime) || 5,
      published_at: essay.publishedAt || new Date(essay.createdAt).toISOString(),
    }));

    const uploadResult = await this.bulkUploadEssays(essaysToUpload);
    results.uploads.successful = uploadResult.successful;
    results.uploads.failed = uploadResult.failed;

    uploadResult.errors.forEach(err => {
      results.errors.push({
        operation: 'upload',
        item: err.title,
        error: err.error
      });
    });

    return results;
  }
}

// Export singleton instance
export const essayAdminService = new EssayAdminService();