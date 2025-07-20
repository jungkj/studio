# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start Next.js development server on port 3000
- `npm run build` - Production build with static export
- `npm run start` - Start production server  
- `npm run lint` - Run ESLint with Next.js configuration

### Testing
**Note**: No testing framework is currently configured. To add testing:
1. Install Jest: `npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom`
2. Add test script to package.json: `"test": "jest"`
3. Create jest.config.js for Next.js

## Architecture Overview

This is a retro Mac OS-style desktop environment built with React/Next.js that runs entirely in the browser as a single-page application, featuring multiple integrated desktop applications.

### Tech Stack
- **Framework**: Next.js 15.4.1 (React 18.3.1 with TypeScript 5.5.3)
- **Styling**: Tailwind CSS 3.4.11 with custom macOS-inspired design system
- **UI Components**: Shadcn/UI (50+ pre-installed components in src/components/ui/)
- **State Management**: TanStack Query 5.56.2 (React Query) for server state
- **Backend**: Supabase 2.50.2 (optional - auth, database, real-time)
- **External APIs**: Spotify Web API, YouTube Data API v3
- **Window Management**: react-draggable 4.5.0
- **Font**: "Press Start 2P" (pixelated retro font)

### Project Structure
```
app/
├── layout.tsx          # Root layout with providers
├── page.tsx            # Home page (main desktop)
├── not-found.tsx       # 404 page
└── spotifycallback/   # Spotify OAuth callback
src/
├── components/         # UI components
│   ├── ui/            # All shadcn/ui components (50+)
│   ├── Desktop.tsx    # Main desktop environment manager
│   ├── Window.tsx     # Base window component
│   └── [apps]/        # Desktop applications
├── hooks/             # Custom React hooks
├── scripts/           # Utility scripts
└── utils/             # Services and utilities
```

### Key Architectural Patterns

1. **Desktop-in-Browser Architecture**:
   - Single-page application simulating a desktop OS
   - No routing - all apps open as draggable windows
   - Window management centralized in Desktop.tsx
   - Z-index management for window stacking
   - Custom event system for window lifecycle

2. **Static Export Configuration**:
   - `output: 'export'` in next.config.mjs
   - No server-side rendering - pure client-side
   - All API calls happen client-side
   - OAuth flows handled via client-side redirects

3. **Window Application Pattern**:
   - Each app extends base Window component
   - Apps stored in APPLICATIONS array in Desktop.tsx
   - Window state includes: isOpen, zIndex, position
   - Use `'use client'` directive for all components

### Development Guidelines

1. **Component Creation**:
   - Use TypeScript for all components
   - Place new desktop apps in src/components/
   - Update APPLICATIONS array in Desktop.tsx (not app/page.tsx)
   - Follow window component patterns (see Calculator.tsx, Terminal.tsx)
   - Use 'use client' directive for client components

2. **Styling**:
   - Use Tailwind CSS exclusively
   - Custom colors: mac-[light/medium/darker/dark]-gray, apple-blue, cream-[25-900]
   - Maintain retro Mac OS aesthetic
   - Window chrome uses specific patterns (see Window.tsx)

3. **State Management**:
   - Use React Query for server state
   - Custom hooks in src/hooks/ for shared logic
   - Avoid prop drilling - use context when needed
   - Window states managed by Desktop component

4. **Backend Integration**:
   - Supabase client: utils/supabaseConfig.ts
   - Auth hook: hooks/useAuth.ts
   - Services: essayService.ts, spotifyService.ts, youtubeAudioService.ts
   - All database tables have RLS enabled

5. **Environment Variables**:
   - Client-side: NEXT_PUBLIC_ prefix required
   - Spotify: NEXT_PUBLIC_SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET
   - YouTube: NEXT_PUBLIC_YOUTUBE_API_KEY
   - Supabase (optional): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

### Database Schema (Supabase)
- `profiles`: User profiles (extends auth.users)
- `projects`: Portfolio items with status tracking
- `essays`: Blog posts with markdown support
- `categories`: Taxonomy system
- `comments`: Nested comments with moderation

### Common Tasks

**Adding a new desktop application**:
1. Create component in src/components/
2. Add to APPLICATIONS array in Desktop.tsx with icon, title, component
3. Follow existing patterns for window management

**Working with Supabase**:
- Check SUPABASE_SETUP.md for schema details
- Use row-level security for all queries
- Handle auth state with useAuth hook

**Spotify Integration**:
- Setup guide: SPOTIFY_SETUP.md
- Service: utils/spotifyService.ts
- Requires HTTPS in production (use ngrok for local development)
- OAuth flow through /spotifycallback route
- Redirect URI must use 127.0.0.1, not localhost

### Important Notes
- Static export configured (`output: 'export'`)
- No server-side rendering - client-side only
- Desktop metaphor - apps open as windows, not routes
- Audio features require user interaction to start (browser security)
- TypeScript strict mode is disabled (`strict: false` in tsconfig.json)
- Path alias configured: `@/*` maps to `./src/*`

### Essay Quotes
To add a quote at the top of an essay, start the content with:
- `> "Quote text"` - for a quote without attribution
- `> "Quote text" - Author Name` - for a quote with attribution
- `>> "Quote text" - Author Name` - alternative format

The quote will be displayed in italics with a separator line below it.