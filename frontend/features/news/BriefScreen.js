'use client';
import { Mic } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { usePreferences } from '../../providers/PreferencesProvider';
import { useNews } from '../../providers/NewsProvider';
import { usePlayback } from '../../providers/PlaybackProvider';
import { usePreview } from '../../hooks/usePreview';
import CategoryTabs from './CategoryTabs';
import PlayerCard from '../../components/player/PlayerCard';
export default function BriefScreen() {
  const { user } = useAuth();
  const { profile } = usePreferences();
  const { loading } = useNews();
  const { current, player, queue: articles } = usePlayback();
  const preview = usePreview();
  const name = user?.name?.split(' ')[0] || 'Aarav';
  return (
    <section className="brief">
      <CategoryTabs />
      <div className="brief-content">
        <span className="micro purple">
          {preview
            ? 'SUNDAY · 12 JULY'
            : new Date()
                .toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
                .toUpperCase()}{' '}
          · MORNING BRIEF
        </span>
        <h1>
          Good morning, {name} —<br />
          <em>{articles.length} things.</em>
        </h1>
        <p className="brief-meta">
          <i /> {player.buffering ? 'Buffering…' : player.playing ? 'Audio playing' : 'Audio ready'}{' '}
          <span>
            · Voice: <b>{current?.demo ? 'Demo narrator' : profile.voice}</b> · {articles.length}{' '}
            stories · {profile.length}
          </span>
        </p>
        {current ? (
          <>
            <PlayerCard />
            <div className="now-narrating">
              🎙{' '}
              {player.buffering
                ? 'Buffering'
                : player.playing
                  ? 'Now narrating'
                  : player.position > 0
                    ? 'Paused'
                    : 'Ready to play'}{' '}
              — {current.title}
            </div>
          </>
        ) : (
          <div className="empty">
            <Mic />
            <h2>{loading ? 'Curating your brief…' : 'Your brief is on its way.'}</h2>
            <p>No stories are available yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}
