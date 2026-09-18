import { Router } from 'express';
import { isDatabaseConnected } from '../config.js';
import { topics } from '../content.js';

export function createSystemRoutes() {
  const router = Router();

  router.get('/health', (req, res) => {
    const connected = isDatabaseConnected();
    res.status(connected ? 200 : 503).json({ status: connected ? 'ok' : 'database unavailable' });
  });

  router.get('/topics', (req, res) => res.json({ topics }));

  return router;
}
