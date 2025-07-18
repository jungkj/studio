# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start Next.js development server on port 3000
- `npm run build` - Production build with Next.js
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with Next.js configuration

### Testing
**Note**: No testing framework is currently configured. To add testing:
1. Install Jest: `npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom`
2. Add test script to package.json: `"test": "jest"`
3. Create jest.config.js for Next.js

## Architecture Overview

This is a React TypeScript application featuring a retro Mac OS-style desktop environment with multiple integrated applications.

### Tech Stack
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Next.js 15.4.1
- **Styling**: Tailwind CSS with custom macOS-inspired design system
- **UI Components**: Shadcn/UI (50+ pre-installed components)
- **State Management**: React Query (TanStack Query)
- **Backend**: Supabase (auth, database, real-time)
- **External APIs**: Spotify Web API

### Project Structure
```
app/
├── layout.tsx       # Root layout with providers
├── page.tsx         # Home page (main desktop)
├── not-found.tsx    # 404 page
└── spotify-callback/ # Spotify OAuth callback route
src/
├── components/      # UI components (all shadcn/ui components pre-installed)
├── hooks/           # Custom hooks (useAuth, useSpotify, etc.)  
├── utils/           # Services and utilities
└── globals.css      # Global styles
```

### Key Features
1. **Desktop Environment**: Draggable windows, menu bar, system tray
2. **Applications**: Essays, Portfolio, Games, Terminal, Calculator, Spotify visualizer
3. **Authentication**: Supabase auth with email/OAuth
4. **Audio Visualization**: Real-time audio analysis with Web Audio API
5. **Data Persistence**: Supabase database for essays, projects, comments

### Development Guidelines

1. **Component Creation**:
   - Use TypeScript for all code
   - Prefer shadcn/ui components (all available in src/components/ui/)
   - Update Index.tsx when adding new desktop apps
   - Follow existing window component patterns

2. **Styling**:
   - Use Tailwind CSS exclusively
   - Custom colors available: mac-[light/medium/darker/dark]-gray, apple-blue, cream-[25-900]
   - Font: "Press Start 2P" (pixelated, set as default)
   - Follow retro Mac OS aesthetic

3. **Routing**:
   - Next.js App Router with file-based routing
   - Desktop apps open as windows, not separate routes
   - Client components marked with 'use client' directive

4. **Backend Integration**:
   - Supabase client configured in utils/supabaseConfig.ts
   - Use hooks/useAuth.ts for authentication
   - Row-level security enabled on all tables

5. **Environment Variables**:
   - Use VITE_ prefix for client-side variables
   - Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
   - For Spotify: VITE_SPOTIFY_CLIENT_ID, VITE_SPOTIFY_REDIRECT_URI

### Important Files
- **AI_RULES.md**: Basic development guidelines
- **SPOTIFY_SETUP.md**: Spotify integration setup and troubleshooting
- **AUDIO_VISUALIZER_IMPLEMENTATION.md**: Audio visualization technical details
- **SUPABASE_SETUP.md**: Database schema and setup instructions

### Database Schema (Supabase)
- `profiles`: User profiles linked to auth.users
- `projects`: Portfolio projects with categories
- `essays`: Blog posts with markdown content
- `categories`: Taxonomy for projects/essays
- `comments`: Comments on essays

### Common Tasks

**Adding a new desktop application**:
1. Create component in src/components/
2. Add to APPLICATIONS array in pages/Index.tsx
3. Follow existing app patterns (Calculator.tsx, Terminal.tsx as examples)

**Modifying UI components**:
- All shadcn/ui components are in src/components/ui/
- Maintain consistent styling with existing components

**Working with Spotify integration**:
- Service: utils/spotifyService.ts
- Hook: hooks/useSpotify.ts
- Requires HTTPS in production