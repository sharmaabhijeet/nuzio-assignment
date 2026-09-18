'use client';
import { categories } from '../../../shared/categories';
import { useNews } from '../../providers/NewsProvider';
import { usePlayback } from '../../providers/PlaybackProvider';
export default function CategoryTabs() {
  const { filter, setFilter } = useNews();
  const { player } = usePlayback();
  return (
    <div className="category-tabs">
      {['All', ...categories.map((item) => item.label)].map((category) => (
        <button
          key={category}
          className={filter === category ? 'active' : ''}
          onClick={() => {
            player.pause();
            setFilter(category);
          }}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
