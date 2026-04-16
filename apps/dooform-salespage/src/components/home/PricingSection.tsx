import {
  FileText,
  KeyRound,
  RotateCcw,
  Sparkles,
  ScanSearch,
  FolderPlus,
  Link2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type PlanDict = {
  name: string;
  price: string;
  period: string;
  button: string;
  features: string[];
};

type PricingDict = {
  heading: string;
  subtitle: string;
  footnote: string;
  allFeatures: string;
  plans: {
    trial: PlanDict;
    starter: PlanDict;
    plus: PlanDict;
    enterprise: PlanDict;
  };
};

type FeatureConfig = {
  icon: LucideIcon;
  highlighted?: boolean;
};

type PlanConfig = {
  key: keyof PricingDict['plans'];
  rainbow?: boolean;
  featureConfigs: FeatureConfig[];
};

const planConfigs: PlanConfig[] = [
  {
    key: 'trial',
    featureConfigs: [
      { icon: FileText },
      { icon: KeyRound },
      { icon: RotateCcw },
    ],
  },
  {
    key: 'starter',
    featureConfigs: [
      { icon: FileText },
      { icon: KeyRound },
      { icon: RotateCcw },
    ],
  },
  {
    key: 'plus',
    rainbow: true,
    featureConfigs: [
      { icon: FileText },
      { icon: KeyRound },
      { icon: RotateCcw },
      { icon: Sparkles, highlighted: true },
      { icon: ScanSearch },
      { icon: FolderPlus },
    ],
  },
  {
    key: 'enterprise',
    featureConfigs: [
      { icon: FileText },
      { icon: KeyRound },
      { icon: RotateCcw },
      { icon: Sparkles, highlighted: true },
      { icon: ScanSearch },
      { icon: FolderPlus },
      { icon: Link2 },
    ],
  },
];

export default function PricingSection({ dict }: { dict: PricingDict }) {
  return (
    <section className="flex justify-center px-[10px] py-20">
      <div className="w-full max-w-[1280px] px-6">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">{dict.heading}</h2>
          <p className="mt-3 text-base text-[#4d4d4d]">{dict.subtitle}</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {planConfigs.map((config) => {
            const plan = dict.plans[config.key];

            const cardContent = (
              <div
                className={`flex h-full flex-col rounded-2xl bg-white p-8 ${
                  config.rainbow ? '' : 'border border-gray-200'
                }`}
              >
                {/* Plan name */}
                <h3
                  className={`text-lg font-bold ${
                    config.rainbow ? 'text-amber-500' : 'text-gray-900'
                  }`}
                >
                  {plan.name}
                </h3>

                {/* Price */}
                <p className="mt-2 text-4xl font-bold text-gray-900">
                  {plan.price}
                </p>

                {/* Period */}
                <p className="mt-1 text-sm text-[#4d4d4d]">{plan.period}</p>

                {/* Features heading */}
                <p className="mb-3 mt-6 text-sm font-bold text-gray-900">
                  {dict.allFeatures}
                </p>

                {/* Features list */}
                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((feature, idx) => {
                    const featureConfig = config.featureConfigs[idx];
                    const Icon = featureConfig?.icon ?? FileText;
                    const isHighlighted = featureConfig?.highlighted ?? false;

                    return (
                      <li
                        key={idx}
                        className={`flex items-start gap-2 text-sm leading-relaxed ${
                          isHighlighted ? 'text-amber-500' : 'text-[#4d4d4d]'
                        }`}
                      >
                        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    );
                  })}
                </ul>

                {/* Button */}
                <div className="mt-auto pt-8">
                  <a
                    href="#"
                    className="inline-block rounded-full border border-gray-900 bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                  >
                    {plan.button}
                  </a>
                </div>
              </div>
            );

            if (config.rainbow) {
              return (
                <div
                  key={config.key}
                  className="rounded-2xl bg-gradient-to-br from-rose-300 via-amber-200 to-cyan-300 p-[2px]"
                >
                  {cardContent}
                </div>
              );
            }

            return (
              <div key={config.key} className="flex">
                {cardContent}
              </div>
            );
          })}
        </div>

        {/* Footnote */}
        <p className="mt-10 text-center text-sm text-[#4d4d4d]">
          {dict.footnote}
        </p>
      </div>
    </section>
  );
}
