import { rateLimit } from 'express-rate-limit';

// One shared limiter per application for registration and login.
export function createAuthRateLimit() {
  return rateLimit({
    windowMs: 60000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many attempts. Try again in a minute.' },
  });
}
