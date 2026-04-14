import { IBM_Plex_Sans_Thai } from 'next/font/google';
import './global.css';
import Header from '../components/layout/Header';

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ['thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans-thai',
});

export const metadata = {
  title: 'Dooform - Build Forms That Convert',
  description:
    'Create beautiful, responsive forms in minutes. No coding required.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`min-h-screen bg-white text-gray-900 antialiased ${ibmPlexSansThai.variable} ${ibmPlexSansThai.className}`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
