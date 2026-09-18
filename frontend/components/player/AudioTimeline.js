'use client';
import { useState } from 'react';
import { formatTime } from '../../hooks/useAudioPlayer';

export default function AudioTimeline({ player }) {
  const { position, duration, buffered, seek } = player;
  const [hover, setHover] = useState(null);
  const enabled = duration > 0;
  const progress = enabled ? Math.min(100, (position / duration) * 100) : 0;
  function pointAt(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) * duration;
  }
  return (
    <>
      <div
        className={`audio-timeline ${enabled ? '' : 'disabled'}`}
        style={{
          '--progress': `${progress}%`,
          '--buffered': `${enabled ? Math.min(100, (buffered / duration) * 100) : 0}%`,
        }}
        onPointerDown={(event) => {
          if (!enabled || event.button > 0) return;
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.querySelector('input')?.focus();
          seek(pointAt(event));
          setHover(pointAt(event));
        }}
        onPointerMove={(event) => {
          if (!enabled) return;
          const time = pointAt(event);
          setHover(time);
          if (event.currentTarget.hasPointerCapture(event.pointerId)) seek(time);
        }}
        onPointerUp={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            seek(pointAt(event));
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          setHover(null);
        }}
        onPointerCancel={() => setHover(null)}
        onPointerLeave={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) setHover(null);
        }}
      >
        <div className="timeline-rail">
          <div className="timeline-buffer" />
          <div className="timeline-progress" />
        </div>
        <span className="timeline-thumb" />
        {hover !== null && enabled && (
          <span
            className="timeline-tooltip"
            style={{ left: `${Math.max(6, Math.min(94, (hover / duration) * 100))}%` }}
          >
            {formatTime(hover)}
          </span>
        )}
        <input
          type="range"
          aria-label="Seek audio"
          min="0"
          max={duration || 0}
          step="0.1"
          value={Math.min(position, duration)}
          aria-valuetext={`${formatTime(position)} of ${formatTime(duration)}`}
          disabled={!enabled}
          onChange={(event) => seek(event.target.value)}
          onKeyDown={(event) => {
            const keys = {
              ArrowLeft: position - 5,
              ArrowDown: position - 5,
              ArrowRight: position + 5,
              ArrowUp: position + 5,
              Home: 0,
              End: duration,
            };
            if (event.key in keys) {
              event.preventDefault();
              seek(keys[event.key]);
            }
          }}
        />
      </div>
      <div className="timestamps">
        <span data-testid="elapsed-time">{formatTime(position)}</span>
        <span data-testid="remaining-time">-{formatTime(Math.max(0, duration - position))}</span>
      </div>
    </>
  );
}
