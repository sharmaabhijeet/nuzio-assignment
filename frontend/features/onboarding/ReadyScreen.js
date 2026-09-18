'use client';
import Primary from '../../components/ui/PrimaryButton';
import { usePreferences } from '../../providers/PreferencesProvider';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { Check } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { withoutIcon } from '../../lib/demo';
export default function ReadyScreen() {
  const { profile, update, location } = usePreferences();
  const { go } = useAppNavigation();
  const { user } = useAuth();
  const name = user?.name?.split(' ')[0] || 'Aarav';
  return (
    <section className="screen ready">
      <span className="micro mint">✓ ALL SET</span>
      <div className="ready-heading">
        <div className="ready-check">
          <Check size={34} />
        </div>
        <h1>
          You’re ready,
          <br />
          <em>{name}.</em>
        </h1>
        <p>
          Your first brief will be ready tomorrow at {profile.time} {profile.period}.<br />
          We’re already curating.
        </p>
      </div>
      <span className="micro purple">YOUR BRIEF PROFILE</span>
      <div className="profile-rows">
        {[
          ['💼', 'PROFESSION', withoutIcon(profile.profession)],
          ['📡', 'NICHES', profile.niches.map((n) => withoutIcon(n)).join(', ')],
          ['🎙', 'VOICE', `${profile.voice} — British, warm`],
          ['◷', 'LENGTH', `${profile.length} · ${profile.length === '5 min' ? '5' : '10'} stories`],
          ['☀️', 'DELIVERY', `Daily at ${profile.time} ${profile.period}`],
        ].map(([icon, label, value]) => (
          <div key={label}>
            <span className="square-icon">{icon}</span>
            <span>
              <small>{label}</small>
              <strong>{value}</strong>
            </span>
            <Check size={13} />
          </div>
        ))}
      </div>
      <div className="bottom-action">
        <Primary className="gradient-green" onClick={() => go('brief')}>
          Start listening →
        </Primary>
      </div>
    </section>
  );
}
