import { articleExists } from '../repositories/article.repository.js';
import { upsertBookmark, deleteBookmark } from '../repositories/bookmark.repository.js';
import { ApiError } from '../utils/api-error.js';

export async function saveBookmark(userId, articleId) {
  if (!await articleExists(articleId)) throw new ApiError(404, 'Article not found.');
  await upsertBookmark(userId, articleId);
}

export function removeBookmark(userId, articleId) {
  // Deleting a missing bookmark is intentionally idempotent.
  return deleteBookmark(userId, articleId);
}
