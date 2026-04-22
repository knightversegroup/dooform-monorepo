import { Typography } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';

type FeaturesHeroDict = {
  heading: string;
  subtitle: string;
  categories: string[];
};

export default function FeaturesHero({ dict }: { dict: FeaturesHeroDict }) {
  return (
    <Section padding="none">
      <Container className="pt-10 pb-8">
        {/* Header row */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <Typography variant="h1">
            {dict.heading}
          </Typography>
          <Typography variant="body" className="max-w-sm leading-relaxed md:text-right">
            {dict.subtitle}
          </Typography>
        </div>

        {/* Category grid on dark background */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-[#1B1464] p-6 md:p-10">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {dict.categories.map((category, i) => (
              <div
                key={i}
                className="flex items-center justify-center rounded-xl bg-white/10 px-3 py-5 text-center text-xs font-medium text-white transition hover:bg-white/15 md:px-6 md:text-sm"
              >
                {category}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
