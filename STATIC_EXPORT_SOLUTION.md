# Solution for Static Export Admin Uploads

## The Problem
Your app uses Next.js static export (`output: 'export'`), which means:
- No server-side runtime
- Environment variables without `NEXT_PUBLIC_` are not available
- Service role key CANNOT be used (security risk if exposed to client)

## The Solution: Modify Supabase RLS Policies

Since we can't use the service role key in a static site, we need to modify the Row Level Security (RLS) policies to allow admin uploads.

### Option 1: Temporary RLS Disable (Quick Fix)
1. Go to Supabase Dashboard → Table Editor → Essays table
2. Click on "RLS disabled/enabled" toggle to temporarily disable RLS
3. Test your uploads
4. Re-enable RLS after testing

⚠️ **Warning**: This disables all security temporarily!

### Option 2: Create Admin-Friendly RLS Policy (Recommended)

Run this SQL in your Supabase SQL editor:

```sql
-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Users can insert their own essays" ON essays;
DROP POLICY IF EXISTS "Anyone can view published essays" ON essays;

-- Create new policies that allow more flexibility

-- 1. Allow anyone to read published essays
CREATE POLICY "Public read access for published essays" ON essays
FOR SELECT USING (published = true);

-- 2. Allow authenticated users to read their own essays
CREATE POLICY "Users can read own essays" ON essays
FOR SELECT USING (auth.uid() = user_id);

-- 3. Allow inserts with null user_id (for admin uploads)
CREATE POLICY "Allow admin uploads with null user_id" ON essays
FOR INSERT WITH CHECK (
  user_id IS NULL 
  OR auth.uid() = user_id
);

-- 4. Allow updates to essays with null user_id
CREATE POLICY "Allow admin updates" ON essays
FOR UPDATE USING (
  user_id IS NULL 
  OR auth.uid() = user_id
);

-- 5. Allow deletes for essays with null user_id
CREATE POLICY "Allow admin deletes" ON essays
FOR DELETE USING (
  user_id IS NULL 
  OR auth.uid() = user_id
);
```

### Option 3: Create a Supabase Edge Function (Best Long-term Solution)

1. Create an Edge Function for admin operations:

```typescript
// supabase/functions/admin-essay-upload/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { password, essays } = await req.json()
    
    // Verify admin password
    if (password !== 'mimi123') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Create Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Insert essays
    const { data, error } = await supabaseClient
      .from('essays')
      .insert(essays)
      .select()

    if (error) throw error

    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
```

2. Deploy: `supabase functions deploy admin-essay-upload`

3. Update your admin service to call this function instead.

## Immediate Fix

For now, run the SQL in Option 2 to modify your RLS policies. This will allow essays with `null` user_id to be inserted, which is what your admin upload is trying to do.

## Testing

After applying the RLS policy changes:
1. Go to your app
2. Admin login with "mimi123"
3. Try uploading essays again
4. Check browser console - should work now!

## Security Considerations

- The modified RLS policy allows anyone to insert essays with null user_id
- Your app-level password protection (mimi123) is the main security
- Consider implementing Option 3 (Edge Function) for production use