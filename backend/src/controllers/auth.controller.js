import * as auth from '../services/auth.service.js';
import { serializeUser } from '../serializers/user.serializer.js';
import { SESSION_COOKIE_NAME, SESSION_LIFETIME_MS, sessionCookieOptions } from '../config/session.js';

function respondWithSession(res, result, status) {
  const options = sessionCookieOptions(res.app.locals.config.production);
  res.cookie(SESSION_COOKIE_NAME, result.token, { ...options, maxAge: SESSION_LIFETIME_MS });
  res.status(status).json({ user: serializeUser(result.user) });
}

export async function register(req, res) {
  respondWithSession(res, await auth.register(req.validated.body), 201);
}

export async function login(req, res) {
  respondWithSession(res, await auth.login(req.validated.body), 200);
}

export function me(req, res) {
  res.json({ user: serializeUser(req.user) });
}

export async function logout(req, res) {
  await auth.logout(req.session._id);
  res.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions(res.app.locals.config.production));
  res.json({ success: true });
}
