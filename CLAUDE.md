# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Self-Music is a modern music streaming platform built with a FastAPI backend and Next.js 15 frontend. The project focuses on providing an elegant music playback experience with real-time lyrics synchronization, glassmorphism effects, mood-based categorization, and playlist management.

## Development Commands

### Frontend (Next.js + TypeScript)
- **Development**: `cd frontend && pnpm dev` (or `npm run dev`)
- **Production Build**: `cd frontend && pnpm build` 
- **Linting**: `cd frontend && pnpm lint`
- **Type Checking**: TypeScript compilation happens during build - no separate type-check script available

### Backend (FastAPI + Python)
- **Install Dependencies**: `cd backend && pip install -r requirements.txt`
- **Development Server**: `uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000`
- **Production Server**: `uvicorn backend.main:app --host 0.0.0.0 --port 8000`

### Database
- **Location**: `backend/music.db` (SQLite)
- **File Storage**: Audio files in `/uploads/`, static assets in `/static/`

## Architecture Overview

### Backend Architecture (Flat Structure)
- **Single-file API**: `backend/main.py` contains all admin routes, models, and authentication
- **User Routes**: `backend/user.py` contains public-facing API endpoints (no auth required)
- **Authentication**: JWT-based with Bearer tokens, default admin: `admin/admin123`
- **Database**: SQLite with raw SQL queries (no ORM)
- **File Handling**: Mutagen for audio metadata extraction, static file serving for audio streaming

### Frontend Architecture (App Router)
- **State Management**: Zustand stores in `src/lib/store.ts` and `src/lib/data-stores.ts`
- **Audio Handling**: HTML5 Audio API with custom player controls
- **UI Framework**: ShadCN/UI components with Tailwind CSS 4
- **Routing**: Next.js 15 App Router (`src/app/`)
- **Core Features**: 
  - Real-time lyrics synchronization (`src/lib/lyrics-parser.ts`)
  - Playlist management with reordering (`src/lib/playlist-manager.ts`)
  - Glassmorphism effects based on album artwork colors
  - Theme switching with next-themes

### Key Components Structure
- **Player Core**: `src/components/player-layout.tsx`, `src/components/bottom-player.tsx`
- **Audio Management**: `src/components/audio-manager.tsx`
- **Lyrics System**: `src/components/lyrics-display.tsx`, `src/components/fullscreen-lyrics.tsx`
- **Data Display**: `src/components/song-card.tsx`, `src/components/artist-card.tsx`, `src/components/playlist-card.tsx`
- **Admin Interface**: `src/app/admin/` directory with full CRUD operations

## API Integration

The frontend communicates with the backend through:
- **Public API**: `src/lib/api.ts` - songs, artists, albums, playlists (no auth)
- **Admin API**: `src/lib/admin-api.ts` - management operations (JWT required)
- **Environment Config**: `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000/api`)

## Development Workflow

### Code Style
- **Frontend**: 2-space indentation, kebab-case file names, TypeScript strict mode
- **Components**: Functional components with hooks, utility-first Tailwind CSS
- **Imports**: Use `@/` path alias for src directory
- **Backend**: Python with Pydantic models, clear endpoint separation

### Testing Strategy
- No formal test suite currently implemented
- **Manual Testing**: Verify core flows (playback, lyrics sync, playlist management)
- **API Testing**: Use browser dev tools or REST clients for endpoint validation
- **Database**: Verify SQLite persistence and data integrity

### Key Files to Understand
- **Player State**: `src/lib/store.ts` - central audio player state with Zustand
- **Data Stores**: `src/lib/data-stores.ts` - API data caching and management
- **Lyrics Parser**: `src/lib/lyrics-parser.ts` - LRC format parsing and synchronization
- **API Layer**: `src/lib/api.ts` and `src/lib/admin-api.ts` - backend communication
- **Main Backend**: `backend/main.py` - all admin routes and authentication logic
- **User Backend**: `backend/user.py` - public API endpoints

### Build and Deployment
- **Frontend**: Static build with `pnpm build`, deployable to Vercel or any static host
- **Backend**: ASGI server with uvicorn, requires Python 3.8+, SQLite database persistence
- **Environment**: Configure `NEXT_PUBLIC_API_URL` for production backend URL

## Important Notes

- **Audio Streaming**: Backend serves audio files via `/api/songs/{id}/stream` endpoint
- **File Uploads**: Admin interface supports audio file upload to `/uploads/` directory  
- **Lyrics Format**: Supports LRC format with time-coded lyrics for synchronization
- **Mood System**: Songs can be tagged with mood categories for filtered playback
- **Playlist Features**: Support for drag-and-drop reordering and song duplication
- **Mobile Support**: Responsive design with touch-friendly controls
- **Theme Support**: Built-in dark/light mode switching

## Security Considerations

- **JWT Secret**: Change `SECRET_KEY` in `backend/main.py` for production
- **CORS Policy**: Currently allows all origins - restrict for production
- **Admin Access**: Default credentials should be changed: `admin/admin123`
- **File Security**: Validate uploaded audio files and sanitize file paths