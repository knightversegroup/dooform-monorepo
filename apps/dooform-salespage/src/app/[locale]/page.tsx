import { getDictionary } from '../../i18n';
import { type Locale } from '../../i18n/config';
import FeaturesSection from '../../components/home/FeaturesSection';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <main>
      <FeaturesSection dict={dict.features} locale={locale} />
    </main>
  );
}
