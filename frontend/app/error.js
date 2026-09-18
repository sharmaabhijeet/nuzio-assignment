'use client';
export default function ErrorPage({ reset }) {
  return (
    <section className="screen empty">
      <h1>Something went wrong.</h1>
      <p>Please try loading this page again.</p>
      <button className="secondary" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
