import dict from '../content/dict.json';
import HeroSection from '../components/home/HeroSection';
import PartnersSection from '../components/home/PartnersSection';
import UseCasesSection from '../components/home/UseCasesSection';
import FeaturesHighlightSection from '../components/home/FeaturesHighlightSection';
import FeaturesSection from '../components/home/FeaturesSection';
import WorkspaceSection from '../components/home/WorkspaceSection';
import PricingSection from '../components/home/PricingSection';
import FaqSection from '../components/home/FaqSection';
import ContactSection from '../components/home/ContactSection';
import TrialSection from '../components/home/TrialSection';
import UsecasesHero from '../components/usecases/UsecasesHero';

export default function HomePage() {
  return (
    <>
      <HeroSection dict={dict.hero} />
      <PartnersSection dict={dict.partners} />
      <UseCasesSection dict={dict.useCases} />
      <FeaturesHighlightSection dict={dict.featuresHighlight} />
      <FeaturesSection dict={dict.features} locale="th" />
      <WorkspaceSection dict={dict.workspace} />
      <PricingSection dict={dict.pricing} />
      <UsecasesHero dict={dict.usecasesPage.hero} />
      <FaqSection dict={dict.faq} locale="th" />
      {/*<TrialSection dict={dict.trial} />*/}
      <ContactSection dict={dict.contact} />
    </>
  );
}
