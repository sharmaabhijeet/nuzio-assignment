'use client';
import { Search } from 'lucide-react';
import { useNews } from '../../providers/NewsProvider';
import { usePlayback } from '../../providers/PlaybackProvider';
import CategoryTabs from './CategoryTabs';
import StoryCard from './StoryCard';
export default function DiscoverScreen() {
  const { articles, loading, query, setQuery } = useNews();
  const { player } = usePlayback();
  return (
    <section className="screen discover">
      <h1>Discover</h1>
      <p className="subtitle">Inshorts-style — swipe the world.</p>
      <label className="search-field">
        <Search size={17} />
        <input
          placeholder="Search stories, sources, topics…"
          aria-label="Search stories"
          value={query}
          onChange={(event) => {
            player.pause();
            setQuery(event.target.value);
          }}
        />
      </label>
      <CategoryTabs />
      <div className="story-list">
        {loading ? (
          <p className="subtitle">Finding your stories…</p>
        ) : articles.length ? (
          articles.map((article, index) => (
            <StoryCard key={article.id} article={article} index={index} />
          ))
        ) : (
          <p className="empty">No stories found. Try another search or topic.</p>
        )}
      </div>
    </section>
  );
}
