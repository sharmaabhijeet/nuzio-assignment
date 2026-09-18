'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import * as service from '../services/auth.service';
import { usePreview } from '../hooks/usePreview';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const preview = usePreview();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (preview) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    service
      .getCurrentUser({ signal: controller.signal })
      .then(({ user }) => {
        setUser(user);
        setError('');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setUser(null);
          setError(error.status === 401 ? '' : error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [preview]);
  async function authenticate(mode, credentials) {
    const { user } = await service[mode](credentials);
    setUser(user);
    setError('');
    setLoading(false);
    return user;
  }
  async function signOut() {
    if (user && !preview) await service.logout();
    setUser(null);
    setError('');
  }
  return (
    <AuthContext.Provider value={{ user, setUser, loading, error, authenticate, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
