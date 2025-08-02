# Fix Database Upload Errors

## The Problem
You're getting 401 (Unauthorized) and 406 (Not Acceptable) errors because:
1. The service role key is not configured in your `.env.local`
2. Without it, the app falls back to the anon key which doesn't have insert permissions

## The Solution

### Step 1: Get Your Service Role Key
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project (azure-mongoose-wiggle)
3. Go to Settings (gear icon) → API
4. Find the "service_role" key (it's the second key, NOT the anon key)
5. Copy the entire key

### Step 2: Add to .env.local
Open `/Users/andyjung/dyad-apps/azure-mongoose-wiggle/.env.local` and uncomment/add:

```
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here
```

Replace `paste_your_service_role_key_here` with the actual key from step 1.

### Step 3: Restart Your Dev Server
```bash
# Kill any running servers
pkill -f "next dev"

# Start fresh
npm run dev
```

### Step 4: Test the Upload
1. Open your app
2. Click the settings gear icon
3. Click "Admin Access" and enter password: `mimi123`
4. Click "Manage Essays"
5. Click "Upload to DB"

## What I Fixed
1. **Added proper headers** to Supabase client configuration for both anon and service clients
2. **Fixed slug checking** to handle empty results properly (was causing 406 errors)
3. **Improved error handling** to show more descriptive messages

## Security Note
⚠️ NEVER commit the service role key to git! It's already in `.gitignore` but double-check.

## If It Still Doesn't Work
After adding the service role key, if you still get errors:
1. Check the console for more specific error messages
2. Verify your Supabase project is active (not paused)
3. Check if RLS is enabled on the essays table (it should be)

The service role key bypasses all RLS policies, so once configured, uploads should work!