# Essay Upload Debug Report

## 🔍 **Root Cause Analysis**

After thorough investigation, the 406 and 401 errors are caused by **Row Level Security (RLS) policy violations**, not API key or header issues.

### **What's Actually Happening:**

1. **SELECT queries (slug checks)** → ✅ **Working fine** (returns 200 status)
2. **INSERT queries** → ❌ **Failing with HTTP 401** 
   - Error: `"new row violates row-level security policy for table 'essays'"`
   - Code: `42501` (PostgreSQL RLS violation)

### **Why It's Failing:**

The current RLS policy for essays table:
```sql
CREATE POLICY "Authenticated users can insert essays" ON essays 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

**Problem**: Your admin service tries to insert with `user_id: null` using the **anon key** (not authenticated), which violates this policy.

## 🔧 **The Fix**

### **Step 1: Update RLS Policies (Required)**

Run this SQL in your Supabase SQL Editor:

```sql
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
```

### **Step 2: Test the Fix**

After applying the RLS changes:

1. Open your app
2. Admin login with "mimi123" 
3. Try uploading essays again
4. Check browser console - should work now!

### **Step 3: Verify with Manual Test**

Test the fix manually:

```bash
curl -X POST \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Prefer: return=representation" \
  -d '{"title":"Test Essay","content":"Test content","excerpt":"Test excerpt","slug":"test-essay-'$(date +%s)'","published":false,"user_id":null}' \
  https://qqhdahukynuiergmfjou.supabase.co/rest/v1/essays
```

Should return essay data instead of error.

## 🛠️ **Code Issues Found & Fixed**

### **1. Headers Configuration**
The Supabase client config looks correct:
```typescript
global: {
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }
}
```

### **2. Environment Variables**
✅ All properly configured:
- `NEXT_PUBLIC_SUPABASE_URL`: Set correctly
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Valid JWT token
- `SUPABASE_SERVICE_ROLE_KEY`: Available but not used in static export

### **3. Essay Admin Service Logic**
The service correctly:
- Sets `user_id: null` for admin uploads
- Checks for existing slugs before inserting
- Handles errors appropriately

## 🔐 **Security Considerations**

The new RLS policies allow:
- ✅ Anyone to insert essays with `user_id: null` (admin uploads)
- ✅ Authenticated users to manage their own essays
- ✅ Public read access only to published essays
- ❌ App-level password protection ("mimi123") is the main security barrier

For production, consider:
1. Adding IP restrictions
2. Implementing rate limiting
3. Using Supabase Edge Functions for admin operations

## 🧪 **Testing Checklist**

After applying the fix:

- [ ] Slug check queries return 200 (not 406)
- [ ] Essay insert works without 401 errors
- [ ] Admin upload button completes successfully
- [ ] Essays appear in Supabase dashboard
- [ ] Published essays are visible to public
- [ ] Unpublished essays are hidden from public

## 📋 **Quick Debug Commands**

Test connection:
```bash
curl -I -H "apikey: YOUR_ANON_KEY" https://qqhdahukynuiergmfjou.supabase.co/rest/v1/essays
```

Test slug check:
```bash
curl -H "apikey: YOUR_ANON_KEY" "https://qqhdahukynuiergmfjou.supabase.co/rest/v1/essays?slug=eq.test&select=id"
```

Test insert:
```bash
curl -X POST -H "Content-Type: application/json" -H "apikey: YOUR_ANON_KEY" -d '{"title":"Test","content":"Test","slug":"test-'$(date +%s)'","user_id":null}' https://qqhdahukynuiergmfjou.supabase.co/rest/v1/essays
```

## 🎯 **Summary**

The issues were **NOT** related to:
- ❌ API keys or authentication tokens
- ❌ HTTP headers or content negotiation
- ❌ Network connectivity
- ❌ Supabase client configuration

The issues **WERE** caused by:
- ✅ Restrictive RLS policies not allowing null user_id inserts
- ✅ Static export limitations requiring anon key usage

**Fix**: Update RLS policies to allow admin uploads with null user_id.