import { Container, Section, Typography } from '@dooform/ui';

type DemoVideoDict = {
  videoLabel: string;
  headingLine1: string;
  headingLine2: string;
  description: string;
  note: string;
  cta: string;
};

export default function DemoVideoSection({ dict }: { dict: DemoVideoDict }) {
  return (
    <Section padding="lg" className="bg-white">
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-12">
          {/* Video placeholder — swap for an embedded player when the
           * animation video asset lands. */}
          <div className="flex aspect-video items-center justify-center rounded-3xl bg-df-sky p-8">
            <Typography
              variant="h4"
              as="p"
              tone="inherit"
              align="center"
              className="text-df-navy"
            >
              {dict.videoLabel}
            </Typography>
          </div>

          <div className="flex flex-col items-start gap-5">
            <Typography variant="h1" as="h2">
              {dict.headingLine1}
              <br />
              {dict.headingLine2}
            </Typography>
            <Typography variant="body" tone="muted">
              {dict.description}
            </Typography>
            <Typography variant="body" weight="semibold">
              {dict.note}
            </Typography>
            <a
              href="/#contact"
              className="inline-flex items-center justify-center rounded-full border border-black bg-df-orange px-8 py-3 text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] transition-colors hover:bg-[#f57f15]"
            >
              <Typography as="span" variant="body" weight="bold" tone="inverse">
                {dict.cta}
              </Typography>
            </a>
          </div>
        </div>
      </Container>
    </Section>
  );
}
