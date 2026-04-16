import { getDictionary } from '../../i18n';
import { type Locale } from '../../i18n/config';
import FeaturesSection from '../../components/home/FeaturesSection';
import UseCasesSection from '../../components/home/UseCasesSection';
import PricingSection from '../../components/home/PricingSection';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <main>
      <FeaturesSection dict={dict.features} locale={locale} />
      <UseCasesSection dict={dict.useCases} />
      <PricingSection dict={dict.pricing} />
    </main>
  );
}
