import { Typography } from '@dooform/ui';
import { Container } from '@dooform/ui';

export type ComplianceHeroDict = {
  heading: string;
  subtitle: string;
};

export default function ComplianceHero({
  dict,
}: {
  dict: ComplianceHeroDict;
}) {
  return (
    <section className="relative overflow-hidden bg-[#1B1464] px-[10px] py-24 md:py-32">
      {/* Bauhaus geometric shapes */}
      <div className="pointer-events-none absolute inset-0">
        {/* Large circle — top right */}
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full border-[3px] border-white/20 md:h-[28rem] md:w-[28rem]" />
        {/* Small filled circle — left */}
        <div className="absolute left-12 top-1/3 h-16 w-16 rounded-full bg-[#2c2585] md:h-24 md:w-24" />
        {/* Triangle — bottom left */}
        <div
          className="absolute -bottom-4 left-1/4 opacity-40"
          style={{
            width: 0,
            height: 0,
            borderLeft: '60px solid transparent',
            borderRight: '60px solid transparent',
            borderBottom: '104px solid #4338ca',
          }}
        />
        {/* Horizontal line */}
        <div className="absolute right-0 top-2/3 h-[3px] w-1/3 bg-white/10" />
        {/* Small square */}
        <div className="absolute bottom-16 right-1/4 h-12 w-12 border-[3px] border-white/15 md:h-16 md:w-16" />
      </div>

      <Container className="relative">
        <Typography variant="eyebrow" className="text-white/50">
          Security & Compliance
        </Typography>
        <Typography variant="h1" className="mt-4 max-w-3xl leading-tight text-white">
          {dict.heading}
        </Typography>
        <Typography variant="body-lg" className="mt-6 max-w-xl leading-relaxed text-white/60">
          {dict.subtitle}
        </Typography>
      </Container>
    </section>
  );
}
