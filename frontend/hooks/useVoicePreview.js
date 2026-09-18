'use client';
import { useEffect, useRef } from 'react';
import { usePlayback } from '../providers/PlaybackProvider';
import { usePreferences } from '../providers/PreferencesProvider';
import { useNotice } from '../providers/NoticeProvider';
export function useVoicePreview() {
  const utteranceRef = useRef(null);
  const { player, speed } = usePlayback();
  const { profile } = usePreferences();
  const { setNotice } = useNotice();
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  return (text, onEnd, voice = profile.voice) => {
    if (!window.speechSynthesis) {
      setNotice('Voice preview is not supported by this browser.');
      return;
    }
    player.pause();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice === 'Meera' ? 'hi-IN' : voice === 'Aria' ? 'en-GB' : 'en-US';
    utterance.rate = speed;
    utterance.onend = () => onEnd?.();
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };
}
