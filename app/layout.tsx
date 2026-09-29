import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'База дизайна',
  description: 'Композиция, типографика и цвет: задания и прогресс',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <header className="site-head">
          <div className="wrap site-head-inner">
            <Link href="/" className="logo" aria-label="База дизайна, на главную">
              <span className="logo-mark" aria-hidden>
                <span className="sq sq-2" />
                <span className="sq sq-1" />
                <span className="sq sq-0" />
              </span>
              <span className="logo-text">База дизайна</span>
            </Link>
            <nav className="nav">
              <Link href="/b/readme">О программе</Link>
              <Link href="/b/resources">Литература</Link>
              <Link href="/manage">Ментор</Link>
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
      </body>
    </html>
  );
}
