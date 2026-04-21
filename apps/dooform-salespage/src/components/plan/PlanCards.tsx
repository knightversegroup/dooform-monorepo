import { FileText } from 'lucide-react';

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
    <section className="bg-[#f5f0ea] px-[10px] pb-20 pt-12">
      <div className="mx-auto max-w-[1280px] px-6">
        {/* Header */}
        <div className="mb-14 text-center">
          <h1 className="text-4xl font-bold text-[#262626] md:text-5xl">
            {dict.heading}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-[#666]">
            {dict.subtitle}
          </p>
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
                <h3 className="text-xl font-bold text-[#262626]">
                  {plan.name}
                </h3>

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
                <a
                  href="#"
                  className={`block rounded-full px-5 py-2.5 text-center text-sm font-medium transition ${
                    isHighlighted
                      ? 'bg-[#262626] text-white hover:bg-[#404040]'
                      : 'border border-[#262626] text-[#262626] hover:bg-[#262626] hover:text-white'
                  }`}
                >
                  {plan.button}
                </a>

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
      </div>
    </section>
  );
}
