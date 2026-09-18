'use client';
import { X } from 'lucide-react';
import { useNotice } from '../../providers/NoticeProvider';
import { usePreferences } from '../../providers/PreferencesProvider';
import StatusBar from './StatusBar';
export default function MobileFrame({ children }) {
  const { profile } = usePreferences();
  const { notice, setNotice } = useNotice();
  return (
    <div className={`phone theme-${profile.theme}`}>
      <StatusBar />
      {notice && (
        <div className="message" role="status">
          {notice}
          <button aria-label="Dismiss message" onClick={() => setNotice('')}>
            <X size={14} />
          </button>
        </div>
      )}
      {children}
    </div>
  );
}
