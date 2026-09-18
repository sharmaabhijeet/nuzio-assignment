import AuthForm from '../../../features/auth/AuthForm';
export const metadata = { title: 'Sign in — Nuzio' };
export default function Page() {
  return <AuthForm mode="login" />;
}
