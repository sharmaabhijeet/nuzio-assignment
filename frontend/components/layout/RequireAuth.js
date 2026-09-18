'use client';
import { useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { usePreview } from '../../hooks/usePreview';
import { useAppNavigation } from '../../hooks/useAppNavigation';
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const preview = usePreview();
  const { go } = useAppNavigation();
  useEffect(() => {
    if (!loading && !user && !preview) go('login', { replace: true });
  }, [loading, user, preview, go]);
  if (!preview && (loading || !user))
    return (
      <div className="empty" role="status">
        Loading your account…
      </div>
    );
  return children;
}
