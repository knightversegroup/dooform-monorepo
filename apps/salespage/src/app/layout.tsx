import './global.css';
import type { ReactNode } from 'react';
import { IBM_Plex_Sans_Thai } from 'next/font/google';
import dict from '../content/dict.json';
import { QueryProvider } from '../lib/query-provider';
import { SiteHeader } from '../components/site-header';
import { SiteFooter } from '../components/site-footer';

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ['thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans-thai',
});

export const metadata = {
  title: dict.metadata.title,
  description: dict.metadata.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th" className="scroll-smooth">
      <body
        className={`min-h-screen bg-white text-gray-900 antialiased ${ibmPlexSansThai.variable} ${ibmPlexSansThai.className}`}
      >
        <QueryProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </QueryProvider>
      </body>
    </html>
  );
}
