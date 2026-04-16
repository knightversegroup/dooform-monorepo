import { getDictionary } from '../../i18n';
import { type Locale } from '../../i18n/config';
import FeaturesSection from '../../components/home/FeaturesSection';
import UseCasesSection from '../../components/home/UseCasesSection';
import VideoSection from '../../components/home/VideoSection';
import PartnersSection from '../../components/home/PartnersSection';
import PricingSection from '../../components/home/PricingSection';
import FaqSection from '../../components/home/FaqSection';
import TrialSection from '../../components/home/TrialSection';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <main>
      <PartnersSection dict={dict.partners} />
      <UseCasesSection dict={dict.useCases} />
      <FeaturesSection dict={dict.features} locale={locale} />
      <VideoSection dict={dict.video} locale={locale} />
      <PricingSection dict={dict.pricing} />
      <FaqSection dict={dict.faq} locale={locale} />
      <TrialSection dict={dict.trial} />
    </main>
  );
}
