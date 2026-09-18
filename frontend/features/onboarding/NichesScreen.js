'use client';
import Primary from '../../components/ui/PrimaryButton';
import { usePreferences } from '../../providers/PreferencesProvider';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { niches, topicMap } from '../../constants/onboarding';
import { useAuth } from '../../providers/AuthProvider';
import { useNotice } from '../../providers/NoticeProvider';
import { usePreview } from '../../hooks/usePreview';
import * as userService from '../../services/user.service';
import OnboardingStep from './OnboardingStep';
export default function NichesScreen() {
  const { profile, update, location } = usePreferences();
  const { go } = useAppNavigation();
  const { user, setUser } = useAuth();
  const { setNotice } = useNotice();
  const preview = usePreview();
  const [busy, setBusy] = useState(false);
  async function saveInterests() {
    setBusy(true);
    try {
      if (user && !preview) {
        const interests = [
          ...new Set(
            profile.niches.map((niche) => topicMap[niches.indexOf(niche)]).filter(Boolean),
          ),
        ];
        const { user: updated } = await userService.saveInterests(interests);
        setUser(updated);
      }
      go('voice');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <OnboardingStep step={2}>
      <>
        <h1>
          What moves
          <br />
          <em>your world?</em>
        </h1>
        <p className="subtitle">
          Pick up to 7 niches <span className="count-pill">{profile.niches.length}/7</span>
        </p>
        <div className="chips niches">
          {niches.map((n) => (
            <button
              key={n}
              className={profile.niches.includes(n) ? 'chosen' : ''}
              onClick={() =>
                update(
                  'niches',
                  profile.niches.includes(n)
                    ? profile.niches.filter((i) => i !== n)
                    : profile.niches.length < 7
                      ? [...profile.niches, n]
                      : profile.niches,
                )
              }
            >
              {n}
              {profile.niches.includes(n) && <Check />}
            </button>
          ))}
        </div>
        <div className="bottom-action">
          <Primary disabled={busy} onClick={saveInterests}>
            {busy ? 'Saving…' : 'Continue →'}
          </Primary>
        </div>
      </>
    </OnboardingStep>
  );
}
