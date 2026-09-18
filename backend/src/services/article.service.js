import * as articles from '../repositories/article.repository.js';
import { findUserBookmarks } from '../repositories/bookmark.repository.js';
import { ApiError } from '../utils/api-error.js';

export async function listArticles({ user, query, savedOnly = false }) {
  const bookmarks = await findUserBookmarks(user._id);
  const saved = new Set(bookmarks.map(bookmark => String(bookmark.article)));
  const results = await articles.findPersonalizedArticles({
    ...query,
    interests: user.interests,
    ...(savedOnly ? { articleIds: bookmarks.map(bookmark => bookmark.article) } : {}),
  });
  return results.map(article => ({ ...article, bookmarked: saved.has(String(article._id)) }));
}

export async function getArticle(id) {
  const article = await articles.findArticleById(id);
  if (!article) throw new ApiError(404, 'Article not found.');
  return article;
}
