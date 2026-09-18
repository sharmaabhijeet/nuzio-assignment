'use client';
import Logo from '../../components/ui/Logo';
import { useAppNavigation } from '../../hooks/useAppNavigation';
export default function SplashScreen() {
  const { go } = useAppNavigation();
  return (
    <section className="splash">
      <div className="splash-glow" />
      <Logo large />
      <div className="splash-tag">
        <h1>News on go</h1>
        <span>YOUR AUDIO BRIEF, EVERY MORNING</span>
      </div>
      <button className="curating" onClick={() => go('language')}>
        <i /> CURATING YOUR BRIEF…
      </button>
    </section>
  );
}
