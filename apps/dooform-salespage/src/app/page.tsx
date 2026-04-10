import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Hero from '../components/sections/Hero';
import TrustBadges from '../components/sections/TrustBadges';
import DocumentSelect from '../components/sections/DocumentSelect';
import Partners from '../components/sections/Partners';
import CustomerStories from '../components/sections/CustomerStories';
import Features from '../components/sections/Features';
import CostSection from '../components/sections/CostSection';
import Pricing from '../components/sections/Pricing';
import FAQ from '../components/sections/FAQ';
import CTAForm from '../components/sections/CTAForm';

export default function Page() {
  return (
    <>
      <Header />
      <main>
        {/* Section 1: Hero */}
        <Hero />

        {/* Section 2: Trust Badges */}
        <TrustBadges />

        {/* Section 3: Document Select */}
        <DocumentSelect />

        {/* Section 4: Partners */}
        <Partners />

        {/* Section 5: Customer Stories */}
        <CustomerStories />

        {/* Section 6: Features */}
        <Features />

        {/* Section 7: Cost Section */}
        <CostSection />

        {/* Section 8: Pricing */}
        <Pricing />

        {/* Section 9: FAQ */}
        <FAQ />

        {/* Section 10: CTA Form */}
        <CTAForm />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
