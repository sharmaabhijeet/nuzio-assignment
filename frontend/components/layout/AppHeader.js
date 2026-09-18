'use client';
import { Search } from 'lucide-react';
import Logo from '../ui/Logo';
import { useAppNavigation } from '../../hooks/useAppNavigation';
export default function AppHeader() {
  const { go } = useAppNavigation();
  return (
    <header className="app-header">
      <Logo />
      <div>
        <button aria-label="Search" onClick={() => go('discover')}>
          <Search size={17} />
        </button>
        <button aria-label="Notifications" onClick={() => go('notifications')}>
          🔔
          <i />
        </button>
      </div>
    </header>
  );
}
