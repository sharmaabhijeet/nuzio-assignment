import { Router } from 'express';
import { User } from '../models/user.model.js';
import { ApiError } from '../errors.js';
import { topics } from '../content.js';
import { requireAuth } from './auth.routes.js';

function serializeUser(user) {
  return { id: String(user._id), name: user.name, email: user.email, interests: user.interests };
}

function validateInterests(input) {
  const interests = input?.interests;
  if (
    !Array.isArray(interests) ||
    interests.length > topics.length ||
    !interests.every(topic => topics.includes(topic))
  ) {
    throw new ApiError(400, 'Choose valid topics.');
  }
  return [...new Set(interests)];
}

async function saveInterests(req, res) {
  const interests = validateInterests(req.body);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { interests } },
    { returnDocument: 'after', runValidators: true },
  );
  if (!user) throw new ApiError(401, 'Please sign in.');
  res.json({ user: serializeUser(user) });
}

export function createUserRoutes() {
  const router = Router();
  router.get('/me', (req, res) => res.json({ user: serializeUser(req.user) }));
  router.put('/interests', saveInterests);
  return router;
}

// Keeps PUT /api/interests working for existing frontend clients that predate /api/users.
export function createLegacyUserRoutes() {
  const router = Router();
  router.put('/interests', requireAuth, saveInterests);
  return router;
}
