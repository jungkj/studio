-- Fix RLS Policies for Essay Admin Uploads
-- Run this SQL in your Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can insert essays" ON essays;
DROP POLICY IF EXISTS "Published essays are viewable by everyone" ON essays;
DROP POLICY IF EXISTS "Users can update own essays" ON essays;
DROP POLICY IF EXISTS "Users can delete own essays" ON essays;

-- Create new flexible policies

-- 1. Allow anyone to read published essays
CREATE POLICY "Public read access for published essays" ON essays
FOR SELECT USING (published = true);

-- 2. Allow authenticated users to read their own essays
CREATE POLICY "Users can read own essays" ON essays
FOR SELECT USING (auth.uid() = user_id);

-- 3. Allow inserts with null user_id (for admin uploads) OR by authenticated users
CREATE POLICY "Allow admin uploads and authenticated inserts" ON essays
FOR INSERT WITH CHECK (
  user_id IS NULL 
  OR auth.uid() = user_id
);

-- 4. Allow updates to essays with null user_id OR by owners
CREATE POLICY "Allow admin and owner updates" ON essays
FOR UPDATE USING (
  user_id IS NULL 
  OR auth.uid() = user_id
);

-- 5. Allow deletes for essays with null user_id OR by owners
CREATE POLICY "Allow admin and owner deletes" ON essays
FOR DELETE USING (
  user_id IS NULL 
  OR auth.uid() = user_id
);

-- Verify policies are applied
SELECT schemaname, tablename, policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'essays' 
ORDER BY policyname;