import { api } from '../lib/api';
export function getArticles({ query = '', category = 'All', signal } = {}) {
  const params = new URLSearchParams({ q: query });
  if (category !== 'All') params.set('category', category);
  return api(`/news?${params}`, { signal });
}
export const getArticle = (id, options) => api(`/news/${encodeURIComponent(id)}`, options);
