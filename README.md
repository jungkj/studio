# Mac OS Classic Desktop Environment

A nostalgic Mac OS classic-themed desktop environment built with React, featuring Spotify integration, games, and productivity apps.

## Features

- 🖥️ **Classic Mac OS Interface**: Pixel-perfect recreation of the classic Mac aesthetic
- 🎵 **Spotify Integration**: Full music playback with YouTube audio and real-time visualization
- 🎮 **Built-in Games**: Tic-Tac-Toe, Snake, Sudoku, and Solitaire
- 📝 **Productivity Apps**: Calculator, Terminal, Clock, and more
- 🎨 **Audio Visualizer**: Real-time frequency analysis with Spotify track sync

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your API keys to .env.local

# Start development server
npm run dev
```

## Spotify Setup

1. Create a Spotify app at https://developer.spotify.com/dashboard
2. Add `http://localhost:8080/callback` to redirect URIs
3. Copy your Client ID and Secret to `.env.local`

## YouTube Integration

1. Get an API key from https://console.cloud.google.com
2. Enable YouTube Data API v3
3. Add the key to `.env.local`

## Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed Vercel deployment instructions.

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Shadcn/UI Components
- Spotify Web API
- YouTube IFrame API
- Supabase (optional backend)
