'use client';
import Primary from '../../components/ui/PrimaryButton';
import { usePreferences } from '../../providers/PreferencesProvider';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import OnboardingStep from './OnboardingStep';
export default function TimeScreen() {
  const { profile, update, location } = usePreferences();
  const { go } = useAppNavigation();
  return (
    <OnboardingStep step={4}>
      <>
        <h1>
          When do you
          <br />
          <em>want your brief?</em>
        </h1>
        <p className="subtitle">Nuzio will have your brief ready and waiting each morning.</p>
        <div className="period">
          {['AM', 'PM'].map((p) => (
            <button
              key={p}
              className={profile.period === p ? 'selected' : ''}
              onClick={() => update('period', p)}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="time-picker" role="group" aria-label="Brief delivery time">
          {['5:30', '6:00', '6:30', '7:00', '7:30', '8:00', '8:30'].map((t, i) => (
            <button
              key={t}
              className={`${profile.time === t ? 'selected' : ''} distance-${Math.abs(i - 3)}`}
              onClick={() => update('time', t)}
            >
              {t}
              {profile.time === t && <small>{profile.period}</small>}
            </button>
          ))}
        </div>
        <div className="bottom-action">
          <Primary onClick={() => go('notifications')}>Continue →</Primary>
        </div>
      </>
    </OnboardingStep>
  );
}
