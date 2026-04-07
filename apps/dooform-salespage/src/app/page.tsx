import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroMain from '../components/sections/HeroMain';
import LogoMarquee from '../components/sections/LogoMarquee';
import DocumentSelect from '../components/sections/DocumentSelect';
import { HowItWorks, Benefits, FeatureList, CostSaving } from '../components/sections/FeatureSection';
import Pricing from '../components/sections/Pricing';
import FAQ from '../components/sections/FAQ';
import BottomCTA from '../components/sections/BottomCTA';

export default function Page() {
  return (
    <>
      <Header />
      <main>
        {/* Section 2: Hero */}
        <HeroMain />

        {/* Section 3: Logo Marquee */}
        <LogoMarquee />

        {/* Section 4: Document Selection (blank placeholder) */}
        <DocumentSelect />

        {/* Section 5: How it works */}
        <HowItWorks />

        {/* Section 6: Benefits */}
        <Benefits />

        {/* Section 7: Feature List */}
        <FeatureList />

        {/* Section 8: Cost Saving */}
        <CostSaving />

        {/* Section 9: Pricing */}
        <Pricing />

        {/* Section 10: FAQ */}
        <FAQ />

        {/* Section 11: CTA */}
        <BottomCTA />
      </main>

      {/* Section 12: Footer */}
      <Footer />
    </>
  );
}
