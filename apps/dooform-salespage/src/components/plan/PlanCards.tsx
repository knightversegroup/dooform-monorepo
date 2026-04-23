import { FileText } from 'lucide-react';
import { Button, Typography } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';

type PlanCardDict = {
  name: string;
  tagline: string;
  price: string;
  period: string;
  button: string;
  featureIntro: string;
  features: string[];
};

export type PlanPageDict = {
  heading: string;
  subtitle: string;
  footnote: string;
  plans: {
    trial: PlanCardDict;
    starter: PlanCardDict;
    plus: PlanCardDict;
    enterprise: PlanCardDict;
  };
  comparison: ComparisonDict;
};

export type ComparisonRow = {
  feature: string;
  description?: string;
  values: (boolean | string)[];
};

export type ComparisonSection = {
  name: string;
  rows: ComparisonRow[];
};

export type ComparisonDict = {
  heading: string;
  columns: string[];
  sections: ComparisonSection[];
};

const planKeys: (keyof PlanPageDict['plans'])[] = [
  'trial',
  'starter',
  'plus',
  'enterprise',
];

export default function PlanCards({ dict }: { dict: PlanPageDict }) {
  return (
    <Section padding="none" className="bg-[#f5f0ea] pb-20 pt-12">
      <Container>
        {/* Header */}
        <div className="mb-14 text-center">
          <Typography variant="h1">
            {dict.heading}
          </Typography>
          <Typography variant="body" className="mx-auto mt-4 max-w-lg">
            {dict.subtitle}
          </Typography>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {planKeys.map((key) => {
            const plan = dict.plans[key];
            const isHighlighted = key === 'plus';

            return (
              <div
                key={key}
                className={`flex flex-col rounded-2xl border bg-white p-8 ${
                  isHighlighted ? 'border-[#262626]' : 'border-[#e5e0da]'
                }`}
              >
                {/* Icon */}
                <FileText className="mb-4 h-7 w-7 text-[#262626]" />

                {/* Name */}
                <Typography variant="h4" as="h3">
                  {plan.name}
                </Typography>

                {/* Tagline */}
                <p className="mt-1 text-sm text-[#666]">{plan.tagline}</p>

                {/* Price */}
                <div className="mt-5">
                  <span className="text-3xl font-bold text-[#262626]">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="ml-1 text-sm text-[#666]">
                      {plan.period}
                    </span>
                  )}
                </div>

                {/* Divider */}
                <div className="my-6 h-px bg-[#e5e0da]" />

                {/* Button */}
                <Button
                  variant={isHighlighted ? 'dark' : 'outline'}
                  size="lg"
                  fullWidth
                  href="#"
                >
                  {plan.button}
                </Button>

                {/* Feature intro */}
                <p className="mb-3 mt-6 text-sm font-semibold text-[#262626]">
                  {plan.featureIntro}
                </p>

                {/* Features */}
                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-[#4d4d4d]"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#4d4d4d]" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Footnote */}
        <p className="mt-10 text-center text-sm text-[#666]">
          {dict.footnote}
        </p>
      </Container>
    </Section>
  );
}
