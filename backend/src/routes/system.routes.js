import { Router } from 'express';
import { health, listTopics } from '../controllers/system.controller.js';

export function createSystemRoutes() {
  const router = Router();
  router.get('/health', health);
  router.get('/topics', listTopics);
  return router;
}
