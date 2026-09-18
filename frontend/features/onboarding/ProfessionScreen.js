'use client';
import Primary from '../../components/ui/PrimaryButton';
import { usePreferences } from '../../providers/PreferencesProvider';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { Check } from 'lucide-react';
import { professions } from '../../constants/onboarding';
import OnboardingStep from './OnboardingStep';
export default function ProfessionScreen() {
  const { profile, update, location } = usePreferences();
  const { go } = useAppNavigation();
  return (
    <OnboardingStep step={1}>
      <>
        <h1>
          What’s your
          <br />
          <em>profession?</em>
        </h1>
        <p className="subtitle">We’ll tune every brief to what actually moves your day.</p>
        <div className="chips professions">
          {professions.map((p) => (
            <button
              className={profile.profession === p ? 'chosen' : ''}
              key={p}
              onClick={() => update('profession', p)}
            >
              {p}
              {profile.profession === p && <Check />}
            </button>
          ))}
        </div>
        <div className="bottom-action">
          <Primary onClick={() => go('niches')}>Continue →</Primary>
        </div>
      </>
    </OnboardingStep>
  );
}
