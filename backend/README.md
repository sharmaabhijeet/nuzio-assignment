# Backend structure

The API uses Node.js, Express 5 and Mongoose. Existing endpoint paths, response envelopes, MongoDB collection names, indexes, cookies, and session expiration remain compatible with the frontend.

```text
src/
  app.js              Express middleware and router composition
  index.js            Server startup and shutdown
  seed.js             Demo seed entry point
  config/             Environment, database connection, session configuration
  constants/          Shared topic/category definitions
  routes/             Endpoint paths, auth boundary and validation middleware
  validations/        Request body, query and parameter checks/normalization
  controllers/        HTTP status codes, cookies, request/response handling
  services/           Authentication, personalization and bookmark business rules
  repositories/       All application database queries and writes
  models/             Individual Mongoose schemas and indexes
  middleware/         Authentication, validation, origin checks, rate limiting, errors
  serializers/        Public response shapes; prevent password exposure
  utils/              Password hashing, session tokens and ApiError
```

Request flow: **route → validation → controller → service → repository → model**. Protected endpoints pass through session authentication before validation. Models also validate persistence constraints. Request validators return only accepted fields in `req.validated`; controllers never pass arbitrary request objects to Mongoose.

- Keep Express `req`/`res` in controllers and middleware.
- Keep Mongoose query construction in repositories. Services may coordinate several repositories.
- Add new request rules in `validations/`, then attach them in the appropriate route.
- Throw `ApiError(status, message)` for expected failures; centralized error middleware handles them. Express 5 forwards rejected async handlers automatically.
- Preserve the explicitly checked session expiry even though MongoDB also has a TTL index.
- Preserve the compound bookmark index and scope every bookmark query to the signed-in user.
- The seed uses the article repository and `$setOnInsert` to avoid overwriting existing stories.

## Route registration in app.js

Middleware is registered first, resource routers second, then the 404 and centralized error handlers. `app.js` shows each mount explicitly; `index.js` only handles database connection and server lifecycle.

| Mount | Access | Endpoints |
| --- | --- | --- |
| `/api` | Public | `GET /health`, `GET /topics` |
| `/api/auth` | Register/login public; me/logout authenticated | `POST /register`, `POST /login`, `GET /me`, `POST /logout` |
| `/api/users` | Authenticated | `GET /me`, `PUT /interests` |
| `/api/news` | Authenticated | `GET /`, `GET /:id` |
| `/api/bookmarks` | Authenticated | `GET /`, `PUT /:id`, `DELETE /:id` |

`PUT /api/interests` remains an authenticated compatibility alias using the same user controller and validation. `GET /api/auth/me` remains available alongside `GET /api/users/me`. Unknown routes return a JSON 404; protected resource routes require a valid session.

## Run

From the project root, use `npm run dev -w backend`, `npm run seed`, and `npm test`. Configure `backend/.env` from `.env.example`. Test databases are isolated; no production or local app data is cleared. If MongoDB is installed locally, pass `MONGOMS_SYSTEM_BINARY=/path/to/mongod npm test` to avoid a test binary download.
