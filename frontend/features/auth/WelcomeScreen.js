'use client';
import { useCallback, useState } from 'react';
import Logo from '../../components/ui/Logo';
import InformationDialog from '../../components/ui/InformationDialog';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { useNotice } from '../../providers/NoticeProvider';
export default function WelcomeScreen() {
  const { go } = useAppNavigation();
  const { setNotice } = useNotice();
  const [reading, setReading] = useState(null);
  const close = useCallback(() => setReading(null), []);
  return (
    <>
      <section className="login screen">
        <div className="login-glow" />
        <div className="center-logo">
          <Logo large />
        </div>
        <div className="login-title">
          <h1>
            Good morning.
            <br />
            <em>News on go.</em>
          </h1>
          <p>
            Personalised audio news for Indian
            <br />
            professionals — curated every morning.
          </p>
        </div>
        <div className="bottom-action">
          <button
            className="google-button"
            onClick={() =>
              setNotice(
                'Google sign-in needs OAuth configuration. Use Continue with email to sign in or register.',
              )
            }
          >
            <span className="google-g">G</span>Continue with Google
          </button>
          <button className="email-entry" onClick={() => go('login')}>
            Continue with email
          </button>
          <p className="terms">
            By continuing you agree to our{' '}
            <button
              onClick={() =>
                setReading({
                  title: 'Terms',
                  content:
                    'This is an assignment demo. No paid subscription or live news service is provided.',
                })
              }
            >
              Terms
            </button>{' '}
            &{' '}
            <button
              onClick={() =>
                setReading({
                  title: 'Privacy Policy',
                  content:
                    'Your account name, email, password hash, interests, sessions, and bookmarks are stored in MongoDB. Additional reading preferences are saved in this browser.',
                })
              }
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </section>
      {reading && <InformationDialog {...reading} onClose={close} />}
    </>
  );
}
