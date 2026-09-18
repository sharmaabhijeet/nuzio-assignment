'use client';
import Primary from '../../components/ui/PrimaryButton';
import { usePreferences } from '../../providers/PreferencesProvider';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import Logo from '../../components/ui/Logo';
import Toggle from '../../components/ui/Toggle';
import { useBrowserPermissions } from '../../hooks/useBrowserPermissions';
export default function LanguageScreen() {
  const { profile, update, location } = usePreferences();
  const { go } = useAppNavigation();
  const { enableLocation } = useBrowserPermissions();
  return (
    <section className="language screen">
      <div className="center-logo">
        <Logo large />
      </div>
      <h1>
        Choose your
        <br />
        <em>language</em>
      </h1>
      <p className="subtitle">Select the language for your daily brief.</p>
      <div className="language-options">
        {[
          ['🇬🇧', 'English', 'Briefings delivered in English'],
          ['🇮🇳', 'हिन्दी', 'हिन्दी में समाचार सुनें'],
        ].map(([flag, label, sub]) => (
          <button
            className={`option-card ${profile.language === label ? 'selected' : ''}`}
            key={label}
            onClick={() => update('language', label)}
          >
            <span className="flag">{flag}</span>
            <span>
              <strong>{label}</strong>
              <small>{sub}</small>
            </span>
            <span className="radio-dot" />
          </button>
        ))}
      </div>
      <div className="location-card">
        <div className="square-icon">📍</div>
        <div>
          <strong>Enable Location</strong>
          <small>Get hyperlocal news tailored to your city.</small>
          <div className="location-status">⌾ {location ? 'ALLOWED' : 'NOT ALLOWED'}</div>
        </div>
        <Toggle label="Enable location" checked={location} onChange={enableLocation} />
      </div>
      <div className="bottom-action">
        <Primary onClick={() => go('welcome')}>Continue →</Primary>
      </div>
    </section>
  );
}
