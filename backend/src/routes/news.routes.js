import { Router } from 'express';
import mongoose from 'mongoose';
import { Article } from '../models/article.model.js';
import { Bookmark } from '../models/bookmark.model.js';
import { ApiError } from '../errors.js';
import { categories, topics } from '../content.js';

function serializeArticle(article) {
  return { ...article, id: String(article._id) };
}

export function validateQuery(query) {
  const { topic, category, q } = query;
  if (category && !categories.some(item => item.label === category)) throw new ApiError(400, 'Unknown category.');
  if (topic && !topics.includes(topic)) throw new ApiError(400, 'Unknown topic.');
  if (q !== undefined && typeof q !== 'string') throw new ApiError(400, 'Invalid search.');
  return { topic: topic || undefined, category: category || undefined, q: (q || '').trim().slice(0, 200) };
}

async function findPersonalized({ topic, category, q, interests, articleIds }) {
  const filter = {
    ...(topic ? { topic } : {}),
    ...(category ? { category } : {}),
    // An empty bookmark list must produce no results, not the entire feed.
    ...(articleIds !== undefined ? { _id: { $in: articleIds } } : {}),
  };
  if (q) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: escaped, $options: 'i' } },
      { summary: { $regex: escaped, $options: 'i' } },
    ];
  }
  return Article.aggregate([
    { $match: filter },
    // Sort by the reader's interests before recency, entirely inside MongoDB.
    { $addFields: { preferred: { $cond: [{ $in: ['$topic', interests] }, 1, 0] } } },
    { $sort: { preferred: -1, publishedAt: -1, _id: 1 } },
    { $limit: 100 },
    { $project: { content: 0, preferred: 0 } },
  ]);
}

export async function listPersonalized({ user, query, savedOnly = false }) {
  const bookmarks = await Bookmark.find({ user: user._id }).lean();
  const saved = new Set(bookmarks.map(bookmark => String(bookmark.article)));
  const results = await findPersonalized({
    ...query,
    interests: user.interests,
    ...(savedOnly ? { articleIds: bookmarks.map(bookmark => bookmark.article) } : {}),
  });
  return results.map(article => ({ ...serializeArticle(article), bookmarked: saved.has(String(article._id)) }));
}

export function insertMissingArticles(stories) {
  return Article.bulkWrite(stories.map(story => ({
    updateOne: {
      filter: { slug: story.slug },
      update: { $setOnInsert: story },
      upsert: true,
    },
  })));
}

export function createArticleRoutes() {
  const router = Router();

  router.get('/', async (req, res) => {
    const query = validateQuery(req.query);
    const articles = await listPersonalized({ user: req.user, query });
    res.json({ articles });
  });

  router.get('/:id', async (req, res) => {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) throw new ApiError(404, 'Article not found.');
    const article = await Article.findById(req.params.id).lean();
    if (!article) throw new ApiError(404, 'Article not found.');
    res.json({ article: serializeArticle(article) });
  });

  return router;
}
