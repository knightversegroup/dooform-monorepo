import { Button } from '@dooform/ui';
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
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {dict.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-white/50">
            {dict.subtitle}
          </p>
          <Button variant="primary" size="lg" href="#trial" className="mt-8">
            {dict.button}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
