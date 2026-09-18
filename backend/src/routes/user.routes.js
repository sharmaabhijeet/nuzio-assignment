import { Router } from 'express';
import { getProfile, saveInterests } from '../controllers/user.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { validateInterests } from '../validations/user.validation.js';

export function createUserRoutes() {
  const router = Router();

  router.get('/me', getProfile);
  router.put('/interests', validate('body', validateInterests), saveInterests);

  return router;
}

export function createLegacyUserRoutes() {
  const router = Router();
  router.put('/interests', requireAuth, validate('body', validateInterests), saveInterests);
  return router;
}
