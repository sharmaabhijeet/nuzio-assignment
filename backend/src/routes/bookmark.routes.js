import { Router } from 'express';
import * as controller from '../controllers/bookmark.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { validateArticleQuery } from '../validations/article.validation.js';
import { validateArticleId } from '../validations/common.validation.js';

export function createBookmarkRoutes() {
  const router = Router();
  router.get('/', validate('query', validateArticleQuery), controller.list);
  router.put('/:id', validate('params', validateArticleId), controller.save);
  router.delete('/:id', validate('params', validateArticleId), controller.remove);
  return router;
}
