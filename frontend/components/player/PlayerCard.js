'use client';
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import AudioTimeline from './AudioTimeline';
import { usePlayback } from '../../providers/PlaybackProvider';
import { useNews } from '../../providers/NewsProvider';
import { useAppNavigation } from '../../hooks/useAppNavigation';
const waveformHeights = [
  5, 8, 19, 7, 16, 9, 5, 13, 23, 32, 11, 8, 17, 6, 13, 23, 11, 7, 18, 29, 17, 6, 5, 14, 18, 9, 17,
  14, 7,
];
export default function PlayerCard() {
  const {
    player,
    play,
    nextArticle,
    current,
    active,
    audioSource,
    speed,
    setSpeed,
    queue: articles,
  } = usePlayback();
  const { saved, bookmark } = useNews();
  const { go } = useAppNavigation();
  return (
    <article className="player-card">
      <div className="player-top">
        <span className="tag purple-tag">
          ● NOW PLAYING · {(current.category || current.topic).toUpperCase()}
        </span>
        <span>
          {String(active + 1).padStart(2, '0')} / {String(articles.length).padStart(2, '0')}
        </span>
      </div>
      <button
        className="player-title"
        onClick={() => go(`/stories/${encodeURIComponent(current.id)}`)}
      >
        <h2>{current.title}</h2>
      </button>
      <div className="source-row">
        <span>
          {current.source.toUpperCase()}{' '}
          <b>
            · {current.readMinutes} MIN READ · <i>{current.demo ? 'DEMO' : 'SOURCE ↗'}</i>
          </b>
        </span>
        <button onClick={() => bookmark(current)}>
          {saved.includes(current.id) ? '✓ SAVED' : '+ SAVE'}
        </button>
      </div>
      <p className="transcript">{current.summary}</p>
      <div className={`waveform ${player.playing ? 'playing' : ''}`} aria-hidden="true">
        {waveformHeights.map((height, index) => (
          <span key={index} style={{ height: `${height}px`, animationDelay: `${index * 0.06}s` }} />
        ))}
      </div>
      <AudioTimeline player={player} />
      {player.error && (
        <p className="audio-error" role="alert">
          {player.error}
        </p>
      )}
      {!audioSource && (
        <p className="audio-error">No audio recording is available for this story.</p>
      )}
      <div className="player-controls">
        <button aria-label="Previous story" disabled={active === 0} onClick={() => nextArticle(-1)}>
          <SkipBack size={15} fill="currentColor" />
        </button>
        <button
          className="play-large"
          disabled={!audioSource}
          aria-busy={player.buffering}
          aria-label={player.playing ? 'Pause brief' : 'Play brief'}
          onClick={() => play()}
        >
          {player.playing ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} fill="currentColor" />
          )}
        </button>
        <button
          aria-label="Next story"
          disabled={active >= articles.length - 1}
          onClick={() => nextArticle(1)}
        >
          <SkipForward size={15} fill="currentColor" />
        </button>
        <button
          className="speed"
          aria-label="Playback speed"
          onClick={() =>
            setSpeed((rate) => (rate === 1 ? 1.25 : rate === 1.25 ? 1.5 : rate === 1.5 ? 2 : 1))
          }
        >
          {speed}×
        </button>
      </div>
    </article>
  );
}
