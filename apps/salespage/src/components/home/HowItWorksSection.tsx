import { ArrowRight } from 'lucide-react';
import { DooformLogo } from '@dooform/shared/components/ui/DooformLogo';
import { Container, Section, Typography } from '@dooform/ui';

type HowItWorksStep = {
  title: string;
  description: string;
  previewLabel: string;
};

type HowItWorksSample = {
  title: string;
  href: string;
};

export type HowItWorksDict = {
  eyebrow: string;
  headingLine1: string;
  headingLine2: string;
  subtitle: string;
  image: string;
  steps: HowItWorksStep[];
  sample: HowItWorksSample;
};

export default function HowItWorksSection({ dict }: { dict: HowItWorksDict }) {
  return (
    <Section id="how-it-works" padding="lg" className="bg-white">
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1.2fr_1fr] md:gap-12">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-df-grey px-5 py-2">
              <Typography
                as="span"
                variant="body"
                weight="bold"
                tone="inherit"
                className="text-neutral-900"
              >
                {dict.eyebrow}
              </Typography>
              <DooformLogo width={80} height={16} />
            </div>

            <Typography variant="h1" as="h2">
              {dict.headingLine1}
              <br />
              <span className="text-df-link">{dict.headingLine2}</span>
            </Typography>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl shadow-[0px_12px_36px_0px_rgba(15,23,42,0.18)]">
              <img
                src={dict.image}
                alt=""
                className="aspect-[5/3] w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Navy tab sitting on top of the step cards. */}
        <div className="mt-12 inline-flex rounded-t-3xl bg-df-navy px-8 py-3">
          <Typography as="span" variant="h5" weight="bold" tone="inverse">
            {dict.subtitle}
          </Typography>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {dict.steps.map((step, index) => (
            <div
              key={step.title}
              className="flex flex-col gap-4 rounded-3xl bg-[#f5f5f5] p-6 md:rounded-[40px]"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-df-navy">
                  <Typography
                    as="span"
                    variant="body"
                    weight="bold"
                    tone="inverse"
                  >
                    {index + 1}
                  </Typography>
                </span>
                <Typography variant="h5" as="h3">
                  {step.title}
                </Typography>
              </div>

              <Typography variant="body-sm" tone="muted">
                {step.description}
              </Typography>

              <div className="mt-auto flex aspect-[4/3] items-center justify-center rounded-2xl bg-df-sky p-4 text-center">
                <Typography variant="caption" tone="inherit" className="text-neutral-700">
                  {step.previewLabel}
                </Typography>
              </div>
            </div>
          ))}

          <a
            href={dict.sample.href}
            className="group flex flex-col justify-between gap-4 rounded-3xl bg-[#f5f5f5] p-6 transition-colors hover:bg-[#ececec] md:rounded-[40px]"
          >
            <Typography
              variant="body"
              weight="bold"
              tone="inherit"
              className="text-df-link"
            >
              {dict.sample.title}
            </Typography>
            <span className="flex items-center justify-between">
              <span className="flex gap-1">
                <span className="h-12 w-9 rounded-md bg-white shadow-sm" />
                <span className="h-12 w-9 rounded-md bg-white shadow-sm" />
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-df-orange text-white transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </span>
          </a>
        </div>
      </Container>
    </Section>
  );
}
