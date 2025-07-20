# Deployment Guide for Vercel

## Prerequisites

1. A Vercel account (https://vercel.com)
2. Spotify Developer App credentials
3. Supabase project (optional)
4. YouTube Data API key

## Environment Variables

Set these in your Vercel project settings:

### Required Variables

```bash
# Spotify (get from https://developer.spotify.com/dashboard)
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://your-domain.vercel.app/spotifycallback
NEXT_PUBLIC_SPOTIFY_DEFAULT_PLAYLIST_ID=your_playlist_id
NEXT_PUBLIC_SPOTIFY_DEFAULT_PLAYLIST_URI=spotify:playlist:your_playlist_id

# YouTube (get from https://console.cloud.google.com)
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
```

### Optional Variables

```bash
# Supabase (if using backend features)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deployment Steps

### 1. Configure Spotify App

1. Go to https://developer.spotify.com/dashboard
2. Create or select your app
3. Add your redirect URIs:
   - Production: `https://your-domain.vercel.app/spotifycallback`
   - Local development: `http://127.0.0.1:3000/spotifycallback`
   - Note: Spotify doesn't allow `localhost` or dashes in paths, use `127.0.0.1` instead

### 2. Deploy to Vercel

#### Option A: Deploy via GitHub

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables
4. Deploy

#### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add VITE_SPOTIFY_CLIENT_ID
vercel env add VITE_SPOTIFY_CLIENT_SECRET
vercel env add VITE_SPOTIFY_REDIRECT_URI
vercel env add VITE_YOUTUBE_API_KEY
# ... add other variables

# Deploy with environment variables
vercel --prod
```

### 3. Post-Deployment

1. Test Spotify authentication flow
2. Verify YouTube search functionality
3. Check all visualizer features

## Troubleshooting

### Spotify Auth Issues

- Ensure redirect URI matches exactly (including https://)
- Check that client ID and secret are correct
- Verify app is not in development mode (for >25 users)

### YouTube API Issues

- Check API key is valid and has YouTube Data API v3 enabled
- Verify quota hasn't been exceeded (10,000 units/day free tier)
- Ensure API key restrictions allow your domain

### Build Issues

- Clear cache: `vercel --force`
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Spotify redirect URI added to app settings
- [ ] YouTube API key configured and tested
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Custom domain configured (optional)
- [ ] Analytics/monitoring set up (optional)

## Security Notes

- Never commit `.env.local` file
- Use Vercel's environment variables for secrets
- Restrict YouTube API key to your domain
- Enable Spotify app rate limiting if needed