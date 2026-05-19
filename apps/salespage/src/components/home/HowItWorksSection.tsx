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
    <Section padding="lg" className="bg-[#e9f1ff]">
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1.2fr_1fr] md:gap-12">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/70 px-4 py-1.5">
              <Typography
                as="span"
                variant="body-sm"
                weight="medium"
                tone="inherit"
                className="text-[#1B1464]"
              >
                {dict.eyebrow}
              </Typography>
              <DooformLogo width={80} height={16} />
            </div>

            <Typography
              variant="h1"
              tone="inherit"
              className="text-[#1B1464]"
            >
              {dict.headingLine1}
              <br />
              {dict.headingLine2}
            </Typography>

            <Typography variant="lead" tone="muted">
              {dict.subtitle}
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

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {dict.steps.map((step, index) => (
            <div
              key={step.title}
              className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-[0px_4px_18px_0px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1B1464]">
                  <Typography
                    as="span"
                    variant="body-sm"
                    weight="bold"
                    tone="inverse"
                  >
                    {index + 1}
                  </Typography>
                </span>
                <Typography
                  variant="h5"
                  as="h3"
                  tone="inherit"
                  className="text-[#1B1464]"
                >
                  {step.title}
                </Typography>
              </div>

              <Typography variant="body-sm" tone="muted">
                {step.description}
              </Typography>

              <div className="mt-auto flex aspect-[4/3] items-center justify-center rounded-2xl bg-[#f3f4f6] p-4 text-center">
                <Typography variant="caption" tone="muted">
                  {step.previewLabel}
                </Typography>
              </div>
            </div>
          ))}

          <a
            href={dict.sample.href}
            className="group flex flex-col justify-between gap-4 rounded-3xl bg-[#eef0f4] p-6 transition-colors hover:bg-[#e3e6ec]"
          >
            <Typography
              variant="body"
              weight="semibold"
              tone="inherit"
              className="text-[#1B1464]"
            >
              {dict.sample.title}
            </Typography>
            <span className="flex items-center justify-between">
              <span className="flex gap-1">
                <span className="h-12 w-9 rounded-md bg-white shadow-sm" />
                <span className="h-12 w-9 rounded-md bg-white shadow-sm" />
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#ff6700] text-white transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </span>
          </a>
        </div>
      </Container>
    </Section>
  );
}
