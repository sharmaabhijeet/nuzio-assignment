'use client';
import { useSearchParams } from 'next/navigation';
import { legacyScreens } from '../constants/routes';
export function usePreview() {
  const params = useSearchParams();
  return params.get('preview') === '1' || Object.hasOwn(legacyScreens, params.get('screen'));
}
