import { authenticate } from '../services/auth.service.js';
import { SESSION_COOKIE_NAME } from '../config/session.js';

export async function requireAuth(req, res, next) {
  const { user, session } = await authenticate(req.cookies[SESSION_COOKIE_NAME]);
  req.user = user;
  req.session = session;
  next();
}
