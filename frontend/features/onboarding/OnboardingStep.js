'use client';
import Logo from '../../components/ui/Logo';
import { useAppNavigation } from '../../hooks/useAppNavigation';
const nextSteps = { 1: 'niches', 2: 'voice', 3: 'time', 4: 'notifications', 5: 'ready' };
export default function OnboardingStep({ step, children }) {
  const { go } = useAppNavigation();
  return (
    <>
      <header className="onboarding-header">
        <Logo />
        <button onClick={() => go(nextSteps[step])}>SKIP →</button>
      </header>
      <section className="screen onboarding">
        <div className="progress">
          {[1, 2, 3, 4, 5, 6].map((value) => (
            <span key={value} className={value <= step ? 'done' : ''} />
          ))}
        </div>
        <span className="micro purple">STEP {step} OF 6</span>
        {children}
      </section>
    </>
  );
}
