<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.2-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Express-4.19-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Audius-API-7E1BCC?style=flat-square" alt="Audius" />
</p>

# 🎵 OBLIVION

**Discover. Stream. Collect. — A modern full-stack music streaming platform powered by the decentralized Audius network.**

---

## Overview

OBLIVION is a full-stack music streaming web application that connects users to millions of tracks from independent artists worldwide through the [Audius](https://audius.co) decentralized music protocol. It combines a sleek, dark-themed React frontend with a robust Express REST API to deliver real-time music discovery, streaming, and personal library management.

Unlike traditional streaming services locked behind subscription paywalls, OBLIVION leverages the open Audius network — giving users free, instant access to a vast catalog of music from artists who own their content. The platform is designed for music enthusiasts who value discovery, with genre browsing, mood-based exploration, trending feeds, and a personal saved library.

---

## Features

### 🎧 Music Discovery & Browsing
- **Home feed** with genre-categorized carousels (Pop, Hip-Hop, Electronic, Rock, R&B, Lo-Fi, Ambient, Dance)
- **Featured banner** showcasing trending tracks with auto-rotation
- **Discover page** with 16+ browsable genres, mood-based discovery (Chill, Focus, Energetic, Late Night, Happy, Melancholic, Dreamy, Workout, Relax, Party), trending tracks, fresh releases, and curated recommendations
- **Animated sections** with intersection observer–driven reveal animations

### 🔍 Search
- **Real-time search** with debounced input (300ms) across tracks, artists, and genres
- **Dual view modes** — toggle between grid cards and list view
- **URL-synchronized queries** via search params (`/search?q=...`)
- Skeleton loading states with shimmer animations

### ▶️ Music Player
- **Persistent audio player** docked at the bottom of the viewport
- Full playback controls: play/pause, skip forward/back, seek via progress bar
- **Volume control** with mute toggle and visual volume icons
- **Queue management** — tracks play in sequence with automatic advancement
- **Keyboard shortcuts** — `Space` to toggle play, `Ctrl/Cmd + →/←` for next/previous
- **Responsive design** — compact mini-player on mobile with expandable full-screen player view
- Loading spinner during audio buffer

### 🔐 Authentication
- **Email/password** signup and login via Firebase Authentication
- **Google OAuth** sign-in with one-click popup flow
- Automatic user sync — Firebase tokens are verified server-side via Firebase Admin SDK, and user profiles are created/retrieved in MongoDB
- Persistent sessions with `onAuthStateChanged` listener
- Client-side form validation with descriptive error messages

### 📚 Personal Library
- **Save tracks** to a personal, per-user library stored in MongoDB
- **Remove tracks** from the library
- **Duplicate prevention** via compound unique index (`userId` + `audiusTrackId`)
- **Play all** functionality to queue the entire library
- Tabs for viewing all saved tracks or recent additions

### 🎼 Playlists
- **Create playlists** with title and optional description via modal UI
- **Delete playlists**
- **Play entire playlists** from the playlist card overlay
- Client-side playlist management with card-based grid layout

### 🎨 UI / UX
- **Dark theme** with custom design tokens — `background: #0a0a0a`, `surface: #141414`, `muted: #2a2a2a`
- **Inter** typeface loaded from Google Fonts
- **Tailwind CSS** utility-first styling with custom color palette
- **Glassmorphism** effects on navbar and player (`backdrop-blur`)
- **Micro-animations** — page transitions, fade-ins, shimmer skeletons, hover scale effects
- **Fully responsive** — mobile-first with breakpoints for `sm`, `md`, `lg`, `xl`
- Animated loading screen on initial app load
- **Lucide React** icon library throughout

### ⚙️ Backend / API
- RESTful Express API with structured route → controller → service architecture
- **Audius integration** service with track normalization, deduplication, and error handling
- **Health check** endpoint (`GET /api/health`)
- CORS configured for local development and production origins
- Centralized error handling with environment-aware error messages
- **Zod** available for request validation
- **Input validation** with schema-driven request body sanitization

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite 5 |
| **Styling** | Tailwind CSS 3, PostCSS, Autoprefixer |
| **State Management** | Zustand |
| **Routing** | React Router DOM v6 |
| **Icons** | Lucide React |
| **HTTP Client** | Axios |
| **Backend** | Node.js, Express 4, TypeScript |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Authentication** | Firebase Authentication (Client SDK) + Firebase Admin SDK (Server) |
| **Music API** | Audius API (v1) |
| **Validation** | Zod |
| **Dev Tooling** | tsx (watch mode), ESLint, `@vitejs/plugin-react` |
| **Frontend Deployment** | Vercel |
| **Backend Deployment** | Render |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Client                           │
│  React + TypeScript + Vite (Vercel)                     │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │  Zustand  │  │ Firebase │  │   Axios HTTP Client    │ │
│  │  Stores   │  │ Auth SDK │  │   (→ /api/*)           │ │
│  └──────────┘  └────┬─────┘  └───────────┬────────────┘ │
└──────────────────────┼───────────────────┼──────────────┘
                       │ ID Token          │ REST
                       ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                    Express API (Render)                  │
│                                                         │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Auth       │  │ Music        │  │ Library          │  │
│  │ Controller │  │ Controller   │  │ Controller       │  │
│  └─────┬──────┘  └──────┬───────┘  └───────┬─────────┘  │
│        │                │                   │            │
│  ┌─────▼──────┐  ┌──────▼───────┐  ┌───────▼─────────┐  │
│  │ Firebase   │  │ Audius       │  │ MongoDB         │  │
│  │ Admin SDK  │  │ Service      │  │ (Mongoose)      │  │
│  └────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │                │                   │
         ▼                ▼                   ▼
   ┌──────────┐    ┌────────────┐     ┌────────────┐
   │ Firebase │    │ Audius     │     │ MongoDB    │
   │ Auth     │    │ Network    │     │ Atlas      │
   └──────────┘    └────────────┘     └────────────┘
```

### How It Works

**Frontend** — The React SPA handles routing (React Router), UI rendering, global state (Zustand stores for auth and player), and communicates with the backend via Axios. Firebase Client SDK manages authentication flows (email/password and Google OAuth) on the browser.

**Backend** — The Express server exposes a REST API under `/api/*`. It verifies Firebase ID tokens using the Firebase Admin SDK, queries the Audius network for music data (trending, search, genre, new releases), and performs CRUD operations on MongoDB for user profiles and saved library tracks.

**Authentication Flow:**
1. User signs up or logs in via Firebase (email/password or Google popup)
2. Firebase returns an ID token to the client
3. Client sends the ID token to `POST /api/auth/google`
4. Server verifies the token with Firebase Admin SDK
5. Server creates or retrieves the user in MongoDB
6. User profile is returned to the client and stored in Zustand

**Audius Integration** — The backend's `audius.service.ts` communicates with the Audius v1 API to search tracks, fetch trending content, get new releases, and filter by genre. All responses are normalized into a consistent `OblivionTrack` schema and deduplicated before being sent to the client.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/google` | Verify Firebase token & sync user |
| `GET` | `/api/music/search?q=&limit=` | Search tracks via Audius |
| `GET` | `/api/music/trending?limit=` | Get trending tracks |
| `GET` | `/api/music/new-releases?limit=` | Get new releases |
| `GET` | `/api/music/genre?genre=&limit=` | Get tracks by genre |
| `GET` | `/api/library?userId=` | Get user's saved library |
| `POST` | `/api/library` | Save a track to library |
| `DELETE` | `/api/library/:audiusTrackId?userId=` | Remove a track from library |

---

## Project Structure

```
Oblivion/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── music/               # MusicCard, MusicCarousel, FeaturedBanner, Artwork, AnimatedSection
│   │   │   ├── AuthListener.tsx     # Firebase auth state observer
│   │   │   ├── GenreCard.tsx        # Genre browsing card
│   │   │   ├── MoodCard.tsx         # Mood-based discovery card
│   │   │   ├── MusicPlayer.tsx      # Persistent audio player
│   │   │   ├── Navbar.tsx           # Responsive navigation bar
│   │   │   ├── TrackList.tsx        # List-view track rendering
│   │   │   └── LoadingScreen.tsx    # Animated loading splash
│   │   ├── pages/
│   │   │   ├── Home.tsx             # Landing page with genre carousels
│   │   │   ├── Discover.tsx         # Genre, mood, trending discovery
│   │   │   ├── Search.tsx           # Real-time search with dual view
│   │   │   ├── Library.tsx          # Personal saved tracks
│   │   │   ├── Playlists.tsx        # Playlist creation & management
│   │   │   ├── Login.tsx            # Email/password & Google login
│   │   │   └── Signup.tsx           # Email/password & Google signup
│   │   ├── stores/
│   │   │   ├── authStore.ts         # Zustand auth state
│   │   │   └── playerStore.ts       # Zustand player/queue state
│   │   ├── services/
│   │   │   └── api.ts               # Axios client (musicApi, libraryApi)
│   │   ├── config/
│   │   │   └── firebase.ts          # Firebase client initialization
│   │   ├── hooks/
│   │   │   └── useIntersectionObserver.ts
│   │   ├── layouts/
│   │   │   └── Layout.tsx           # App shell (Navbar + MusicPlayer + Outlet)
│   │   ├── types/
│   │   │   └── index.ts             # Track, User, Playlist interfaces
│   │   ├── utils/
│   │   │   └── cn.ts                # Class name utility
│   │   ├── App.tsx                  # Route definitions
│   │   ├── main.tsx                 # React entry point
│   │   └── index.css                # Global styles & Tailwind directives
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts                # MongoDB/Mongoose connection
│   │   │   └── firebase-admin.ts    # Firebase Admin SDK initialization
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts   # Firebase token verification & user sync
│   │   │   ├── music.controller.ts  # Audius search, trending, genre handlers
│   │   │   └── library.controller.ts # Library CRUD operations
│   │   ├── models/
│   │   │   ├── user.model.ts        # User schema (firebaseUid, email, username, avatar)
│   │   │   └── libraryTrack.model.ts # Saved track schema with compound unique index
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── music.routes.ts
│   │   │   ├── library.routes.ts
│   │   │   └── health.routes.ts
│   │   ├── services/
│   │   │   └── audius.service.ts    # Audius API client, normalization, deduplication
│   │   └── server.ts               # Express app factory, CORS, middleware, startup
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
├── package.json                     # Root workspace config (npm workspaces)
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** — a running instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **Firebase project** — with Authentication enabled (Email/Password + Google providers)
- **Audius API key** — obtainable from [Audius Developer Portal](https://docs.audius.org/)

### Clone the Repository

```bash
git clone https://github.com/Mohd-riyaz/Oblivion.git
cd Oblivion
```

### Install Dependencies

The project uses **npm workspaces**. Installing from the root installs both `client` and `server` dependencies:

```bash
npm install
```

### Environment Variables

Create `.env` files in both `client/` and `server/` directories.

#### Frontend — `client/.env`

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5000
```

#### Backend — `server/.env`

```env
PORT=5000
MONGODB_URI=mongodb+srv://your_user:your_password@cluster.mongodb.net/oblivion
JWT_SECRET=your_jwt_secret
AUDIUS_API_KEY=your_audius_api_key
CLIENT_URL=http://localhost:5173
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----"
```

> ⚠️ **Never commit `.env` files or `firebase-service-account.json` to version control.** Both are included in `.gitignore`.

### Run the Development Servers

Start the backend and frontend in separate terminals:

```bash
# Terminal 1 — Backend (port 5000)
npm run dev:server

# Terminal 2 — Frontend (port 5173)
npm run dev:client
```

Or run them individually from their directories:

```bash
# Backend
cd server && npm run dev

# Frontend
cd client && npm run dev
```

The Vite dev server proxies `/api` requests to the Express backend automatically.

### Build for Production

```bash
# Build frontend
npm run build:client

# Build backend
npm run build:server
```

---

## Deployment

| Service | Platform | Notes |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | Set root directory to `client/`. Add all `VITE_*` environment variables in the Vercel dashboard. |
| **Backend** | [Render](https://render.com) | Set root directory to `server/`. Build command: `npm install && npm run build`. Start command: `npm start`. Add all server environment variables. |

**Production CORS** is configured to allow requests from `https://oblivionnn.vercel.app` and `http://localhost:5173`.

---

## Database Models

### User

| Field | Type | Constraints |
|---|---|---|
| `firebaseUid` | `String` | Required, unique, indexed |
| `email` | `String` | Required, unique, lowercase, trimmed |
| `username` | `String` | Required, unique, trimmed |
| `avatar` | `String` | Optional |
| `createdAt` | `Date` | Auto-generated |
| `updatedAt` | `Date` | Auto-generated |

### LibraryTrack

| Field | Type | Constraints |
|---|---|---|
| `userId` | `ObjectId` | Required, ref → User |
| `audiusTrackId` | `Number` | Required |
| `title` | `String` | Required, trimmed |
| `artist` | `String` | Required, trimmed |
| `duration` | `Number` | Required |
| `genre` | `String` | Optional |
| `mood` | `String` | Optional |
| `artwork` | `Object` | Optional (150x150, 480x480, 1000x1000) |
| `streamUrl` | `String` | Optional |
| `createdAt` | `Date` | Auto-generated |
| `updatedAt` | `Date` | Auto-generated |

> Compound unique index on `(userId, audiusTrackId)` prevents duplicate saves.

---

## License

This project is for educational and portfolio purposes.

---

<p align="center">
  Built with 🎶 by <a href="https://github.com/Mohd-riyaz">Mohd Riyaz</a>
</p>
