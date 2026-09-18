import { Router } from 'express';
import { randomBytes, scrypt as derive, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { rateLimit } from 'express-rate-limit';
import { User } from '../models/user.model.js';
import { Session } from '../models/session.model.js';
import { ApiError } from '../errors.js';
import { SESSION_COOKIE_NAME, SESSION_LIFETIME_MS, sessionCookieOptions } from '../config.js';

const scrypt = promisify(derive);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const digest = await scrypt(password, salt, 64);
  return `${salt}:${digest.toString('hex')}`;
}

async function verifyPassword(password, storedPassword) {
  // Also derive a hash when the account does not exist, so login timing doesn't leak it.
  const [salt, expected] = storedPassword
    ? storedPassword.split(':')
    : ['invalid-account', '00'.repeat(64)];
  const actual = await scrypt(password, salt, 64);
  return timingSafeEqual(Buffer.from(expected, 'hex'), actual) && Boolean(storedPassword);
}

const generateSessionToken = () => randomBytes(32).toString('hex');
const hashSessionToken = token => createHash('sha256').update(token).digest('hex');
const isSessionToken = token => typeof token === 'string' && /^[a-f0-9]{64}$/.test(token);

function serializeUser(user) {
  return { id: String(user._id), name: user.name, email: user.email, interests: user.interests };
}

function validateLogin(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ApiError(400, 'Expected a JSON object.');
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const password = input.password;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254
    || typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new ApiError(400, 'Enter a valid email and a password of 8–128 characters.');
  }
  return { email, password };
}

function validateRegistration(input) {
  const credentials = validateLogin(input);
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (!name || name.length > 80) throw new ApiError(400, 'Enter a name of 1–80 characters.');
  return { ...credentials, name };
}

async function startSession(user) {
  const token = generateSessionToken();
  await Session.create({
    token: hashSessionToken(token),
    user: user._id,
    expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS),
  });
  return { user, token };
}

function respondWithSession(res, { user, token }, status) {
  const options = sessionCookieOptions(res.app.locals.config.production);
  res.cookie(SESSION_COOKIE_NAME, token, { ...options, maxAge: SESSION_LIFETIME_MS });
  res.status(status).json({ user: serializeUser(user) });
}

// Sessions are looked up by a hash of the cookie token, so a database leak alone
// doesn't hand out usable sessions. Expiry is checked here too, since MongoDB's
// TTL cleanup of expired sessions runs on its own schedule, not instantly.
export async function requireAuth(req, res, next) {
  const token = req.cookies[SESSION_COOKIE_NAME];
  if (!isSessionToken(token)) return next(new ApiError(401, 'Please sign in.'));
  const session = await Session.findOne({
    token: hashSessionToken(token),
    expiresAt: { $gt: new Date() },
  }).populate('user');
  if (!session?.user) return next(new ApiError(401, 'Please sign in.'));
  req.user = session.user;
  req.session = session;
  next();
}

export function createAuthRoutes() {
  const router = Router();
  // One shared limiter for registration and login, to slow brute-force attempts.
  const limiter = rateLimit({
    windowMs: 60000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many attempts. Try again in a minute.' },
  });

  router.post('/register', limiter, async (req, res) => {
    const values = validateRegistration(req.body);
    const user = await User.create({ ...values, password: await hashPassword(values.password) });
    respondWithSession(res, await startSession(user), 201);
  });

  router.post('/login', limiter, async (req, res) => {
    const { email, password } = validateLogin(req.body);
    const user = await User.findOne({ email }).select('+password');
    if (!(await verifyPassword(password, user?.password))) throw new ApiError(401, 'Incorrect email or password.');
    respondWithSession(res, await startSession(user), 200);
  });

  router.get('/me', requireAuth, (req, res) => {
    res.json({ user: serializeUser(req.user) });
  });

  router.post('/logout', requireAuth, async (req, res) => {
    await Session.deleteOne({ _id: req.session._id });
    res.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions(res.app.locals.config.production));
    res.json({ success: true });
  });

  return router;
}
