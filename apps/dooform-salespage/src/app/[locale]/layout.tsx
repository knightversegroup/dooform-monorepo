import { IBM_Plex_Sans_Thai } from 'next/font/google';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { getDictionary } from '../../i18n';
import { i18n, type Locale } from '../../i18n/config';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ['thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans-thai',
});

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <html lang={locale} className="scroll-smooth">
      <body
        className={`min-h-screen bg-white text-gray-900 antialiased ${ibmPlexSansThai.variable} ${ibmPlexSansThai.className}`}
      >
        <Header dict={dict.nav} locale={locale} />
        {children}
        <Footer dict={dict.footer} />
      </body>
    </html>
  );
}
