import * as articles from '../services/article.service.js';
import { serializeArticle } from '../serializers/article.serializer.js';

export async function list(req, res) {
  const results = await articles.listArticles({ user: req.user, query: req.validated.query });
  res.json({ articles: results.map(serializeArticle) });
}

export async function detail(req, res) {
  const article = await articles.getArticle(req.validated.params.id);
  res.json({ article: serializeArticle(article) });
}
