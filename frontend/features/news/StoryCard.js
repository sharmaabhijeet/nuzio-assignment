'use client';
import { Play, Star } from 'lucide-react';
import { useNews } from '../../providers/NewsProvider';
import { usePlayback } from '../../providers/PlaybackProvider';
import { useAppNavigation } from '../../hooks/useAppNavigation';
export default function StoryCard({ article, index = 0 }) {
  const { saved, bookmark, bookmarkBusy } = useNews();
  const { play } = usePlayback();
  const { go } = useAppNavigation();
  return (
    <article className="story-card">
      <div className="tags">
        <span className={`tag ${index % 2 ? 'cyan-tag' : 'purple-tag'}`}>
          {(article.category || article.topic).toUpperCase()}
        </span>
        <span className="tag source-tag">{article.source.toUpperCase()} ↗</span>
      </div>
      <button
        className="story-title"
        onClick={() => go(`/stories/${encodeURIComponent(article.id)}`)}
      >
        {article.title}
      </button>
      <p>{article.summary}</p>
      <div className="story-bottom">
        <span>
          {article.readMinutes} MIN READ {article.demo ? '· DEMO' : ''}
        </span>
        <button
          className="small-play"
          aria-label={`Play ${article.title}`}
          onClick={() => play(article)}
        >
          <Play size={12} fill="currentColor" />
        </button>
        <button
          className={`save-star ${saved.includes(article.id) ? 'is-saved' : ''}`}
          disabled={bookmarkBusy === article.id}
          aria-label={`Save ${article.title}`}
          aria-pressed={saved.includes(article.id)}
          onClick={() => bookmark(article)}
        >
          <Star size={13} fill={saved.includes(article.id) ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  );
}
