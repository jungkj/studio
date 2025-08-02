-- Fix RLS policies for essay uploads in static export environment
-- Run this in Supabase SQL Editor

-- First, check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'essays';

-- Drop ALL existing policies on essays table to start fresh
DROP POLICY IF EXISTS "Allow admin deletes" ON essays;
DROP POLICY IF EXISTS "Allow admin updates" ON essays;
DROP POLICY IF EXISTS "Allow admin uploads with null user_id" ON essays;
DROP POLICY IF EXISTS "Public read access for published essays" ON essays;
DROP POLICY IF EXISTS "Users can read own essays" ON essays;
DROP POLICY IF EXISTS "Users can insert their own essays" ON essays;
DROP POLICY IF EXISTS "Anyone can view published essays" ON essays;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON essays;
DROP POLICY IF EXISTS "Enable read access for all users" ON essays;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON essays;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON essays;

-- Create new comprehensive policies

-- 1. PUBLIC READ: Anyone can read ALL essays (for development/testing)
-- Change this to published-only for production
CREATE POLICY "public_read_all_essays" ON essays
FOR SELECT 
USING (true);  -- Allow all reads for now

-- 2. ANON INSERT: Allow anonymous inserts (for admin uploads from static site)
CREATE POLICY "anon_insert_essays" ON essays
FOR INSERT 
TO anon  -- Specifically for the anon role
WITH CHECK (true);  -- Allow all inserts from anon

-- 3. ANON UPDATE: Allow anonymous updates
CREATE POLICY "anon_update_essays" ON essays
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- 4. ANON DELETE: Allow anonymous deletes  
CREATE POLICY "anon_delete_essays" ON essays
FOR DELETE
TO anon
USING (true);

-- 5. AUTHENTICATED USER policies (for future use)
CREATE POLICY "auth_user_manage_own" ON essays
FOR ALL
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'essays'
ORDER BY policyname;