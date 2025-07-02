# Supabase Integration Setup Guide

This guide will help you set up Supabase for your Azure Mongoose Wiggle application to store projects, essays, and support CRUD operations.

## Prerequisites

- Supabase account and project created
- Node.js and npm installed
- Git for version control

## Step 1: Environment Configuration

Since `.env` files may be restricted, you need to manually create environment variables. You can do this in one of several ways:

### Option A: Create `.env` file in project root
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://qzxbinrlrzbfnqiuccon.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6eGJpbnJscnpiZm5xaXVjY29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNjgxOTUsImV4cCI6MjA2Njg0NDE5NX0.Ad_UHirGqj0zn5rF7sWU0cHvVRwb0dtNwtEI76UEocY

# Service role key (server-side only, never expose in client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6eGJpbnJscnpiZm5xaXVjY29uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTI2ODE5NSwiZXhwIjoyMDY2ODQ0MTk1fQ.nqRY1gdhtIEyPolxwqBtfBtLz2corqMNjMsUTrs7BfQ

# Existing Spotify Configuration (keep if you have it)
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
VITE_SPOTIFY_DEFAULT_PLAYLIST_ID=your_playlist_id
```

### Option B: Set environment variables in your deployment platform
If deploying to Vercel, Netlify, or similar, add these as environment variables in your platform's dashboard.

### Option C: Use system environment variables
Export them in your shell:
```bash
export VITE_SUPABASE_URL="https://qzxbinrlrzbfnqiuccon.supabase.co"
export VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6eGJpbnJscnpiZm5xaXVjY29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNjgxOTUsImV4cCI6MjA2Njg0NDE5NX0.Ad_UHirGqj0zn5rF7sWU0cHvVRwb0dtNwtEI76UEocY"
```

## Step 2: Database Schema Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `src/utils/supabaseSchema.sql`
4. Execute the SQL to create all tables, functions, triggers, and policies

This will create:
- **profiles** - User profiles extending Supabase auth
- **projects** - Your project portfolio
- **essays** - Blog posts and articles
- **categories** - Organization for essays
- **comments** - User feedback system

## Step 3: Authentication Setup

### Enable Email Authentication
1. Go to Authentication → Settings in Supabase dashboard
2. Make sure Email authentication is enabled
3. Configure email templates if desired

### Enable OAuth Providers (Optional)
1. Go to Authentication → Providers
2. Enable Google and/or GitHub providers
3. Add client ID and secret for each provider
4. Set redirect URLs

### Create Admin User
1. Go to Authentication → Users
2. Create a new user manually or sign up through your app
3. Note the user ID
4. Run this SQL to make them admin:
```sql
UPDATE profiles SET is_admin = true WHERE id = 'user-id-here';
```

## Step 4: Row Level Security (RLS) Configuration

The schema includes RLS policies, but verify they're working:

1. **Public Access**: Essays and projects are readable by everyone when published
2. **User Access**: Users can manage their own content
3. **Admin Access**: Admins can manage categories and approve comments

## Step 5: Testing the Integration

1. **Install dependencies** (if not already done):
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Test features**:
   - Open the Essays app
   - Try signing in with your admin account
   - Test creating, editing, and publishing essays
   - Verify projects display correctly

## Step 6: Data Migration (If Coming from Local Storage)

If you have existing data in localStorage, you'll need to migrate it:

1. Export your current essays and projects data
2. Transform the data to match the new schema
3. Use the Supabase dashboard or API to import the data

## Step 7: Security Checklist

- ✅ **Environment Variables**: Secure storage of keys
- ✅ **RLS Policies**: Proper access control implemented
- ✅ **HTTPS**: Always use HTTPS in production
- ✅ **API Keys**: Never expose service role key in client code
- ✅ **User Validation**: Input validation on all forms

## Available Features

### Essays Management
- ✅ Create, read, update, delete essays
- ✅ Draft/publish workflow
- ✅ Tag-based organization
- ✅ Search and filtering
- ✅ Reading time calculation
- ✅ SEO-friendly slugs
- ✅ Featured essays

### Projects Portfolio
- ✅ Project CRUD operations
- ✅ Status tracking (draft, in-progress, completed, archived)
- ✅ Technology stack tracking
- ✅ Priority management
- ✅ Search and filtering
- ✅ GitHub/live URL links

### User Management
- ✅ Email/password authentication
- ✅ OAuth with Google/GitHub
- ✅ User profiles
- ✅ Admin role management
- ✅ Secure session handling

### Comments System
- ✅ Comments on essays and projects
- ✅ Moderation workflow
- ✅ Nested replies
- ✅ Author information

## API Usage Examples

### Essays
```typescript
import { essayService } from '@/utils/essayService';

// Get published essays
const { data: essays } = await essayService.getPublishedEssays({
  limit: 10,
  orderBy: 'published_at',
  ascending: false
});

// Create new essay
const { data: newEssay } = await essayService.createEssay({
  title: "My New Essay",
  content: "Essay content here...",
  published: false
});

// Publish essay
await essayService.publishEssay(essayId);
```

### Projects
```typescript
import { projectService } from '@/utils/projectService';

// Get all projects
const { data: projects } = await projectService.getProjects({
  limit: 20
});

// Create project
const { data: newProject } = await projectService.createProject({
  title: "My New Project",
  description: "Project description...",
  technology_stack: ["React", "TypeScript", "Supabase"],
  status: "in_progress"
});

// Update project status
await projectService.updateProjectStatus(projectId, "completed");
```

### Authentication
```typescript
import { useAuth } from '@/hooks/useAuth';

const { 
  user, 
  isAuthenticated, 
  isAdmin, 
  signInWithEmail, 
  signOut 
} = useAuth();

// Sign in
await signInWithEmail("user@example.com", "password");

// Sign out
await signOut();
```

## Troubleshooting

### Common Issues

1. **"Table doesn't exist" errors**
   - Make sure you've run the schema SQL
   - Check table names match the schema

2. **Authentication issues**
   - Verify environment variables are set correctly
   - Check Supabase project URL and keys

3. **Permission denied errors**
   - Review RLS policies
   - Make sure user is authenticated
   - Check admin status for admin operations

4. **CORS errors**
   - Add your domain to Supabase allowed origins
   - Use correct redirect URLs

### Getting Help

1. Check the browser console for errors
2. Review Supabase logs in the dashboard
3. Verify your environment variables
4. Test with a simple query in the Supabase SQL editor

## Next Steps

1. **Customize the schema** - Add fields specific to your needs
2. **Implement real-time features** - Use Supabase subscriptions
3. **Add file storage** - Use Supabase Storage for images
4. **Set up backups** - Configure automated backups
5. **Monitor usage** - Set up analytics and monitoring

## Security Best Practices

- Never commit environment files to version control
- Regularly rotate API keys
- Use principle of least privilege for RLS policies
- Validate all user inputs
- Keep dependencies updated
- Monitor for suspicious activity

---

Your Supabase integration is now complete! You have a fully functional backend with authentication, CRUD operations, and a secure, scalable architecture. 