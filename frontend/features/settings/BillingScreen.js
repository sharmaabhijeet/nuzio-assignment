'use client';
import { useNotice } from '../../providers/NoticeProvider';
export default function BillingScreen() {
  const { setNotice } = useNotice();
  return (
    <section className="screen billing">
      <h1>Plan & billing</h1>
      <p className="subtitle">Start free. Upgrade when mornings pay for themselves.</p>
      {[
        [
          'Free',
          '₹0',
          'mo',
          '5 article summaries per niche daily. Ad supported. Push notifications.',
          'Current plan',
        ],
        [
          'Pro',
          '₹79',
          'mo',
          'Unlimited custom briefings, premium AI voices, multi-language support.',
          'Upgrade to Pro',
        ],
        [
          'Pro Annual',
          '₹1499',
          'yr',
          'All Pro benefits, offline mode, priority features. Locks in your plan for a year.',
          'Choose annual',
        ],
      ].map(([title, price, period, description, cta]) => (
        <article className={`plan-card ${title === 'Pro' ? 'pro' : ''}`} key={title}>
          <h2>
            {title}
            {title === 'Pro' && <span>LAUNCH OFFER</span>}
          </h2>
          <div className="price">
            {price}
            <small>/{period}</small>
          </div>
          <p>{description}</p>
          <button
            className={title === 'Pro' ? 'primary gradient-green' : 'secondary'}
            disabled={title === 'Free'}
            onClick={() =>
              setNotice('This is a pricing preview. Payments and subscriptions are not connected.')
            }
          >
            {cta}
          </button>
        </article>
      ))}
    </section>
  );
}
