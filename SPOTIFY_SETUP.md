# Spotify Integration Setup Guide

Your Spotify "Now Playing" feature is ready to use! Here's how to set it up:

## 🚨 **IMPORTANT: Spotify Requirements Updated** 

As of 2025, Spotify has changed their redirect URI requirements:
- ❌ **`localhost` is NO LONGER ALLOWED** 
- ✅ **Must use `127.0.0.1`** for local development  
- ✅ **HTTPS required** for production URLs

**The code has been updated to use `http://127.0.0.1:8080/callback` automatically.**

## 🎵 Current Configuration

- **Client ID**: `76f5efc0956c4fa4867ddd8f89fc1c59`
- **Client Secret**: `9a585cef5d3943c8909416e28a9bb88e`
- **Redirect URI**: `http://127.0.0.1:8080/callback` (Updated for Spotify requirements)

## 🔧 Spotify App Settings

### For Production (Vercel)

1. **Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)**
2. **Find your app** (Client ID: 76f5efc0956c4fa4867ddd8f89fc1c59)
3. **Click "Edit Settings"**
4. **Add this EXACT Redirect URI**: `https://studio-andy.vercel.app/spotifycallback`
5. **Save changes**

### For Local Development

Spotify requires specific redirect URI formats:
- ✅ **Use this**: `http://127.0.0.1:3000/spotifycallback`
- ❌ **Don't use**: `http://localhost:3000/spotifycallback` (no longer allowed)

## 🚀 Quick Start Guide

### Step 1: Choose Your Setup Method

**Method A: Using ngrok (Most Reliable)**
```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Start ngrok
ngrok http 8080
```

**Method B: Try localhost alternatives**
- Just start: `npm run dev` and try the alternative URLs in Spotify

### Step 2: Configure Spotify Dashboard

1. **Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)**
2. **Find your app** (Client ID: 76f5efc0956c4fa4867ddd8f89fc1c59)  
3. **Click "Edit Settings"**
4. **Add this EXACT Redirect URI**:
   - **For development**: `http://127.0.0.1:8080/callback`
   - **For ngrok**: `https://YOUR_NGROK_URL.ngrok.io/callback` (if using ngrok)
5. **Save changes**

### Step 3: Test the Connection

1. **Open your app** (localhost:8080 or your ngrok URL)
2. **Open browser console** (F12 → Console tab)
3. **Click the music icon** in the bottom system tray
4. **Check console logs** - you'll see the redirect URI being used
5. **Authorize with Spotify** in the popup window
6. **Start playing music** on any Spotify device
7. **Watch it appear** in your retro Mac interface!

## 🎮 Demo Mode

- Click the music icon when connected to **toggle demo mode**
- Demo mode shows random fake tracks for testing
- Great for screenshots and demos when you're not listening to music

## 🔍 Troubleshooting

### "Authentication Failed"
- Make sure the redirect URI is added to your Spotify app settings
- Check that your app credentials are correct

### "Nothing Playing" 
- Start playing music on any Spotify device (phone, computer, etc.)
- The integration will pick up what's currently playing

### Console Errors
- Open browser developer tools to see detailed error messages
- Look for "Spotify:" prefixed log messages

## 📱 Scopes Used

Your app requests these permissions:
- `user-read-currently-playing` - See what you're listening to
- `user-read-playback-state` - Get playback information

## 🎯 Features

- ✅ Real-time "now playing" display
- ✅ Clickable links to Spotify tracks
- ✅ Automatic token refresh
- ✅ Demo mode for testing
- ✅ Retro Mac styling
- ✅ Responsive text truncation

Enjoy your personalized retro Spotify experience! 🎧 