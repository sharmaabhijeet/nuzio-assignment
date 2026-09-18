import { Session } from '../models/session.model.js';

export function createSession({ token, user, expiresAt }) {
  return Session.create({ token, user, expiresAt });
}

export function findActiveSession(token, now = new Date()) {
  // Check expiration explicitly: MongoDB's TTL cleanup is asynchronous.
  return Session.findOne({ token, expiresAt: { $gt: now } }).populate('user');
}

export function deleteSession(sessionId) {
  return Session.deleteOne({ _id: sessionId });
}
