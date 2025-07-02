import { 
  Essay, 
  EssayInsert, 
  EssayUpdate,
  PaginatedResponse,
  QueryOptions 
} from './supabaseTypes';
import { getSupabaseClient } from './supabaseConfig';

export class EssayService {
  private supabase = getSupabaseClient();

  /**
   * Get all essays with pagination and filtering
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

      // Add search functionality
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
   * Get published essays only (for public viewing)
   */
  async getPublishedEssays(options: QueryOptions = {}): Promise<PaginatedResponse<Essay>> {
    try {
      const {
        limit = 10,
        offset = 0,
        orderBy = 'published_at',
        ascending = false,
        search
      } = options;

      let query = this.supabase
        .from('essays')
        .select('*', { count: 'exact' })
        .eq('published', true)
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1);

      // Add search functionality
      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%,tags.cs.{${search}}`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching published essays:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count, error: null };
    } catch (error) {
      console.error('Exception in getPublishedEssays:', error);
      return { data: [], count: 0, error: 'Failed to fetch published essays' };
    }
  }

  /**
   * Get featured essays
   */
  async getFeaturedEssays(limit: number = 5): Promise<PaginatedResponse<Essay>> {
    try {
      const { data, error, count } = await this.supabase
        .from('essays')
        .select('*', { count: 'exact' })
        .eq('published', true)
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured essays:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count, error: null };
    } catch (error) {
      console.error('Exception in getFeaturedEssays:', error);
      return { data: [], count: 0, error: 'Failed to fetch featured essays' };
    }
  }

  /**
   * Get essays by category
   */
  async getEssaysByCategory(category: string, options: QueryOptions = {}): Promise<PaginatedResponse<Essay>> {
    try {
      const {
        limit = 10,
        offset = 0,
        orderBy = 'published_at',
        ascending = false
      } = options;

      const { data, error, count } = await this.supabase
        .from('essays')
        .select('*', { count: 'exact' })
        .eq('published', true)
        .eq('category', category)
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching essays by category:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count, error: null };
    } catch (error) {
      console.error('Exception in getEssaysByCategory:', error);
      return { data: [], count: 0, error: 'Failed to fetch essays by category' };
    }
  }

  /**
   * Get essays by user ID
   */
  async getUserEssays(userId: string, options: QueryOptions = {}): Promise<PaginatedResponse<Essay>> {
    try {
      const {
        limit = 10,
        offset = 0,
        orderBy = 'created_at',
        ascending = false
      } = options;

      const { data, error, count } = await this.supabase
        .from('essays')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching user essays:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count, error: null };
    } catch (error) {
      console.error('Exception in getUserEssays:', error);
      return { data: [], count: 0, error: 'Failed to fetch user essays' };
    }
  }

  /**
   * Get a single essay by ID
   */
  async getEssay(id: string): Promise<{ data: Essay | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('essays')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching essay:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception in getEssay:', error);
      return { data: null, error: 'Failed to fetch essay' };
    }
  }

  /**
   * Get a single essay by slug (for public URLs)
   */
  async getEssayBySlug(slug: string): Promise<{ data: Essay | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('essays')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) {
        console.error('Error fetching essay by slug:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception in getEssayBySlug:', error);
      return { data: null, error: 'Failed to fetch essay by slug' };
    }
  }

  /**
   * Create a new essay
   */
  async createEssay(essay: EssayInsert): Promise<{ data: Essay | null; error: string | null }> {
    try {
      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      // Generate slug if not provided
      const slug = essay.slug || this.generateSlug(essay.title);

      // Check if slug already exists
      const { data: existingEssay } = await this.supabase
        .from('essays')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existingEssay) {
        return { data: null, error: 'An essay with this slug already exists' };
      }

      const essayData: EssayInsert = {
        ...essay,
        slug,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
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
      console.error('Exception in createEssay:', error);
      return { data: null, error: 'Failed to create essay' };
    }
  }

  /**
   * Update an essay
   */
  async updateEssay(id: string, updates: EssayUpdate): Promise<{ data: Essay | null; error: string | null }> {
    try {
      const updateData: EssayUpdate = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // If slug is being updated, check for uniqueness
      if (updates.slug) {
        const { data: existingEssay } = await this.supabase
          .from('essays')
          .select('id')
          .eq('slug', updates.slug)
          .neq('id', id)
          .single();

        if (existingEssay) {
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
   * Delete an essay
   */
  async deleteEssay(id: string): Promise<{ error: string | null }> {
    try {
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
   * Publish an essay
   */
  async publishEssay(id: string): Promise<{ data: Essay | null; error: string | null }> {
    return this.updateEssay(id, { 
      published: true,
      published_at: new Date().toISOString()
    });
  }

  /**
   * Unpublish an essay
   */
  async unpublishEssay(id: string): Promise<{ data: Essay | null; error: string | null }> {
    return this.updateEssay(id, { 
      published: false,
      published_at: null
    });
  }

  /**
   * Toggle featured status
   */
  async toggleFeatured(id: string, featured: boolean): Promise<{ data: Essay | null; error: string | null }> {
    return this.updateEssay(id, { featured });
  }

  /**
   * Get essays by tags
   */
  async getEssaysByTags(tags: string[], options: QueryOptions = {}): Promise<PaginatedResponse<Essay>> {
    try {
      const {
        limit = 10,
        offset = 0,
        orderBy = 'published_at',
        ascending = false
      } = options;

      const { data, error, count } = await this.supabase
        .from('essays')
        .select('*', { count: 'exact' })
        .eq('published', true)
        .overlaps('tags', tags)
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching essays by tags:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count, error: null };
    } catch (error) {
      console.error('Exception in getEssaysByTags:', error);
      return { data: [], count: 0, error: 'Failed to fetch essays by tags' };
    }
  }

  /**
   * Get recent essays
   */
  async getRecentEssays(limit: number = 5): Promise<PaginatedResponse<Essay>> {
    try {
      const { data, error, count } = await this.supabase
        .from('essays')
        .select('*', { count: 'exact' })
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent essays:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count, error: null };
    } catch (error) {
      console.error('Exception in getRecentEssays:', error);
      return { data: [], count: 0, error: 'Failed to fetch recent essays' };
    }
  }

  /**
   * Get essay statistics
   */
  async getEssayStats(): Promise<{
    total: number;
    published: number;
    drafts: number;
    featured: number;
    totalWords: number;
    avgReadingTime: number;
    error: string | null;
  }> {
    try {
      // Get all essays for statistics
      const { data: essays, error } = await this.supabase
        .from('essays')
        .select('published, featured, word_count, reading_time');

      if (error) {
        throw error;
      }

      const total = essays?.length || 0;
      const published = essays?.filter(e => e.published).length || 0;
      const drafts = total - published;
      const featured = essays?.filter(e => e.featured).length || 0;
      const totalWords = essays?.reduce((sum, e) => sum + (e.word_count || 0), 0) || 0;
      const avgReadingTime = essays?.length ? 
        essays.reduce((sum, e) => sum + (e.reading_time || 0), 0) / essays.length : 0;

      return {
        total,
        published,
        drafts,
        featured,
        totalWords,
        avgReadingTime: Math.round(avgReadingTime),
        error: null
      };
    } catch (error) {
      console.error('Exception in getEssayStats:', error);
      return {
        total: 0,
        published: 0,
        drafts: 0,
        featured: 0,
        totalWords: 0,
        avgReadingTime: 0,
        error: 'Failed to fetch essay statistics'
      };
    }
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
   * Search essays with full text search
   */
  async searchEssays(query: string, options: QueryOptions = {}): Promise<PaginatedResponse<Essay>> {
    try {
      const {
        limit = 10,
        offset = 0,
        orderBy = 'published_at',
        ascending = false
      } = options;

      const { data, error, count } = await this.supabase
        .from('essays')
        .select('*', { count: 'exact' })
        .eq('published', true)
        .textSearch('content', query)
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error searching essays:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count, error: null };
    } catch (error) {
      console.error('Exception in searchEssays:', error);
      return { data: [], count: 0, error: 'Failed to search essays' };
    }
  }

  /**
   * Get related essays based on tags and category
   */
  async getRelatedEssays(essayId: string, limit: number = 5): Promise<PaginatedResponse<Essay>> {
    try {
      // First get the current essay to find its tags and category
      const { data: currentEssay, error: currentError } = await this.getEssay(essayId);
      
      if (currentError || !currentEssay) {
        return { data: [], count: 0, error: 'Could not find current essay' };
      }

      let query = this.supabase
        .from('essays')
        .select('*', { count: 'exact' })
        .eq('published', true)
        .neq('id', essayId)
        .limit(limit);

      // Priority: same category, then overlapping tags
      if (currentEssay.category) {
        query = query.eq('category', currentEssay.category);
      } else if (currentEssay.tags && currentEssay.tags.length > 0) {
        query = query.overlaps('tags', currentEssay.tags);
      }

      const { data, error, count } = await query.order('published_at', { ascending: false });

      if (error) {
        console.error('Error fetching related essays:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count, error: null };
    } catch (error) {
      console.error('Exception in getRelatedEssays:', error);
      return { data: [], count: 0, error: 'Failed to fetch related essays' };
    }
  }

  /**
   * Duplicate an essay
   */
  async duplicateEssay(id: string, newTitle?: string): Promise<{ data: Essay | null; error: string | null }> {
    try {
      // Get the original essay
      const { data: original, error: fetchError } = await this.getEssay(id);
      
      if (fetchError || !original) {
        return { data: null, error: fetchError || 'Essay not found' };
      }

      // Create a new essay based on the original
      const duplicateData: EssayInsert = {
        title: newTitle || `${original.title} (Copy)`,
        content: original.content,
        excerpt: original.excerpt,
        slug: this.generateSlug(newTitle || `${original.title} Copy`),
        published: false, // Reset to draft
        featured: false,
        tags: original.tags,
        category: original.category,
        image_url: original.image_url,
        meta_title: original.meta_title,
        meta_description: original.meta_description
      };

      return this.createEssay(duplicateData);
    } catch (error) {
      console.error('Exception in duplicateEssay:', error);
      return { data: null, error: 'Failed to duplicate essay' };
    }
  }
}

// Export singleton instance
export const essayService = new EssayService(); 