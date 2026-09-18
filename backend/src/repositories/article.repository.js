import { Article } from '../models/article.model.js';

export function findPersonalizedArticles({ topic, category, q, interests, articleIds }) {
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
    { $addFields: { preferred: { $cond: [{ $in: ['$topic', interests] }, 1, 0] } } },
    { $sort: { preferred: -1, publishedAt: -1, _id: 1 } },
    { $limit: 100 },
    { $project: { content: 0, preferred: 0 } },
  ]);
}

export function findArticleById(id) {
  return Article.findById(id).lean();
}

export function articleExists(id) {
  return Article.exists({ _id: id });
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
