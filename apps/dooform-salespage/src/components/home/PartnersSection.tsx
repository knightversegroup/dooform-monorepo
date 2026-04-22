import { Typography } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';

type PartnersDict = {
  heading: string;
  subtitle: string;
};

const PARTNER_COUNT = 6;

function LogoCard() {
  return (
    <div className="flex h-[80px] w-[280px] shrink-0 items-center justify-center rounded-xl bg-white">
      <div className="h-8 w-28 rounded bg-gray-200" />
    </div>
  );
}

export default function PartnersSection({ dict }: { dict: PartnersDict }) {
  const logos = Array.from({ length: PARTNER_COUNT });

  return (
    <Section padding="none">
      <Container className="py-9">
        {/* Header */}
        <div className="mb-9 text-center">
          <Typography variant="h2">
            {dict.heading}
          </Typography>
          <Typography variant="body" className="mt-0.5">
            {dict.subtitle}
          </Typography>
        </div>

        {/* Marquee with edge fade */}
        <div
          className="relative overflow-hidden rounded-2xl bg-[#f5f5f5] py-8"
          style={{
            maskImage:
              'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          }}
        >
          <div className="flex w-max animate-marquee gap-4">
            {logos.map((_, i) => (
              <LogoCard key={`a-${i}`} />
            ))}
            {logos.map((_, i) => (
              <LogoCard key={`b-${i}`} />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
