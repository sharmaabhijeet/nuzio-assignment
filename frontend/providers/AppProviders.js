'use client';
import { NoticeProvider } from './NoticeProvider';
import { AuthProvider } from './AuthProvider';
import { PreferencesProvider } from './PreferencesProvider';
import { NewsProvider } from './NewsProvider';
import { PlaybackProvider } from './PlaybackProvider';
import MobileFrame from '../components/layout/MobileFrame';
export default function AppProviders({ children }) {
  return (
    <NoticeProvider>
      <AuthProvider>
        <PreferencesProvider>
          <NewsProvider>
            <PlaybackProvider>
              <MobileFrame>{children}</MobileFrame>
            </PlaybackProvider>
          </NewsProvider>
        </PreferencesProvider>
      </AuthProvider>
    </NoticeProvider>
  );
}
