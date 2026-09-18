import * as users from '../repositories/user.repository.js';
import * as sessions from '../repositories/session.repository.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateSessionToken, hashSessionToken, isSessionToken } from '../utils/session-token.js';
import { SESSION_LIFETIME_MS } from '../config/session.js';
import { ApiError } from '../utils/api-error.js';

async function startSession(user) {
  const token = generateSessionToken();
  await sessions.createSession({
    token: hashSessionToken(token),
    user: user._id,
    expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS),
  });
  return { user, token };
}

export async function register({ name, email, password }) {
  const user = await users.createUser({ name, email, password: await hashPassword(password) });
  return startSession(user);
}

export async function login({ email, password }) {
  const user = await users.findUserCredentials(email);
  if (!await verifyPassword(password, user?.password)) throw new ApiError(401, 'Incorrect email or password.');
  return startSession(user);
}

export async function authenticate(token) {
  if (!isSessionToken(token)) throw new ApiError(401, 'Please sign in.');
  const session = await sessions.findActiveSession(hashSessionToken(token));
  if (!session?.user) throw new ApiError(401, 'Please sign in.');
  return { user: session.user, session };
}

export function logout(sessionId) {
  return sessions.deleteSession(sessionId);
}
