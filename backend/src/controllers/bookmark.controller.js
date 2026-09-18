import * as bookmarks from '../services/bookmark.service.js';
import { listArticles } from '../services/article.service.js';
import { serializeArticle } from '../serializers/article.serializer.js';

export async function list(req, res) {
  const articles = await listArticles({ user: req.user, query: req.validated.query, savedOnly: true });
  res.json({ articles: articles.map(serializeArticle) });
}

export async function save(req, res) {
  await bookmarks.saveBookmark(req.user._id, req.validated.params.id);
  res.json({ bookmarked: true });
}

export async function remove(req, res) {
  await bookmarks.removeBookmark(req.user._id, req.validated.params.id);
  res.json({ bookmarked: false });
}
