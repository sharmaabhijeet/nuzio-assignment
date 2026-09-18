import { updateInterests } from '../services/user.service.js';
import { serializeUser } from '../serializers/user.serializer.js';

export function getProfile(req, res) {
  res.json({ user: serializeUser(req.user) });
}

export async function saveInterests(req, res) {
  const user = await updateInterests(req.user._id, req.validated.body.interests);
  res.json({ user: serializeUser(user) });
}
