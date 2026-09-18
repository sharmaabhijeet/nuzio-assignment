'use client';
import Link from 'next/link';
import { useState } from 'react';
import Logo from '../../components/ui/Logo';
import Primary from '../../components/ui/PrimaryButton';
import { useAuth } from '../../providers/AuthProvider';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { validateCredentials } from './validation';
export default function AuthForm({ mode }) {
  const registering = mode === 'register';
  const { authenticate } = useAuth();
  const { router, href } = useAppNavigation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const values = validateCredentials(
        Object.fromEntries(new FormData(event.currentTarget)),
        mode,
      );
      await authenticate(mode, values);
      // Authentication leaves design-preview mode and enters the actual account.
      router.replace(registering ? '/onboarding/profession' : '/brief');
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="auth-page screen">
      <Link className="auth-back" href={href('welcome')}>
        ← Back
      </Link>
      <Logo large />
      <h1>{registering ? 'Create your account' : 'Welcome back.'}</h1>
      <p className="subtitle">Sign in to save your personalised brief.</p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <form onSubmit={submit}>
        {registering && (
          <label>
            Full name
            <input name="name" required maxLength={80} autoComplete="name" />
          </label>
        )}
        <label>
          Email address
          <input name="email" type="email" required maxLength={254} autoComplete="email" />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete={registering ? 'new-password' : 'current-password'}
          />
        </label>
        <Primary type="submit" disabled={busy}>
          {busy ? 'Please wait…' : registering ? 'Create account' : 'Sign in'}
        </Primary>
      </form>
      <Link className="auth-switch" href={href(registering ? 'login' : 'register')}>
        {registering ? 'Already registered? Sign in' : 'New here? Create an account'}
      </Link>
    </section>
  );
}
