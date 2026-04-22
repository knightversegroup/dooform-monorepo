import { Button, Typography } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';

export type UsecasesCtaDict = {
  heading: string;
  subtitle: string;
  button: string;
};

export default function UsecasesCta({
  dict,
}: {
  dict: UsecasesCtaDict;
}) {
  return (
    <Section padding="none" className="pb-24">
      <Container>
        <div className="rounded-2xl bg-[#1B1464] px-8 py-16 text-center md:px-16 md:py-20">
          <Typography variant="h2" className="tracking-tight text-white">
            {dict.heading}
          </Typography>
          <Typography variant="body" className="mx-auto mt-4 max-w-md text-white/50">
            {dict.subtitle}
          </Typography>
          <Button variant="primary" size="lg" href="#trial" className="mt-8">
            {dict.button}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
