import { 
  Project, 
  ProjectInsert, 
  ProjectUpdate, 
  ProjectStatus, 
  PriorityLevel,
  PaginatedResponse,
  QueryOptions 
} from './supabaseTypes';
import { getSupabaseClient } from './supabaseConfig';

export class ProjectService {
  private supabase = getSupabaseClient();

  /**
   * Get all projects with pagination and filtering
   */
  async getProjects(options: QueryOptions = {}): Promise<PaginatedResponse<Project>> {
    try {
      const {
        limit = 10,
        offset = 0,
        orderBy = 'created_at',
        ascending = false,
        search
      } = options;

      let query = this.supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1);

      // Add search functionality
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching projects:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count, error: null };
    } catch (error) {
      console.error('Exception in getProjects:', error);
      return { data: [], count: 0, error: 'Failed to fetch projects' };
    }
  }

  /**
   * Get projects by status
   */
  async getProjectsByStatus(status: ProjectStatus, options: QueryOptions = {}): Promise<PaginatedResponse<Project>> {
    try {
      const {
        limit = 10,
        offset = 0,
        orderBy = 'created_at',
        ascending = false
      } = options;

      const { data, error, count } = await this.supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('status', status)
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching projects by status:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count, error: null };
    } catch (error) {
      console.error('Exception in getProjectsByStatus:', error);
      return { data: [], count: 0, error: 'Failed to fetch projects by status' };
    }
  }

  /**
   * Get projects by user ID
   */
  async getUserProjects(userId: string, options: QueryOptions = {}): Promise<PaginatedResponse<Project>> {
    try {
      const {
        limit = 10,
        offset = 0,
        orderBy = 'created_at',
        ascending = false
      } = options;

      const { data, error, count } = await this.supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching user projects:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count, error: null };
    } catch (error) {
      console.error('Exception in getUserProjects:', error);
      return { data: [], count: 0, error: 'Failed to fetch user projects' };
    }
  }

  /**
   * Get a single project by ID
   */
  async getProject(id: string): Promise<{ data: Project | null; error: string | null }> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching project:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception in getProject:', error);
      return { data: null, error: 'Failed to fetch project' };
    }
  }

  /**
   * Create a new project
   */
  async createProject(project: ProjectInsert): Promise<{ data: Project | null; error: string | null }> {
    try {
      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      const projectData: ProjectInsert = {
        ...project,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception in createProject:', error);
      return { data: null, error: 'Failed to create project' };
    }
  }

  /**
   * Update a project
   */
  async updateProject(id: string, updates: ProjectUpdate): Promise<{ data: Project | null; error: string | null }> {
    try {
      const updateData: ProjectUpdate = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Exception in updateProject:', error);
      return { data: null, error: 'Failed to update project' };
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await this.supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting project:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Exception in deleteProject:', error);
      return { error: 'Failed to delete project' };
    }
  }

  /**
   * Update project status
   */
  async updateProjectStatus(id: string, status: ProjectStatus): Promise<{ data: Project | null; error: string | null }> {
    return this.updateProject(id, { status });
  }

  /**
   * Update project priority
   */
  async updateProjectPriority(id: string, priority: PriorityLevel): Promise<{ data: Project | null; error: string | null }> {
    return this.updateProject(id, { priority });
  }

  /**
   * Search projects by technology stack
   */
  async searchProjectsByTechnology(technology: string, options: QueryOptions = {}): Promise<PaginatedResponse<Project>> {
    try {
      const {
        limit = 10,
        offset = 0,
        orderBy = 'created_at',
        ascending = false
      } = options;

      const { data, error, count } = await this.supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .contains('technology_stack', [technology])
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error searching projects by technology:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count, error: null };
    } catch (error) {
      console.error('Exception in searchProjectsByTechnology:', error);
      return { data: [], count: 0, error: 'Failed to search projects by technology' };
    }
  }

  /**
   * Get projects by tags
   */
  async getProjectsByTags(tags: string[], options: QueryOptions = {}): Promise<PaginatedResponse<Project>> {
    try {
      const {
        limit = 10,
        offset = 0,
        orderBy = 'created_at',
        ascending = false
      } = options;

      const { data, error, count } = await this.supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .overlaps('tags', tags)
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching projects by tags:', error);
        return { data: [], count: 0, error: error.message };
      }

      return { data: data || [], count, error: null };
    } catch (error) {
      console.error('Exception in getProjectsByTags:', error);
      return { data: [], count: 0, error: 'Failed to fetch projects by tags' };
    }
  }

  /**
   * Get project statistics
   */
  async getProjectStats(): Promise<{
    total: number;
    byStatus: Record<ProjectStatus, number>;
    byPriority: Record<PriorityLevel, number>;
    error: string | null;
  }> {
    try {
      // Get total count
      const { count: total, error: totalError } = await this.supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        throw totalError;
      }

      // Get counts by status
      const statusCounts: Record<ProjectStatus, number> = {
        draft: 0,
        in_progress: 0,
        completed: 0,
        archived: 0
      };

      const priorityCounts: Record<PriorityLevel, number> = {
        low: 0,
        medium: 0,
        high: 0
      };

      // Get all projects to calculate stats (could be optimized with aggregation functions)
      const { data: projects, error: projectsError } = await this.supabase
        .from('projects')
        .select('status, priority');

      if (projectsError) {
        throw projectsError;
      }

      // Calculate counts
      projects?.forEach(project => {
        if (project.status) {
          statusCounts[project.status]++;
        }
        if (project.priority) {
          priorityCounts[project.priority]++;
        }
      });

      return {
        total: total || 0,
        byStatus: statusCounts,
        byPriority: priorityCounts,
        error: null
      };
    } catch (error) {
      console.error('Exception in getProjectStats:', error);
      return {
        total: 0,
        byStatus: { draft: 0, in_progress: 0, completed: 0, archived: 0 },
        byPriority: { low: 0, medium: 0, high: 0 },
        error: 'Failed to fetch project statistics'
      };
    }
  }

  /**
   * Duplicate a project
   */
  async duplicateProject(id: string, newTitle?: string): Promise<{ data: Project | null; error: string | null }> {
    try {
      // Get the original project
      const { data: original, error: fetchError } = await this.getProject(id);
      
      if (fetchError || !original) {
        return { data: null, error: fetchError || 'Project not found' };
      }

      // Create a new project based on the original
      const duplicateData: ProjectInsert = {
        title: newTitle || `${original.title} (Copy)`,
        description: original.description,
        content: original.content,
        technology_stack: original.technology_stack,
        github_url: null, // Don't copy URLs
        live_url: null,
        image_url: original.image_url,
        status: 'draft', // Reset to draft
        priority: original.priority,
        tags: original.tags,
        start_date: null, // Reset dates
        end_date: null
      };

      return this.createProject(duplicateData);
    } catch (error) {
      console.error('Exception in duplicateProject:', error);
      return { data: null, error: 'Failed to duplicate project' };
    }
  }
}

// Export singleton instance
export const projectService = new ProjectService(); 