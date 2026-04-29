import { getDictionary } from '../../i18n';
import { type Locale } from '../../i18n/config';
import HeroSection from '../../components/home/HeroSection';
import FeaturesSection from '../../components/home/FeaturesSection';
import UseCasesSection from '../../components/home/UseCasesSection';
import VideoSection from '../../components/home/VideoSection';
import PartnersSection from '../../components/home/PartnersSection';
import PricingSection from '../../components/home/PricingSection';
import FaqSection from '../../components/home/FaqSection';
import TrialSection from '../../components/home/TrialSection';
import WorkspaceSection from '../../components/home/WorkspaceSection';
import FeaturesHighlightSection from '../../components/home/FeaturesHighlightSection';
import UsecasesHero from '../../components/usecases/UsecasesHero';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <main>
      <HeroSection dict={dict.hero} />
      <PartnersSection dict={dict.partners} />
      <UseCasesSection dict={dict.useCases} />
      <FeaturesHighlightSection dict={dict.featuresHighlight} />
      <FeaturesSection dict={dict.features} locale={locale} />
      <WorkspaceSection dict={dict.workspace} />
      {/* <VideoSection dict={dict.video} locale={locale} /> */}
      <PricingSection dict={dict.pricing} />
      <UsecasesHero dict={dict.usecasesPage.hero} />
      <FaqSection dict={dict.faq} locale={locale} />
      <TrialSection dict={dict.trial} />
    </main>
  );
}
