# Nuzio

Next.js frontend with a separate Node.js / Express API and MongoDB through Mongoose.

## Start locally

Use Node.js 24+ and MongoDB. From this directory:

```sh
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Start local MongoDB, or set MONGODB_URI to your Atlas URI.
npm run seed
npm run dev
```

Open http://localhost:3000 and create an account. The API runs on port 3001. Next.js proxies `/api/*` to Express so session cookies stay on the same origin. Configure `FRONTEND_ORIGIN` on the backend when changing the frontend URL.

## Backend organization

The Express API has one route file per resource (auth, users, news, bookmarks) plus Mongoose models. See [backend/README.md](backend/README.md) for the layout and what not to break.

## Frontend organization

The Next.js App Router has separate login/register, onboarding, brief, Discover, settings, billing, saved-story, and story-detail pages. Shared components, providers, hooks, API services, and feature styles are documented in [frontend/README.md](frontend/README.md).

## Implemented

- Registration, login, logout, salted scrypt password hashing, HTTP-only cookies, expiring MongoDB sessions, auth rate limiting, and same-origin write checks.
- Responsive login and registration, topic onboarding, personalized feed, search, topic filters, article reading, and saved stories.
- Persistent User, Session, Article, and Bookmark Mongoose models. Topic preference sorting occurs in MongoDB before the feed limit.
- Loading, empty, and error states. Demo seed is repeatable and preserves existing articles.

## Commands

```sh
npm run dev                # Both applications
npm run dev -w backend    # Express only
npm run dev -w frontend   # Next.js only
npm run build             # Frontend production build
npm test                  # Real isolated MongoDB integration test
npm run seed              # Add 24 labeled demo stories across 12 categories
npm run test:e2e          # Browser integration check (Playwright Chromium required)
```

Tests use mongodb-memory-server, which may download a MongoDB binary on first run. To use an installed binary: `MONGOMS_SYSTEM_BINARY=/path/to/mongod npm test`.

For production, run `npm run build`, then `npm start -w backend` and `npm start -w frontend`. Use HTTPS and `NODE_ENV=production`. Configure persistent MongoDB, `FRONTEND_ORIGIN`, and `BACKEND_URL`; set the latter before the Next.js build. The authentication rate limiter is per-process.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | `{name,email,password}` |
| POST | `/api/auth/login` | `{email,password}` |
| POST | `/api/auth/logout` | Invalidate current session; body `{}` |
| GET | `/api/auth/me` | Current user |
| GET | `/api/topics` | Available topics |
| PUT | `/api/interests` | `{interests:["Science"]}` |
| GET | `/api/news` | Personalized list; optional `q` and `topic` |
| GET | `/api/news/:id` | Full article |
| GET | `/api/bookmarks` | Current user's saved articles |
| PUT / DELETE | `/api/bookmarks/:id` | Save / unsave; PUT body `{}` |
| GET | `/api/health` | Database-aware health check |

## Demo stories

Run `npm run seed` to add two fictional stories for each of the 12 onboarding categories. The seed preserves existing articles and is safe to run again. All category tabs use distinct category filters, including Markets and Startups. The account-free preview uses the same shared story collection, including full text for reading and audio.

## Audio player

The 24 bundled demo recordings live in `frontend/public/audio/`. The browser uses a native audio element, so clicking or dragging the timeline seeks to the real media timestamp. Keyboard arrows seek 5 seconds; Home/End jump to the start/end. Pause preserves the playhead, speed changes keep playing, and previous/next respect the paused/playing state. Auto-advance follows the setting and stops at the end of the filtered list. Errors are shown with a retry through Play.

Existing seeded demo stories resolve recordings by slug; future articles can supply `audioUrl` in MongoDB. Articles without recordings show an unavailable message. The bundled recordings work on any supported browser without a speech API key. To regenerate demo recordings on macOS with `say` and FFmpeg installed, run `node scripts/generate-demo-audio.mjs`. Do not regenerate audio during deployment.

`npm run test:e2e` exercises real MP3 playback, HTTP byte ranges, click/drag/keyboard/touch seeking, speed preservation, pause/resume, auto-advance, replay, and recovery from failed media requests.

## Mobile design reference

The mobile UI follows the two screenshots supplied on September 18: black surfaces, purple gradients, Instrument Serif headings, onboarding, audio brief, Discover, Settings, and billing. The app stays mobile-sized on desktop.

Inspect each screen without an account using `/?screen=language`, `login`, `profession`, `niches`, `voice`, `time`, `notifications`, `ready`, `brief`, `discover`, `settings`, `billing`, or `splash`. These explicit preview routes use screenshot-inspired sample content and are not live news. The normal `/` route uses the Express API. Browser screenshots are in `artifacts/mobile-*.png`.

## Current limitations

The Figma Make file still denies access. Matching uses compressed overview screenshots, so original fonts, assets, and exact measurements could not be verified. Google sign-in requires OAuth configuration; separate email login and registration pages are connected to the real backend. Billing is a visual preview with no payment processing. Demo stories use bundled MP3 narrations with real seeking, elapsed/remaining time, playback speed, and optional auto-advance. Narration uses one demo voice; browser speech synthesis is only used for the onboarding voice samples. Named premium voices are not connected to a voice provider. Notification controls request browser permission, but scheduled push delivery and offline downloads are not connected. Additional onboarding preferences are saved per account in this browser; topic interests persist in MongoDB. News uses labeled demo editorials, not a live news or AI provider. Google fonts fall back to system fonts when unavailable.
