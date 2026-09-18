'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { getAudioSource } from '../lib/demo';
import { useAuth } from './AuthProvider';
import { usePreview } from '../hooks/usePreview';
import { useNews } from './NewsProvider';
import { usePreferences } from './PreferencesProvider';
import { useNotice } from './NoticeProvider';
const PlaybackContext = createContext(null);
export function PlaybackProvider({ children }) {
  const { articles, filter, query } = useNews();
  const { user } = useAuth();
  const preview = usePreview();
  const { profile } = usePreferences();
  const { setNotice } = useNotice();
  const [activeId, setActiveId] = useState(null);
  const [standaloneArticle, setStandaloneArticle] = useState(null);
  const queue = standaloneArticle ? [standaloneArticle] : articles;
  const [speed, setSpeed] = useState(1);
  const active = Math.max(
    0,
    queue.findIndex((article) => article.id === activeId),
  );
  const current = queue[active];
  const audioSource = getAudioSource(current);
  const player = useAudioPlayer({
    playbackRate: speed,
    onEnded: () => {
      const next = queue[active + 1];
      if (profile.autoAdvance && next) {
        player.selectSource(getAudioSource(next), true);
        setActiveId(next.id);
      }
    },
  });
  const { selectSource, pause } = player;
  useEffect(() => {
    selectSource(audioSource);
  }, [audioSource, selectSource]);
  useEffect(() => {
    pause();
    setActiveId(null);
    setStandaloneArticle(null);
  }, [filter, query, user?.id, preview, pause]);
  function play(article = current) {
    const source = getAudioSource(article);
    if (!source) {
      setNotice('An audio recording is not available for this story yet.');
      return;
    }
    window.speechSynthesis?.cancel();
    setStandaloneArticle(articles.some((item) => item.id === article.id) ? null : article);
    setActiveId(article.id);
    player.toggle(source);
  }
  function nextArticle(offset) {
    const next = queue[active + offset];
    if (!next) return;
    player.selectSource(getAudioSource(next), player.playing);
    setActiveId(next.id);
  }
  return (
    <PlaybackContext.Provider
      value={{ player, play, nextArticle, current, active, audioSource, speed, setSpeed, queue }}
    >
      <audio ref={player.audioRef} preload="metadata" data-testid="story-audio" hidden />
      {children}
    </PlaybackContext.Provider>
  );
}
export const usePlayback = () => useContext(PlaybackContext);
