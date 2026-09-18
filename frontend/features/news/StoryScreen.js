'use client';
import { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { getArticle } from '../../services/news.service';
import { sampleArticles } from '../../lib/demo';
import { usePreview } from '../../hooks/usePreview';
import { useAppNavigation } from '../../hooks/useAppNavigation';
export default function StoryScreen({ id }) {
  const preview = usePreview();
  const { go } = useAppNavigation();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    setError('');
    if (preview) {
      const story = sampleArticles.find((article) => article.id === id);
      setArticle(story || null);
      setError(story ? '' : 'Story not found.');
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    getArticle(id, { signal: controller.signal })
      .then(({ article }) => setArticle(article))
      .catch((error) => {
        if (error.name !== 'AbortError') setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [id, preview]);
  return (
    <article className="screen story-reader">
      <button className="back" onClick={() => go('discover')}>
        <ChevronLeft size={17} /> Back
      </button>
      {loading ? (
        <p role="status">Loading story…</p>
      ) : error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : (
        <>
          <h1>{article.title}</h1>
          {article.content?.split('\n\n').map((text, index) => (
            <p key={index}>{text}</p>
          ))}
        </>
      )}
    </article>
  );
}
