import './global.css';
import { Kanit, IBM_Plex_Sans_Thai, IBM_Plex_Sans } from 'next/font/google';

// Font configurations
const kanit = Kanit({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-kanit',
  display: 'swap',
});

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-thai',
  display: 'swap',
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex',
  display: 'swap',
});

export const metadata = {
  title: 'Dooform - ผู้ช่วยกรอกเอกสารอัจฉริยะ',
  description: 'กรอกฟอร์มไม่ใช่เรื่องยาก เมื่อมี Dooform ผู้ช่วยกรอกเอกสารอัจฉริยะ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`scroll-smooth ${kanit.variable} ${ibmPlexSansThai.variable} ${ibmPlexSans.variable}`}
    >
      <body className="min-h-screen bg-white text-gray-900 antialiased font-ibm-plex-thai">
        {children}
      </body>
    </html>
  );
}
