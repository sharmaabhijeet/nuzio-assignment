'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { legacyScreens } from '../../constants/routes';
import { useAuth } from '../../providers/AuthProvider';
import SplashScreen from './SplashScreen';
export default function EntryRedirect() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading } = useAuth();
  const requested = params.get('screen');
  useEffect(() => {
    if (Object.hasOwn(legacyScreens, requested)) {
      router.replace(`${legacyScreens[requested]}?preview=1`);
      return;
    }
    if (!loading) router.replace(user ? '/brief' : '/onboarding/language');
  }, [requested, loading, user, router]);
  return <SplashScreen />;
}
