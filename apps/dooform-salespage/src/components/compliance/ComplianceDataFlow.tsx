import { Typography } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';

export type ComplianceDataFlowStep = {
  step: string;
  title: string;
  description: string;
};

export type ComplianceDataFlowDict = {
  heading: string;
  subtitle: string;
  steps: ComplianceDataFlowStep[];
};

const stepColors = ['#1B1464', '#2c2585', '#4338ca', '#1B1464'];

export default function ComplianceDataFlow({
  dict,
}: {
  dict: ComplianceDataFlowDict;
}) {
  return (
    <Section padding="lg">
      <Container>
        <Typography variant="h2">
          {dict.heading}
        </Typography>
        <Typography variant="body" className="mt-3 max-w-lg">
          {dict.subtitle}
        </Typography>
        <div className="mt-4 h-1 w-16 bg-[#4338ca]" />

        <div className="mt-14 grid grid-cols-1 gap-0 md:grid-cols-4">
          {dict.steps.map((step, i) => {
            const color = stepColors[i % stepColors.length];
            const isLast = i === dict.steps.length - 1;

            return (
              <div key={step.step} className="relative flex flex-col">
                {!isLast && (
                  <div className="absolute left-1/2 top-7 hidden h-[3px] w-full bg-[#e5e5e5] md:block" />
                )}

                <div
                  className="relative z-10 flex h-14 w-14 items-center justify-center text-lg font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {step.step}
                </div>

                <Typography variant="h4" as="h3" className="mt-5">
                  {step.title}
                </Typography>
                <Typography variant="body" className="mt-2 pr-6 leading-relaxed">
                  {step.description}
                </Typography>

                {!isLast && (
                  <div className="my-6 ml-[27px] h-8 w-[3px] bg-[#e5e5e5] md:hidden" />
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
