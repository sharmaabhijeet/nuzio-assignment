import { categories, topics } from '../constants/content.js';
import { ApiError } from '../utils/api-error.js';

export function validateArticleQuery(query) {
  const { topic, category, q } = query;
  if (category && !categories.some(item => item.label === category)) throw new ApiError(400, 'Unknown category.');
  if (topic && !topics.includes(topic)) throw new ApiError(400, 'Unknown topic.');
  if (q !== undefined && typeof q !== 'string') throw new ApiError(400, 'Invalid search.');
  return { topic: topic || undefined, category: category || undefined, q: (q || '').trim().slice(0, 200) };
}
