import { Typography } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';

type PartnersDict = {
  heading: string;
  subtitle: string;
};

const LOGOS = [
  '/logo-group/logo-1.png',
  '/logo-group/logo-2.png',
  '/logo-group/logo-3.png',
  '/logo-group/logo-4.png',
];

export default function PartnersSection({ dict }: { dict: PartnersDict }) {
  const doubled = [...LOGOS, ...LOGOS];

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
          className="relative overflow-hidden py-8"
          style={{
            maskImage:
              'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          }}
        >
          <div className="flex w-max animate-marquee gap-4">
            {doubled.map((src, i) => (
              <div
                key={i}
                className="flex h-[60px] w-[160px] shrink-0 items-center justify-center"
              >
                <img
                  src={src}
                  alt=""
                  className="h-10 max-w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
