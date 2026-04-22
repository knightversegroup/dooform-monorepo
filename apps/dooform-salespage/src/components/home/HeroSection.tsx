import { Button } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';

type HeroDict = {
  heading: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
};

export default function HeroSection({ dict }: { dict: HeroDict }) {
  return (
    <Section padding="none">
      <Container className="flex flex-col items-center pt-10 pb-16">
        {/* Hero Image */}
        <div className="aspect-[361/250] w-full rounded-xl bg-gradient-to-b from-[#d9d9d9] to-white md:aspect-[16/7] md:rounded-2xl">
          {/* Replace with actual hero image/video */}
        </div>

        {/* Text Content */}
        <div className="mt-8 flex flex-col items-center gap-3 text-center md:mt-12">
          <div>
            <h1 className="text-2xl font-semibold text-black md:text-4xl">
              {dict.heading}
            </h1>
            <p className="mt-0.5 text-sm text-black md:text-base">
              {dict.subtitle}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="primary" size="md" href="#trial">
              {dict.primaryCta}
            </Button>
            <Button variant="secondary" size="md" href="#features">
              {dict.secondaryCta}
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
