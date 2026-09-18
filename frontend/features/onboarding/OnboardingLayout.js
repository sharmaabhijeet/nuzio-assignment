'use client';
import { usePathname } from 'next/navigation';
import RequireAuth from '../../components/layout/RequireAuth';
export default function OnboardingLayout({ children }) {
  const pathname = usePathname();
  return pathname === '/onboarding/language' ? children : <RequireAuth>{children}</RequireAuth>;
}
