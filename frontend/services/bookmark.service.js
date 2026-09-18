import { api } from '../lib/api';
export const getBookmarks = (options) => api('/bookmarks', options);
export const saveBookmark = (id) =>
  api(`/bookmarks/${encodeURIComponent(id)}`, { method: 'PUT', body: '{}' });
export const removeBookmark = (id) =>
  api(`/bookmarks/${encodeURIComponent(id)}`, { method: 'DELETE' });
