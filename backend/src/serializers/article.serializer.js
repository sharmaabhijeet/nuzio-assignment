export function serializeArticle(article) {
  return { ...article, id: String(article._id) };
}
