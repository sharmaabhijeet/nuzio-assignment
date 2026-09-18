# Backend

Node.js, Express 5, Mongoose.

```text
src/
  app.js       Express app: middleware + route mounts
  index.js     Server startup/shutdown
  seed.js      Demo seed entry point
  config.js    Env config, DB connect, session settings
  errors.js    ApiError + 404/error handlers
  content.js   Topic/category list (re-exported from ../shared)
  models/      Mongoose schemas (User, Session, Article, Bookmark)
  routes/      One file per resource: routes + validation + handlers together
```

Each `routes/*.routes.js` file owns everything for that resource — the Express router, request validation, and the Mongoose queries. That's on purpose: at this size, splitting auth into five different files (route/controller/service/repository/validator) just makes you jump around to read one flow. `auth.routes.js` is the one exception worth knowing: it also exports `requireAuth`, since the session-check middleware needs the same token-hashing helpers as login/logout.

`app.js` wires it all together — middleware first, then routes, then the 404/error handlers last (order matters for Express).

| Mount | Access | Endpoints |
| --- | --- | --- |
| `/api` | Public | `GET /health`, `GET /topics` |
| `/api/auth` | Register/login public; me/logout need a session | `POST /register`, `POST /login`, `GET /me`, `POST /logout` |
| `/api/users` | Needs a session | `GET /me`, `PUT /interests` |
| `/api/news` | Needs a session | `GET /`, `GET /:id` |
| `/api/bookmarks` | Needs a session | `GET /`, `PUT /:id`, `DELETE /:id` |

`PUT /api/interests` (no `/users` prefix) is kept around as an alias for older frontend code that calls it directly.

A few things not to break if you touch this:
- Session tokens are hashed (SHA-256) before hitting MongoDB — the raw cookie value is never stored, so a DB leak alone doesn't hand out working sessions.
- Login always runs the password hash even for an unknown email (fake salt), so response timing doesn't leak whether an account exists.
- `findActiveSession` checks `expiresAt` explicitly rather than trusting Mongo's TTL index alone — the TTL sweep runs on its own schedule, not instantly.
- Bookmark queries are always scoped to `req.user._id` — never trust an `:id` param alone.
- The seed (`insertMissingArticles` in `news.routes.js`) uses `$setOnInsert` so re-running it never overwrites existing articles.

## Run

From the project root: `npm run dev -w backend`, `npm run seed`, `npm test`. Copy `.env.example` to `.env` first. Tests spin up an isolated in-memory MongoDB (`mongodb-memory-server`) — nothing touches your real database. If you already have MongoDB installed, `MONGOMS_SYSTEM_BINARY=/path/to/mongod npm test` skips the test-binary download.
