import { Router } from 'express';
import mongoose from 'mongoose';
import { Article } from '../models/article.model.js';
import { Bookmark } from '../models/bookmark.model.js';
import { ApiError } from '../errors.js';
import { listPersonalized, validateQuery } from './news.routes.js';

export function createBookmarkRoutes() {
  const router = Router();

  router.get('/', async (req, res) => {
    const query = validateQuery(req.query);
    const articles = await listPersonalized({ user: req.user, query, savedOnly: true });
    res.json({ articles });
  });

  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isObjectIdOrHexString(id)) throw new ApiError(404, 'Article not found.');
    if (!(await Article.exists({ _id: id }))) throw new ApiError(404, 'Article not found.');
    await Bookmark.updateOne(
      { user: req.user._id, article: id },
      { $setOnInsert: { user: req.user._id, article: id } },
      { upsert: true },
    );
    res.json({ bookmarked: true });
  });

  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isObjectIdOrHexString(id)) throw new ApiError(404, 'Article not found.');
    // Deleting a missing bookmark is intentionally idempotent.
    await Bookmark.deleteOne({ user: req.user._id, article: id });
    res.json({ bookmarked: false });
  });

  return router;
}
