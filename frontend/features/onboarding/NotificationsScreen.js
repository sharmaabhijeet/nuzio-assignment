'use client';
import Primary from '../../components/ui/PrimaryButton';
import { usePreferences } from '../../providers/PreferencesProvider';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useBrowserPermissions } from '../../hooks/useBrowserPermissions';
import OnboardingStep from './OnboardingStep';
export default function NotificationsScreen() {
  const { profile, update, location } = usePreferences();
  const { go } = useAppNavigation();
  const { requestNotifications } = useBrowserPermissions();
  async function allowNotifications() {
    if (await requestNotifications()) go('ready');
  }
  return (
    <OnboardingStep step={5}>
      <>
        <h1>
          Stay in
          <br />
          <em>the loop.</em>
        </h1>
        <p className="subtitle">Turn on notifications so you never miss your brief.</p>
        <div className="notification-example">
          <div>
            <span className="notif-icon">···</span>
            <strong>Nuzio</strong>
            <small>NOW</small>
          </div>
          <strong>☀️ Your morning brief is ready</strong>
          <p>6 stories · AI & Tech, Markets, Startups · Voice: Aria · 18:30</p>
        </div>
        <span className="micro purple notification-label">WHAT YOU’LL RECEIVE</span>
        <div className="notification-rows">
          {[
            [
              '☀️',
              'Morning brief ready',
              'Your daily audio briefing is waiting',
              'Daily · 7:00 AM',
            ],
            ['⚡', 'Breaking story', 'A major story just broke in your niches', 'When it happens'],
            ['📌', 'Weekly digest', 'The most-saved stories from this week', 'Sundays · 9:00 AM'],
          ].map(([icon, title, sub, time]) => (
            <div key={title}>
              <span className="square-icon">{icon}</span>
              <span>
                <strong>{title}</strong>
                <small>{sub}</small>
              </span>
              <b>{time}</b>
            </div>
          ))}
        </div>
        <div className="bottom-action">
          <Primary onClick={allowNotifications}>Allow notifications</Primary>
          <button className="secondary" onClick={() => go('ready')}>
            Not now
          </button>
        </div>
      </>
    </OnboardingStep>
  );
}
