import dict from '../content/dict.json';
import HeroSection from '../components/home/HeroSection';
import PartnersSection from '../components/home/PartnersSection';
import UseCasesSection from '../components/home/UseCasesSection';
import AudienceSection from '../components/home/AudienceSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import FeaturesHighlightSection from '../components/home/FeaturesHighlightSection';
import FeatureCarouselSection from '../components/home/FeatureCarouselSection';
import FeaturesSection from '../components/home/FeaturesSection';
import WorkspaceSection from '../components/home/WorkspaceSection';
import PricingSection from '../components/home/PricingSection';
import FaqSection from '../components/home/FaqSection';
import ContactSection from '../components/home/ContactSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import ArticlesSection from '../components/home/ArticlesSection';
import TrialSection from '../components/home/TrialSection';
import UsecasesHero from '../components/usecases/UsecasesHero';

export default function HomePage() {
  return (
    <>
      <HeroSection dict={dict.hero} />
      <PartnersSection dict={dict.partners} />
      <UseCasesSection dict={dict.useCases} />
      <AudienceSection dict={dict.audience} />
      <HowItWorksSection dict={dict.howItWorks} />
      {/* <FeaturesHighlightSection dict={dict.featuresHighlight} /> */}
      <FeatureCarouselSection
        dict={dict.featureCarousel}
        className="bg-white"
      />
      <FeatureCarouselSection
        dict={dict.featureCarousel2}
        className="bg-slate-50"
      />
      {/* <FeaturesSection dict={dict.features} locale="th" /> */}
      {/* <WorkspaceSection dict={dict.workspace} /> */}
      <PricingSection dict={dict.pricing} />
      <TestimonialsSection dict={dict.testimonials} />
      <ArticlesSection dict={dict.articles} />
      {/* <UsecasesHero dict={dict.usecasesPage.hero} /> */}
      <FaqSection dict={dict.faq} locale="th" />
      <ContactSection dict={dict.contact} />
      <TrialSection dict={dict.trial} />
    </>
  );
}
