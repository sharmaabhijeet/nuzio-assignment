'use client';
import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNews } from '../../providers/NewsProvider';
import { getBookmarks } from '../../services/bookmark.service';
import { sampleArticles } from '../../lib/demo';
import { usePreview } from '../../hooks/usePreview';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import StoryCard from './StoryCard';
export default function SavedScreen() {
  const { saved } = useNews();
  const preview = usePreview();
  const { go } = useAppNavigation();
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (preview) {
      setArticles(sampleArticles.filter((article) => saved.includes(article.id)));
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError('');
    getBookmarks({ signal: controller.signal })
      .then(({ articles }) => setArticles(articles))
      .catch((error) => {
        if (error.name !== 'AbortError') setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [saved, preview]);
  return (
    <section className="screen discover">
      <button className="back" onClick={() => go('settings')}>
        <ChevronLeft size={17} /> Back
      </button>
      <h1>Saved stories</h1>
      <p className="subtitle">Your next listen, kept close.</p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="story-list saved-list">
        {loading ? (
          <p role="status">Loading saved stories…</p>
        ) : articles.length ? (
          articles.map((article, index) => (
            <StoryCard key={article.id} article={article} index={index} />
          ))
        ) : (
          <p className="empty">No saved stories yet.</p>
        )}
      </div>
    </section>
  );
}
