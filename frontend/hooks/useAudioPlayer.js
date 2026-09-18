'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export function formatTime(value) {
  const seconds = Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

// The media element is the clock. No estimated speech timing or independent progress timer.
export function useAudioPlayer({ onEnded, playbackRate = 1 }) {
  const audioRef = useRef(null);
  const sourceRef = useRef(null);
  const generation = useRef(0);
  const endedRef = useRef(onEnded);
  const rateRef = useRef(playbackRate);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [error, setError] = useState('');
  useEffect(() => {
    endedRef.current = onEnded;
  }, [onEnded]);
  useEffect(() => {
    rateRef.current = playbackRate;
    if (audioRef.current) {
      audioRef.current.defaultPlaybackRate = playbackRate;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const syncTime = () => setPosition(Number.isFinite(audio.currentTime) ? audio.currentTime : 0);
    const syncDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const syncBuffer = () => {
      let end = 0;
      for (let i = 0; i < audio.buffered.length; i++) {
        if (audio.buffered.start(i) <= audio.currentTime) end = audio.buffered.end(i);
      }
      setBuffered(end);
    };
    const handlers = {
      loadedmetadata: () => {
        audio.playbackRate = rateRef.current;
        syncDuration();
        syncTime();
      },
      durationchange: syncDuration,
      timeupdate: syncTime,
      progress: syncBuffer,
      play: () => {
        setPlaying(true);
        setError('');
      },
      playing: () => {
        setPlaying(true);
        setBuffering(false);
      },
      pause: () => {
        setPlaying(false);
        setBuffering(false);
        syncTime();
      },
      waiting: () => setBuffering(true),
      seeking: () => {
        syncTime();
        if (!audio.paused) setBuffering(true);
      },
      seeked: () => {
        syncTime();
        syncBuffer();
        setBuffering(false);
      },
      canplay: () => setBuffering(false),
      ended: () => {
        setPlaying(false);
        setBuffering(false);
        syncTime();
        endedRef.current?.();
      },
      error: () => {
        setPlaying(false);
        setBuffering(false);
        setError('Audio could not be loaded. Check your connection and try again.');
      },
    };
    for (const [event, handler] of Object.entries(handlers)) audio.addEventListener(event, handler);
    return () => {
      generation.current++;
      for (const [event, handler] of Object.entries(handlers))
        audio.removeEventListener(event, handler);
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      sourceRef.current = null;
    };
  }, []);

  const resume = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !sourceRef.current) return;
    const token = generation.current;
    setError('');
    if (audio.error) audio.load();
    if (audio.ended || (Number.isFinite(audio.duration) && audio.currentTime >= audio.duration))
      audio.currentTime = 0;
    try {
      await audio.play();
    } catch (error) {
      // Replacing a track, pausing, or seeking can intentionally abort a pending play.
      if (token !== generation.current || error.name === 'AbortError') return;
      setPlaying(false);
      setBuffering(false);
      setError(
        error.name === 'NotAllowedError'
          ? 'Tap play to start the audio.'
          : 'Audio could not be played. Please try again.',
      );
    }
  }, []);

  const selectSource = useCallback(
    (source, autoplay = false) => {
      const audio = audioRef.current;
      if (!audio) return;
      const next = source || null;
      if (next !== sourceRef.current) {
        generation.current++;
        audio.pause();
        sourceRef.current = next;
        setPlaying(false);
        setBuffering(false);
        setPosition(0);
        setDuration(0);
        setBuffered(0);
        setError('');
        if (next) audio.src = next;
        else audio.removeAttribute('src');
        audio.defaultPlaybackRate = rateRef.current;
        audio.load();
        audio.playbackRate = rateRef.current;
      }
      if (autoplay && next) void resume();
    },
    [resume],
  );

  const pause = useCallback(() => {
    generation.current++;
    audioRef.current?.pause();
    setPlaying(false);
    setBuffering(false);
  }, []);

  const toggle = useCallback(
    (source) => {
      const audio = audioRef.current;
      if (!source) return;
      if (source !== sourceRef.current) selectSource(source, true);
      else if (audio && !audio.paused) pause();
      else void resume();
    },
    [selectSource, pause, resume],
  );

  const seek = useCallback((value) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const time = Math.max(0, Math.min(Number(value), audio.duration));
    if (!Number.isFinite(time)) return;
    audio.currentTime = time;
    setPosition(time);
  }, []);

  return {
    audioRef,
    playing,
    buffering,
    duration,
    position,
    buffered,
    error,
    selectSource,
    pause,
    toggle,
    seek,
    resume,
  };
}
