#+ 🎵 Self Music - Personal Music Library

![Self Music Banner](https://img.shields.io/badge/Self%20Music-🎶-ff69b4?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)

<div align="center">

**🌟 A modern personal music management and playback system with playlists, synced lyrics, and responsive UI.**

[🚀 Quick Start](#-quick-start) •
[✨ Features](#-features) •
[🛠️ Tech Stack](#️-tech-stack) •
[🤝 Contributing](#-contributing)

</div>

---

## 📖 Overview

Self Music is a personal music system designed for individuals or small teams. It offers an elegant UI, smooth playback, playlist management, synced lyrics, and public browsing of artists/albums/playlists. An admin console with JWT authentication is built in.

### 🎯 Highlights

- 🎨 Modern UI: shadcn/ui + Tailwind CSS 4
- 📱 Responsive Layout: desktop and mobile friendly
- 🔐 Secure Admin: JWT-protected admin console
- 🎧 Playback: HTML5 audio with LRC/plaintext lyric parsing and synchronized scrolling
- 🎛️ Controls: progress, volume, shuffle, repeat, previous/next
- 🌓 Theme: light/dark modes via next-themes

---

## ✨ Features

### 🎛 Playback & Experience
- 🎵 Playlists: queue support, play from list, jump to song
- 📝 Lyrics: LRC/plain text parsing, full-screen lyrics with scrolling highlight
- 🔁 Modes: shuffle / list repeat / single repeat
- 💾 Local persistence: playlist and state via localStorage
- ⚡ Streaming: backend serves local audio files with `Accept-Ranges`

### 🎭 Browse & Categories
- 👤 Artists: list/detail, artist songs and albums
- 💿 Albums: list/detail, album songs
- 📂 Playlists: browse public playlists and play
- 😊 Moods: mood-based categorization (backend support)

### 🛠 Admin Console (/admin)
- ✅ Full CRUD for artists, albums, songs, moods, playlists
- 🔃 Playlist reorder: maintain custom order in responses
- ⬆️ File upload: audio file uploads stored under `/uploads`
- 📦 Batch import: import song/album/artist with lyrics and audio URLs
- 👤 Default admin: `admin / admin123`

### 🔐 Security
- 🛡️ JWT auth: Bearer token for admin endpoints
- 🌐 CORS: permissive in dev; restrict in production

---

## 🛠️ Tech Stack

### Backend
- 🐍 FastAPI `^0.104`
- 🚀 Uvicorn `^0.24`
- 💾 SQLite (`backend/music.db`)
- 🔐 PyJWT + HTTP Bearer
- 🎼 Mutagen (audio metadata)
- 📦 python-multipart (uploads)

### Frontend
- ⚛️ Next.js `15.4.x` + React `19`
- 📘 TypeScript `^5`
- 🎨 Tailwind CSS `4`
- 🧩 shadcn/ui + Radix UI
- 🗃 Zustand (state)
- 🌗 next-themes (theme)
- 🎬 framer-motion (animation)

---

## 🚀 Quick Start

### 📋 Requirements
- 🐍 Python 3.8+
- 📦 Node.js 18+
- 🔧 Package manager: pnpm (or npm)

### 1) Clone
```bash
git clone https://github.com/zkeq/Self-music.git
cd Self-music
```

### 2) Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```
- API: `http://localhost:8000`
- Docs: `http://localhost:8000/docs`
- Default admin: `admin / admin123`

> In production, configure a secure `SECRET_KEY` and restrict CORS to trusted origins.

### 3) Frontend (Next.js)
```bash
cd ../frontend
pnpm install   # or npm install
# Optional (defaults to http://localhost:8000/api):
# echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
pnpm dev       # or npm run dev
```
- App: `http://localhost:3000`

### 4) Key Routes
- 🏠 Home: `/`
- 🎧 Player: `/play` and `/play/[id]`
- 🎵 Songs: `/songs`
- 👤 Artists: `/artists` and `/artist/[id]`
- 💿 Albums: `/albums` (if enabled)
- 📂 Playlists: `/playlists` and `/playlist/[id]`
- 🔐 Admin Login: `/admin/login`

---

## 📁 Project Structure

```
Self-Music/
├── backend/
│   ├── main.py
│   ├── user.py
│   ├── music.db
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── styles/
│   └── package.json
├── AGENTS.md
├── README.md        # Chinese
└── README.en.md     # English (this file)
```

---

## 📚 API Summary (sample)

- Public
  - `GET /api/songs` • `GET /api/songs/{id}` • `GET /api/songs/{id}/stream`
  - `GET /api/artists` • `GET /api/artists/{id}` • `GET /api/artists/{id}/songs` • `GET /api/artists/{id}/albums`
  - `GET /api/albums` • `GET /api/albums/{id}` • `GET /api/albums/{id}/songs`
  - `GET /api/playlists` • `GET /api/playlists/{id}`

- Admin (Bearer token)
  - `POST /api/auth/login`
  - CRUD at `/api/admin/{artists|albums|songs|moods|playlists}`
  - `PUT /api/admin/playlists/{id}/reorder`
  - `POST /api/admin/upload`
  - `POST /api/admin/import/*`

> See Swagger at `/docs` when backend is running.

---

## 🐛 Troubleshooting

- Backend fails to start
  - Check Python version and dependencies
  - Ensure port `8000` is free
- Audio not playing
  - `songs.audioUrl` must be a valid local path
  - File exists and server can read it
- CORS errors
  - Dev is permissive; restrict origins in production
- CSS issues
  - Reinstall deps or verify Tailwind setup

---

## 🚀 Deployment

- Backend
  - Run with `uvicorn`/`gunicorn` behind Nginx/Caddy
  - Configure `SECRET_KEY`, restrict CORS, persist `music.db` and `uploads/`
- Frontend
  - Any static host or Vercel
  - Set `NEXT_PUBLIC_API_URL` to your API, e.g., `https://api.example.com/api`

---

## 🤝 Contributing

- Ensure builds pass, `pnpm lint` is clean, and API runs locally
- Follow repository conventions in `AGENTS.md`
- Welcome: bug reports, feature requests, docs improvements, i18n

---

## 📄 License

MIT License — see [LICENSE](LICENSE).

---

<div align="center">

**⭐ If you find this project useful, please star it! ⭐**

Made with ❤️ for music lovers.

</div>

wake vercel. 001