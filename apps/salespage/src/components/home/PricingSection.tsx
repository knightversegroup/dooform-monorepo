import { Check } from 'lucide-react';
import { Container, Section, Typography } from '@dooform/ui';

type PlanDict = {
  audience: string;
  name: string;
  price: string;
  suffix: string;
  ctaLabel: string;
  features: string[];
};

export type PricingDict = {
  eyebrow: string;
  heading: string;
  subtitle: string;
  bestValueLabel: string;
  recommendBadge: string;
  footnote: string;
  plans: {
    trial: PlanDict;
    starter: PlanDict;
    plus: PlanDict;
    advance: PlanDict;
    enterprise: PlanDict;
  };
};

type PlanKey = keyof PricingDict['plans'];

type PlanConfig = {
  key: PlanKey;
  recommended?: boolean;
  /* Enterprise gets the orange "Contact us" CTA in the new design. */
  ctaStyle?: 'orange';
};

const PLAN_ORDER: PlanConfig[] = [
  { key: 'trial' },
  { key: 'starter' },
  { key: 'plus', recommended: true },
  { key: 'advance' },
  { key: 'enterprise', ctaStyle: 'orange' },
];

export default function PricingSection({ dict }: { dict: PricingDict }) {
  return (
    <Section id="pricing" padding="lg">
      <Container>
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center">
          <Typography variant="overline" tone="inherit" className="text-df-link">
            {dict.eyebrow}
          </Typography>
          <Typography variant="h1" as="h2" className="mt-3">
            {dict.heading}
          </Typography>
          <Typography variant="body" tone="muted" className="mt-3">
            {dict.subtitle}
          </Typography>
        </div>

        {/* ── Plan cards ──────────────────────────────────────────── */}
        <div className="mt-12 grid grid-cols-1 gap-5 md:mt-14 md:grid-cols-2 lg:grid-cols-5">
          {PLAN_ORDER.map((config) => (
            <PlanCard
              key={config.key}
              plan={dict.plans[config.key]}
              recommended={!!config.recommended}
              orangeCta={config.ctaStyle === 'orange'}
              bestValueLabel={dict.bestValueLabel}
              recommendBadge={dict.recommendBadge}
            />
          ))}
        </div>

        {/* Footnote */}
        <Typography
          variant="body-sm"
          align="center"
          className="mt-10 md:mt-14"
        >
          {dict.footnote}
        </Typography>
      </Container>
    </Section>
  );
}

/* ── Plan card ──────────────────────────────────────────────────── */

function PlanCard({
  plan,
  recommended,
  orangeCta,
  bestValueLabel,
  recommendBadge,
}: {
  plan: PlanDict;
  recommended: boolean;
  orangeCta: boolean;
  bestValueLabel: string;
  recommendBadge: string;
}) {
  return (
    <div className="relative flex h-full flex-col">
      {/* BEST VALUE banner — floats ABOVE the card via absolute positioning so
       * non-recommended cards reserve zero space and content rows stay aligned. */}
      {recommended && (
        <div className="pointer-events-none absolute inset-x-4 -top-4 z-10 rounded-md bg-df-link py-1.5 text-center shadow-sm">
          <Typography
            as="span"
            variant="caption"
            weight="bold"
            tone="inverse"
            className="uppercase [letter-spacing:0.15em]"
          >
            {bestValueLabel}
          </Typography>
        </div>
      )}

      <div
        className={`flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] ${
          recommended ? 'border-2 border-df-link' : 'border border-neutral-200'
        }`}
      >
        {/* ── Top section: audience, name, price, CTA ─────────────
         * Each row gets a fixed-height slot so CTAs align vertically
         * across cards regardless of copy length. */}
        <div className="flex flex-col gap-5 p-6 lg:p-5 xl:p-6">
          <Typography
            variant="body-sm"
            align="center"
            tone="inherit"
            className="min-h-[66px] text-slate-700"
          >
            {plan.audience}
          </Typography>

          <div className="flex items-center justify-center gap-2">
            <Typography
              variant="h3"
              as="h3"
              weight="bold"
              tone="inherit"
              className="text-blue-600"
            >
              {plan.name}
            </Typography>
            {recommended && (
              <span className="rounded-md bg-df-orange px-2 py-0.5">
                <Typography as="span" variant="caption" weight="bold" tone="inverse">
                  {recommendBadge}
                </Typography>
              </span>
            )}
          </div>

          <div className="flex min-h-[88px] flex-col items-center justify-center gap-1">
            <Typography
              as="span"
              variant="h2"
              weight="bold"
              tone="inherit"
              className="text-blue-600"
            >
              {plan.price}
            </Typography>
            <Typography as="span" variant="caption" tone="muted" align="center">
              {plan.suffix}
            </Typography>
          </div>

          <a
            href={orangeCta ? '/#contact' : '#trial'}
            className={`inline-flex items-center justify-center rounded-full px-5 py-3 transition-colors ${
              orangeCta
                ? 'border border-black bg-df-orange text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] hover:bg-[#f57f15]'
                : recommended
                  ? 'bg-df-link text-white hover:bg-blue-600'
                  : 'border border-neutral-300 bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
            }`}
          >
            <Typography as="span" variant="body-sm" weight="bold" tone="inherit">
              {plan.ctaLabel}
            </Typography>
          </a>
        </div>

        {/* ── Feature panel — light blue per the new design. ──────── */}
        <div className="flex flex-1 flex-col gap-3 px-4 pb-4">
          <div className="flex h-full flex-col gap-3 rounded-2xl bg-df-panel p-5">
            <ul className="flex flex-col gap-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-df-link"
                    strokeWidth={2.5}
                  />
                  <Typography as="span" variant="body-sm" tone="body">
                    {feature}
                  </Typography>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
