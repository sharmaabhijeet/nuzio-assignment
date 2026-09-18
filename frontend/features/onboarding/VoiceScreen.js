'use client';
import Primary from '../../components/ui/PrimaryButton';
import { usePreferences } from '../../providers/PreferencesProvider';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { Check, Play } from 'lucide-react';
import { voices } from '../../constants/onboarding';
import { useVoicePreview } from '../../hooks/useVoicePreview';
import { usePlayback } from '../../providers/PlaybackProvider';
import OnboardingStep from './OnboardingStep';
export default function VoiceScreen() {
  const { profile, update, location } = usePreferences();
  const { go } = useAppNavigation();
  const narrate = useVoicePreview();
  const { player } = usePlayback();
  return (
    <OnboardingStep step={3}>
      <>
        <h1>
          Pick a<br />
          <em>narrator voice.</em>
        </h1>
        <p className="subtitle">Tap ▶ to hear a 10-second sample.</p>
        <div className="voices">
          {voices.map((v) => (
            <div
              key={v.name}
              className={`voice-card ${profile.voice === v.name ? 'selected' : ''}`}
            >
              <button className="voice-choice" onClick={() => update('voice', v.name)}>
                <span className={`voice-avatar ${v.color}`}>{v.name[0]}</span>
                <span>
                  <strong>
                    {v.name} <b>{v.tag}</b>
                  </strong>
                  <small>{v.description}</small>
                  <i>{v.language}</i>
                </span>
              </button>
              {profile.voice === v.name && (
                <span className="green-check">
                  <Check size={12} />
                </span>
              )}
              <button
                aria-label={`Preview ${v.name}`}
                className="preview-voice"
                onClick={() => {
                  update('voice', v.name);
                  narrate(
                    'Good morning. Welcome to Nuzio. Your personal morning brief is ready. Let’s discover what matters to your world today.',
                    undefined,
                    v.name,
                  );
                }}
              >
                <Play size={12} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
        <span className="micro purple length-label">BRIEF LENGTH</span>
        <h2>
          How long is
          <br />
          <em>your morning?</em>
        </h2>
        <p className="subtitle">Set your ideal brief length.</p>
        <div className="length-options">
          {['5 min', '10 min', '15 min', 'Custom'].map((l) => (
            <button
              key={l}
              className={profile.length === l ? 'selected' : ''}
              onClick={() => update('length', l)}
            >
              {l}
            </button>
          ))}
        </div>
        {profile.length === 'Custom' && (
          <label className="custom-length">
            Minutes{' '}
            <input
              type="number"
              min="1"
              max="60"
              defaultValue="20"
              onChange={(e) =>
                update('customLength', Math.max(1, Math.min(60, Number(e.target.value))))
              }
            />
          </label>
        )}
        <div className="bottom-action">
          <Primary
            onClick={() => {
              window.speechSynthesis?.cancel();
              player.pause();
              go('time');
            }}
          >
            Continue with {profile.voice} ·{' '}
            {profile.length === '5 min'
              ? '5'
              : profile.length === '10 min'
                ? '10'
                : profile.length === '15 min'
                  ? '15'
                  : profile.customLength || 20}{' '}
            stories →
          </Primary>
        </div>
      </>
    </OnboardingStep>
  );
}
