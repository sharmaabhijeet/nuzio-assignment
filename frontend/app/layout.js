import { Suspense } from 'react';
import AppProviders from '../providers/AppProviders';
import './globals.css';
export const metadata = {
  title: 'Nuzio — Your world, in focus',
  description: 'A personal space for stories that matter to you.',
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Suspense
          fallback={
            <div className="phone">
              <p className="empty" role="status">
                Loading Nuzio…
              </p>
            </div>
          }
        >
          <AppProviders>{children}</AppProviders>
        </Suspense>
      </body>
    </html>
  );
}
