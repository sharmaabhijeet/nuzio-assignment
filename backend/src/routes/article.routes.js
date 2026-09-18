import { Router } from 'express';
import * as controller from '../controllers/article.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { validateArticleQuery } from '../validations/article.validation.js';
import { validateArticleId } from '../validations/common.validation.js';

export function createArticleRoutes() {
  const router = Router();
  router.get('/', validate('query', validateArticleQuery), controller.list);
  router.get('/:id', validate('params', validateArticleId), controller.detail);
  return router;
}
