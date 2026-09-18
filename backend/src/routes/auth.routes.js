import { Router } from 'express';
import * as controller from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createAuthRateLimit } from '../middleware/rate-limit.middleware.js';
import { validateLogin, validateRegistration } from '../validations/auth.validation.js';

export function createAuthRoutes() {
  const router = Router();
  const limiter = createAuthRateLimit();

  router.post('/register', limiter, validate('body', validateRegistration), controller.register);
  router.post('/login', limiter, validate('body', validateLogin), controller.login);
  router.get('/me', requireAuth, controller.me);
  router.post('/logout', requireAuth, controller.logout);

  return router;
}
