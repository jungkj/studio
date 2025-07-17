# Mac OS Classic Desktop Environment

## What is this?

Step back into the 1990s with this nostalgic recreation of the classic Mac OS desktop experience! This isn't just a website—it's a fully functional desktop environment that runs in your browser, complete with authentic pixel-perfect styling, classic system sounds, and that familiar Mac OS charm we all remember.

**Experience the nostalgia:**
- **Click and drag windows** around your virtual desktop just like the old days
- **Launch classic apps** from desktop icons with that satisfying double-click
- **Listen to your Spotify music** with a retro-styled player and mesmerizing audio visualizer
- **Play timeless games** like Snake, Tic-Tac-Toe, Sudoku, and Solitaire
- **Use productivity tools** including a calculator, terminal, and clock—all with that vintage Mac aesthetic

Whether you're feeling nostalgic for the good old days of computing or you're curious about what desktop computing was like before smartphones, this interactive experience lets you explore, play, and work in a beautifully recreated classic Mac environment.

Perfect for anyone who misses the simplicity and charm of classic operating systems, or for showing younger generations what computing used to look like!

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
