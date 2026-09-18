import { Bookmark } from '../models/bookmark.model.js';

export function findUserBookmarks(userId) {
  return Bookmark.find({ user: userId }).lean();
}

export function upsertBookmark(userId, articleId) {
  return Bookmark.updateOne(
    { user: userId, article: articleId },
    { $setOnInsert: { user: userId, article: articleId } },
    { upsert: true },
  );
}

export function deleteBookmark(userId, articleId) {
  return Bookmark.deleteOne({ user: userId, article: articleId });
}
