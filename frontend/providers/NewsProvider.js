'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { useNotice } from './NoticeProvider';
import { usePreview } from '../hooks/usePreview';
import { sampleArticles } from '../lib/demo';
import { getArticles } from '../services/news.service';
import * as bookmarks from '../services/bookmark.service';
const NewsContext = createContext(null);
export function NewsProvider({ children }) {
  const { user } = useAuth();
  const { setNotice } = useNotice();
  const preview = usePreview();
  const interestsKey = user?.interests?.join('|') || '';
  const [articles, setArticles] = useState([]);
  const [saved, setSaved] = useState([]);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookmarkBusy, setBookmarkBusy] = useState(null);
  useEffect(() => {
    setArticles([]);
    setSaved([]);
    setFilter('All');
    setQuery('');
  }, [user?.id, preview]);
  useEffect(() => {
    if (!user || preview) return;
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(() => {
      getArticles({ query, category: filter, signal: controller.signal })
        .then(({ articles }) => {
          setArticles(articles);
          setSaved((previous) => [
            ...new Set([
              ...previous.filter((id) => !articles.some((a) => a.id === id)),
              ...articles.filter((a) => a.bookmarked).map((a) => a.id),
            ]),
          ]);
        })
        .catch((error) => {
          if (error.name !== 'AbortError') setNotice(error.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [user?.id, interestsKey, preview, filter, query, setNotice]);
  const filtered = preview
    ? sampleArticles.filter(
        (article) =>
          (filter === 'All' || article.category === filter) &&
          `${article.title} ${article.summary}`.toLowerCase().includes(query.toLowerCase()),
      )
    : articles;
  const bookmark = useCallback(
    async (article) => {
      if (bookmarkBusy) return;
      setBookmarkBusy(article.id);
      try {
        const exists = saved.includes(article.id);
        if (!preview)
          await (exists
            ? bookmarks.removeBookmark(article.id)
            : bookmarks.saveBookmark(article.id));
        setSaved((previous) =>
          exists ? previous.filter((id) => id !== article.id) : [...previous, article.id],
        );
      } catch (error) {
        setNotice(error.message);
      } finally {
        setBookmarkBusy(null);
      }
    },
    [bookmarkBusy, saved, preview, setNotice],
  );
  return (
    <NewsContext.Provider
      value={{
        articles: filtered,
        saved,
        bookmark,
        bookmarkBusy,
        filter,
        setFilter,
        query,
        setQuery,
        loading,
      }}
    >
      {children}
    </NewsContext.Provider>
  );
}
export const useNews = () => useContext(NewsContext);
