import Link from 'next/link';
export default function NotFound() {
  return (
    <section className="screen empty">
      <h1>Page not found</h1>
      <p>This page does not exist.</p>
      <Link href="/">Back to Nuzio</Link>
    </section>
  );
}
