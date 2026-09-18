'use client';
import { Compass, Pause, Play, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { usePlayback } from '../../providers/PlaybackProvider';
import { useAppNavigation } from '../../hooks/useAppNavigation';
export default function BottomNavigation() {
  const pathname = usePathname();
  const { player, play } = usePlayback();
  const { go } = useAppNavigation();
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <button className={pathname === '/discover' ? 'active' : ''} onClick={() => go('discover')}>
        <Compass size={14} />
        <span>DISCOVER</span>
      </button>
      <button
        className="floating-play"
        aria-label={
          pathname !== '/brief'
            ? 'Open morning brief'
            : player.playing
              ? 'Pause brief'
              : 'Play brief'
        }
        onClick={() => (pathname === '/brief' ? play() : go('brief'))}
      >
        {player.playing ? (
          <Pause size={20} fill="currentColor" />
        ) : (
          <Play size={20} fill="currentColor" />
        )}
      </button>
      <button className={pathname === '/settings' ? 'active' : ''} onClick={() => go('settings')}>
        <Settings size={14} />
        <span>SETTINGS</span>
      </button>
    </nav>
  );
}
