import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroMain from '../components/sections/HeroMain';
import LogoMarquee from '../components/sections/LogoMarquee';
import Stats from '../components/sections/Stats';
import AccordionFeatures from '../components/sections/AccordionFeatures';
import TestimonialsCarousel from '../components/sections/TestimonialsCarousel';
import FeatureGrid from '../components/sections/FeatureGrid';
import Security from '../components/sections/Security';
import CustomerStories from '../components/sections/CustomerStories';
import BottomCTA from '../components/sections/BottomCTA';

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <HeroMain />
        <LogoMarquee />
        <Stats />
        <AccordionFeatures />
        <TestimonialsCarousel />
        <FeatureGrid />
        <Security />
        <CustomerStories />
        <BottomCTA />
      </main>
      <Footer />
    </>
  );
}
