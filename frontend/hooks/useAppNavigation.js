'use client';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePreview } from './usePreview';
import { routes } from '../constants/routes';
export function useAppNavigation() {
  const router = useRouter();
  const preview = usePreview();
  const href = useCallback(
    (destination) => `${routes[destination] || destination}${preview ? '?preview=1' : ''}`,
    [preview],
  );
  const go = useCallback(
    (destination, { replace = false } = {}) => {
      router[replace ? 'replace' : 'push'](href(destination));
    },
    [router, href],
  );
  return { go, href, router };
}
