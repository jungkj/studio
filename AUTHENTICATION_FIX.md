# Authentication Fix Instructions

## Issues Identified

1. **Essay Upload Authentication Error**: The admin panel login (password "mimi123") only provides local access but doesn't authenticate with Supabase. Essay uploads require Supabase authentication.

2. **Spotify Token 406 Error**: The `spotify_tokens` table is missing from your Supabase database, causing a 406 (Not Acceptable) error.

## Solutions Implemented

### 1. Enhanced Essay Upload with Supabase Authentication

I've updated the `EssayAdmin.tsx` component to:
- Show current Supabase authentication status
- Prompt for Supabase login before uploading essays
- Display clear feedback about authentication state

### 2. Spotify Tokens Table Setup

To fix the Spotify token error, you need to create the missing table in Supabase:

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `src/utils/spotifyTokensSchema.sql`

## How to Use

### For Essay Upload:

1. Log into the admin panel with password "mimi123"
2. Click "Manage Essays" 
3. Click "Upload to DB"
4. You'll be prompted to log in with your Supabase credentials:
   - Email: Your Supabase account email
   - Password: Your Supabase account password
5. Once authenticated, click "Upload to DB" again to upload essays

### For Spotify Integration:

1. Run the `spotifyTokensSchema.sql` script in Supabase
2. Authenticate Spotify from the admin panel
3. The refresh token will be stored and accessible to all visitors

## Important Notes

- The admin panel password ("mimi123") is for local admin access only
- Supabase authentication is required for database operations
- Make sure you have created a user account in Supabase first
- To make a user an admin in Supabase, run:
  ```sql
  UPDATE profiles SET is_admin = true WHERE id = 'your-user-id';
  ```

## Security Considerations

- Never expose your Supabase service role key in client-side code
- The current setup uses anon key which is safe for client-side
- Consider implementing proper role-based access control for production