# Essay Setup Guide

## How to Add Essays to Your Portfolio

Due to Supabase Row Level Security (RLS) policies, essays must be added through the admin interface or with proper authentication.

### Method 1: Using the Admin UI (Recommended)

1. **Open the Essays App**
   - Click on "My Essays" icon on the desktop

2. **Sign In as Admin**
   - Click the key icon (🔑) in the top right
   - Enter your admin email and password
   - The credentials should match a user with admin role in your Supabase auth.users table

3. **Enable Admin Mode**
   - After signing in, toggle the "Admin Mode" switch

4. **Upload Placeholder Essays**
   - Click the "Upload Essays" button
   - This will add 3 pre-written essays to your database

### Method 2: Direct Database Access

If you need to add essays directly:

1. **Get Service Role Key**
   - Go to your Supabase project settings
   - Copy the service_role key (not the anon key)
   - Add to .env.local: `SUPABASE_SERVICE_ROLE_KEY=your_key_here`

2. **Run the Script**
   ```bash
   npm run add-test-essay
   ```

### Method 3: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Table Editor → essays
3. Click "Insert row"
4. Fill in the required fields:
   - title: Your essay title
   - content: Essay content (supports Markdown)
   - slug: URL-friendly version (e.g., "my-first-essay")
   - published: true
   - excerpt: Short description
   - tags: Array of tags (e.g., ["Tech", "Life"])
   - category: Category name
   - reading_time: Estimated minutes to read
   - published_at: Publication date

### Troubleshooting

**Essays not showing up?**
- Ensure `published` is set to `true`
- Check that `published_at` has a valid date
- Verify Supabase connection in browser console

**RLS Policy Error?**
- You need admin authentication
- Or temporarily disable RLS on essays table (not recommended for production)

**Connection Timeout?**
- Check your Supabase URL and anon key in .env.local
- Ensure your Supabase project is active and not paused