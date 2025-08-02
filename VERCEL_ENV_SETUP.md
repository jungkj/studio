# Setting Up Environment Variables on Vercel

## Important Security Note
⚠️ **NEVER** prefix the service role key with `NEXT_PUBLIC_` - this would expose it to the client and compromise your database security!

## Steps to Add Service Role Key to Vercel

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (azure-mongoose-wiggle or studio)
3. Go to "Settings" tab
4. Click on "Environment Variables" in the left sidebar
5. Add the following variable:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Your service role key (the one you just added to .env.local)
   - **Environment**: Select all (Production, Preview, Development)
6. Click "Save"

### Option 2: Via Vercel CLI

If you have the Vercel CLI installed:

```bash
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

Then paste your service role key when prompted.

## Trigger a New Deployment

After adding the environment variable, you need to redeploy:

### Option A: From Vercel Dashboard
1. Go to your project's dashboard
2. Go to "Deployments" tab
3. Click the three dots on the latest deployment
4. Select "Redeploy"

### Option B: Push a Commit
```bash
git add .
git commit -m "Configure production environment for admin uploads"
git push origin main
```

## Verify It's Working

1. Once deployed, visit your production site
2. Go to Settings → Admin Access → Enter password (mimi123)
3. Try uploading essays
4. Check the browser console - you should no longer see the "Service role key not available" message

## Security Best Practices

1. **Never expose the service role key** - It should NOT have `NEXT_PUBLIC_` prefix
2. **Rotate keys periodically** - You can regenerate keys in Supabase dashboard
3. **Monitor usage** - Check Supabase logs for unusual activity
4. **Limit admin access** - Consider changing the admin password from "mimi123" to something more secure

## Troubleshooting

If uploads still don't work after deployment:

1. **Check Vercel logs**: Project → Functions tab → View logs
2. **Verify environment variable**: Settings → Environment Variables (value will be hidden)
3. **Clear browser cache**: Sometimes old deployments are cached
4. **Check build logs**: Ensure the build completed without errors

## Additional Environment Variables

Make sure all these are also set in Vercel:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (no NEXT_PUBLIC prefix!)
- ✅ `NEXT_PUBLIC_SPOTIFY_CLIENT_ID`
- ✅ `SPOTIFY_CLIENT_SECRET`
- ✅ `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI`
- ✅ `NEXT_PUBLIC_YOUTUBE_API_KEY`

Note: Only variables with `NEXT_PUBLIC_` prefix are exposed to the browser. Others remain server-side only.