import dict from '../content/dict.json';
import HeroSection from '../components/home/HeroSection';
import PartnersSection from '../components/home/PartnersSection';
import DemoVideoSection from '../components/home/DemoVideoSection';
import AudienceSection from '../components/home/AudienceSection';
import HowItWorksSection from '../components/home/HowItWorksSection';
import FeatureCarouselSection from '../components/home/FeatureCarouselSection';
import PricingSection from '../components/home/PricingSection';
import FaqSection from '../components/home/FaqSection';
import ContactSection from '../components/home/ContactSection';
import TestimonialsSection from '../components/home/TestimonialsSection';
import ArticlesSection from '../components/home/ArticlesSection';
import TrialSection from '../components/home/TrialSection';

export default function HomePage() {
  return (
    <>
      <HeroSection dict={dict.hero} />
      <PartnersSection dict={dict.partners} />
      <DemoVideoSection dict={dict.demoVideo} />
      <HowItWorksSection dict={dict.howItWorks} />
      <AudienceSection dict={dict.audience} />
      <FeatureCarouselSection
        dict={dict.featureCarousel}
        className="bg-white"
        id="business-features"
        imageSrc="/images/home/business-screenshot.png"
      />
      <FeatureCarouselSection
        dict={dict.featureCarousel2}
        className="bg-slate-50"
        id="translator-features"
        logosStrip="/images/home/translator-logos.png"
      />
      <PricingSection dict={dict.pricing} />
      <TestimonialsSection dict={dict.testimonials} />
      <ArticlesSection dict={dict.articles} />
      <FaqSection dict={dict.faq} locale="th" />
      <ContactSection dict={dict.contact} />
      <TrialSection dict={dict.trial} />
    </>
  );
}
