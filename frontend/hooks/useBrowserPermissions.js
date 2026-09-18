'use client';
import { usePreferences } from '../providers/PreferencesProvider';
import { useNotice } from '../providers/NoticeProvider';
export function useBrowserPermissions() {
  const { location, setLocation, update } = usePreferences();
  const { setNotice } = useNotice();
  function enableLocation() {
    if (location) {
      setLocation(false);
      return;
    }
    if (!navigator.geolocation) {
      setNotice('Location is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocation(true);
        setNotice('Location enabled for this session.');
      },
      () => setNotice('Location access was not granted. You can continue without it.'),
    );
  }
  async function requestNotifications() {
    if (!('Notification' in window)) {
      setNotice('Notifications are not supported by this browser.');
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      update('notifications', permission === 'granted');
      if (permission !== 'granted')
        setNotice('Notifications were not allowed. You can continue without them.');
      return permission === 'granted';
    } catch {
      setNotice('Notifications could not be enabled. You can continue without them.');
      return false;
    }
  }
  return { enableLocation, requestNotifications };
}
