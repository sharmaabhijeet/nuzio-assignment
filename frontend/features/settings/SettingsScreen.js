'use client';
import { ChevronRight } from 'lucide-react';
import Toggle from '../../components/ui/Toggle';
import { useAuth } from '../../providers/AuthProvider';
import { usePreferences } from '../../providers/PreferencesProvider';
import { useNews } from '../../providers/NewsProvider';
import { usePlayback } from '../../providers/PlaybackProvider';
import { useNotice } from '../../providers/NoticeProvider';
import { usePreview } from '../../hooks/usePreview';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useBrowserPermissions } from '../../hooks/useBrowserPermissions';
import { withoutIcon } from '../../lib/demo';
export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { profile, update, location } = usePreferences();
  const { saved } = useNews();
  const { player } = usePlayback();
  const { setNotice } = useNotice();
  const preview = usePreview();
  const { go, router } = useAppNavigation();
  const { requestNotifications: allowNotifications } = useBrowserPermissions();
  const name = user?.name?.split(' ')[0] || 'Aarav';
  const showSaved = () => go('saved');
  async function logout() {
    try {
      await signOut();
      window.speechSynthesis?.cancel();
      player.selectSource(null);
      router.replace('/login');
    } catch (error) {
      setNotice(error.message);
    }
  }
  return (
    <section className="screen settings">
      <h1>Settings</h1>
      <p className="subtitle">Tune your morning.</p>
      <button className="settings-profile" onClick={() => go('profession')}>
        <span className="voice-avatar aria">{name[0]}</span>
        <span>
          <strong>{user?.name || 'Aarav Sharma'}</strong>
          <small>
            {withoutIcon(profile.profession)} ·{' '}
            {preview ? 'Mumbai, India' : location ? 'Location enabled' : 'Location not set'}
          </small>
        </span>
        <b>Edit ›</b>
      </button>
      <div className="settings-links">
        <button onClick={showSaved}>
          <span className="square-icon">📌</span>
          <span>
            <strong>Saved stories</strong>
            <small>{preview ? 3 : saved.length} saved</small>
          </span>
          <ChevronRight size={12} />
        </button>
        <button onClick={() => go('billing')}>
          <span className="square-icon">💳</span>
          <span>
            <strong>Plan & billing</strong>
            <small>Free — upgrade for unlimited</small>
          </span>
          <b>Free ›</b>
        </button>
      </div>
      <span className="micro purple">APPEARANCE</span>
      <div className="appearance">
        {['dark', 'light'].map((theme) => (
          <button
            key={theme}
            className={profile.theme === theme ? 'selected' : ''}
            onClick={() => update('theme', theme)}
          >
            {theme === 'dark' ? '🌙 Dark' : '☀ Light'}
          </button>
        ))}
      </div>
      <div className="settings-toggles">
        {[
          ['📥', 'Offline mode', 'Download briefs for the commute', 'offline'],
          ['⏭', 'Auto-advance', 'Play the next story automatically', 'autoAdvance'],
          ['🔔', 'Push notifications', 'Brief drops & breaking news', 'notifications'],
        ].map(([icon, title, sub, key]) => (
          <div key={key}>
            <span className="square-icon">{icon}</span>
            <span>
              <strong>{title}</strong>
              <small>{sub}</small>
            </span>
            <Toggle
              label={title}
              checked={!!profile[key]}
              onChange={() => {
                if (key === 'notifications') {
                  if (profile.notifications) update(key, false);
                  else allowNotifications();
                } else if (key === 'offline')
                  setNotice(
                    'Offline audio downloads require an audio service and are not connected yet.',
                  );
                else update(key, !profile[key]);
              }}
            />
          </div>
        ))}
      </div>
      <span className="micro purple">BRIEF PREFERENCES</span>
      <button className="settings-edit secondary" onClick={() => go('voice')}>
        Voice, length & delivery time <ChevronRight size={13} />
      </button>
      <button className="signout secondary" onClick={logout}>
        Sign out
      </button>
    </section>
  );
}
