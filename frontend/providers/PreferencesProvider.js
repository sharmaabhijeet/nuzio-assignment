'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { defaults } from '../constants/onboarding';
import { useAuth } from './AuthProvider';
import { usePreview } from '../hooks/usePreview';
const PreferencesContext = createContext(null);
export function PreferencesProvider({ children }) {
  const { user } = useAuth();
  const preview = usePreview();
  const owner = preview ? 'preview' : user?.id || 'guest';
  const [state, setState] = useState({ owner: 'guest', value: defaults });
  const [location, setLocation] = useState(false);
  useEffect(() => {
    let value = defaults;
    try {
      const stored = owner !== 'guest' && localStorage.getItem(`nuzio-profile-${owner}`);
      if (stored) value = { ...defaults, ...JSON.parse(stored) };
      else if (state.owner === 'guest') value = state.value;
    } catch {
      /* Storage may be unavailable in private browsing. */
    }
    setState({ owner, value });
    // A change of account must load before the persistence effect can write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner]);
  useEffect(() => {
    if (state.owner !== owner || owner === 'guest' || owner === 'preview') return;
    try {
      localStorage.setItem(`nuzio-profile-${owner}`, JSON.stringify(state.value));
    } catch {}
  }, [owner, state]);
  const update = (key, value) =>
    setState((previous) => ({ ...previous, value: { ...previous.value, [key]: value } }));
  return (
    <PreferencesContext.Provider value={{ profile: state.value, update, location, setLocation }}>
      {children}
    </PreferencesContext.Provider>
  );
}
export const usePreferences = () => useContext(PreferencesContext);
