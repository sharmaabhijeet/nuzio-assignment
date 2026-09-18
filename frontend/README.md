# Frontend structure

Next.js App Router with separate pages and shared, persistent client state. There is no single component switching between every screen.

```text
app/
  layout.js                  Root layout, Suspense boundary, providers
  page.js                    Initial session/legacy-preview redirect
  (auth)/                    /welcome, /login, /register, /splash
  (app)/                     Protected app layout with header/navigation
    brief/                   /brief
    discover/                /discover
    saved/                   /saved
    settings/                /settings
    billing/                 /billing
    stories/[id]/            /stories/:id
  onboarding/                Separate language, profession, niches, voice,
                             time, notifications, and ready pages
components/
  layout/                    Mobile frame, header, navigation, auth guard
  ui/                        Logo, primary button, toggle, accessible dialog
  player/                    Player card and seekable audio timeline
features/
  auth/                      Welcome, login/register form, client validation
  onboarding/                Individual onboarding screens and step wrapper
  news/                      Brief, Discover, story reader, saved list, cards
  settings/                  Settings and billing screens
providers/                   Auth, preferences, news/bookmarks, audio, notices
hooks/                       Media player, navigation, permissions, focus trap
services/                    Auth/user/news/bookmark API requests
lib/                         Shared HTTP client and demo helpers
constants/                   Route names and onboarding choices
styles/                      Base, auth, onboarding, news, player, settings,
                             dialog, theme, and responsive styles
public/audio/                Bundled demo narration MP3s
```

## Responsibilities

Page files compose feature screens. Features handle their own UI, forms, and loading/error states. API requests go through `services/` and the shared HTTP client. Reusable visual controls live in `components/`; browser behavior lives in hooks.

The providers are mounted in the root layout, so audio continues and keeps its playhead when moving between routes. Route changes use the Next.js router or Link, making browser back, refresh, and direct links work normally. Login and registration have independent pages and share only the form implementation and validation.

App pages and onboarding after the language step use `RequireAuth`. This is a client navigation guard; the Express backend remains the authority for authentication and authorization. The login form uses `/api/auth/login`, registration uses `/api/auth/register`, and the session is restored via `/api/users/me` using the HTTP-only cookie.

Preferences are stored under the account ID. Account changes load the appropriate preferences before writing them, and logout clears the active feed/session. News and bookmarks are shared across feature pages. Selecting another category or search pauses/reset the audio queue; normal navigation preserves playback.

## URLs and previews

- `/login` and `/register` are directly accessible pages.
- `/brief`, `/discover`, `/saved`, `/settings`, `/billing`, and `/stories/:id` require a session.
- `/onboarding/language` is public; the other onboarding pages require a session.
- Add `?preview=1` to a route to inspect it with fictional demo content, without an account. Preview mode does not grant access to authenticated APIs.
- Existing `/?screen=brief` and similar screenshot links redirect to the matching route in preview mode. The old `?screen=login` refers to the welcome screen; `/login?preview=1` shows the separate email login form.

## Commands

From the project root:

```sh
npm run dev -w frontend
npm run build
npm run format:frontend
npm run check:frontend-format
npm run test:e2e
```

The browser checks cover authentication, onboarding, direct/protected routes, story reloads, bookmarks, search/category filters, browser navigation, and real audio seeking/continuity. The backend remains a separate Express application; Next.js proxies `/api/*` to it.
