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
        <Typography variant="eyebrow" className="text-[#2c2585]">
          {dict.eyebrow}
        </Typography>
        <Typography variant="h1" className="mt-4 max-w-3xl leading-[1.1] tracking-tight">
          {dict.heading}
        </Typography>
        <Typography variant="body-lg" className="mt-6 max-w-xl leading-relaxed">
          {dict.subtitle}
        </Typography>
      </Container>
    </Section>
  );
}
