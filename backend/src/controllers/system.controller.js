import { isDatabaseConnected } from '../config/database.js';
import { topics } from '../constants/content.js';

export function health(req, res) {
  const connected = isDatabaseConnected();
  res.status(connected ? 200 : 503).json({ status: connected ? 'ok' : 'database unavailable' });
}

export function listTopics(req, res) {
  res.json({ topics });
}
