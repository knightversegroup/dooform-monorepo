import { Typography } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';

export type UsecasesHeroDict = {
  eyebrow: string;
  heading: string;
  subtitle: string;
};

export default function UsecasesHero({
  dict,
}: {
  dict: UsecasesHeroDict;
}) {
  return (
    <Section padding="none" className="pb-16 pt-16 md:pb-24 md:pt-20">
      <Container>
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl px-8 py-16 md:px-16 md:py-24">
          <img
            src="/hero-bg-1.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <Typography variant="eyebrow" tone="inverse-muted" className="relative">
            {dict.eyebrow}
          </Typography>
          <Typography variant="h1" tone="inverse" className="relative mt-4 max-w-3xl">
            {dict.heading}
          </Typography>
          <Typography variant="lead" tone="inverse-muted" className="relative mt-6 max-w-xl">
            {dict.subtitle}
          </Typography>
        </div>
      </Container>
    </Section>
  );
}
