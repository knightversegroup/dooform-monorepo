'use client';

import { useState } from 'react';
import { Check, Lightbulb } from 'lucide-react';
import { Container, Section, Typography } from '@dooform/ui';

type BillingPeriod = 'monthly' | 'annual';

type PlanDict = {
  audience: string;
  name: string;
  monthlyPrice: string;
  monthlySuffix: string;
  annualPrice: string;
  annualSuffix: string;
  monthlyAnnualNote: string;
  annualAnnualNote: string;
  ctaLabel: string;
  previousPlanFeatures: string;
  features: string[];
};

export type PricingDict = {
  eyebrow: string;
  heading: string;
  subtitle: string;
  billing: {
    monthly: string;
    annual: string;
    savings: string;
  };
  bestValueLabel: string;
  recommendBadge: string;
  training: {
    title: string;
    items: string[];
  };
  brandLabel: string;
  footnote: string;
  plans: {
    trial: PlanDict;
    starter: PlanDict;
    plus: PlanDict;
    enterprise: PlanDict;
  };
};

type PlanKey = keyof PricingDict['plans'];

type PlanConfig = {
  key: PlanKey;
  /* `enterprise` is the BEST VALUE / recommended plan in the new design. */
  recommended?: boolean;
};

const PLAN_ORDER: PlanConfig[] = [
  { key: 'trial' },
  { key: 'starter' },
  { key: 'plus' },
  { key: 'enterprise', recommended: true },
];

export default function PricingSection({ dict }: { dict: PricingDict }) {
  const [billing, setBilling] = useState<BillingPeriod>('monthly');

  return (
    <Section padding="lg">
      <Container>
        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center">
          <Typography variant="overline" tone="inherit" className="text-blue-600">
            {dict.eyebrow}
          </Typography>
          <Typography variant="h1" as="h2" className="mt-3">
            {dict.heading}
          </Typography>
        </div>

        {/* ── Billing toggle ──────────────────────────────────────── */}
        <div className="mt-10 flex flex-col items-center gap-3 md:mt-12 md:flex-row md:justify-center md:gap-5">
          <BillingToggle
            billing={billing}
            onChange={setBilling}
            monthlyLabel={dict.billing.monthly}
            annualLabel={dict.billing.annual}
          />
          <SavingsBadge label={dict.billing.savings} />
        </div>

        {/* ── Plan cards ──────────────────────────────────────────── */}
        <div className="mt-12 grid grid-cols-1 gap-5 md:mt-14 md:grid-cols-2 lg:grid-cols-4">
          {PLAN_ORDER.map((config) => (
            <PlanCard
              key={config.key}
              plan={dict.plans[config.key]}
              recommended={!!config.recommended}
              billing={billing}
              bestValueLabel={dict.bestValueLabel}
              recommendBadge={dict.recommendBadge}
              training={dict.training}
              brandLabel={dict.brandLabel}
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

/* ── Billing toggle ──────────────────────────────────────────────── */

function BillingToggle({
  billing,
  onChange,
  monthlyLabel,
  annualLabel,
}: {
  billing: BillingPeriod;
  onChange: (b: BillingPeriod) => void;
  monthlyLabel: string;
  annualLabel: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Typography
        as="span"
        variant="body"
        weight={billing === 'monthly' ? 'semibold' : 'regular'}
        tone="inherit"
        className={billing === 'monthly' ? 'text-slate-900' : 'text-slate-500'}
      >
        {monthlyLabel}
      </Typography>

      {/* Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={billing === 'annual'}
        aria-label={billing === 'monthly' ? annualLabel : monthlyLabel}
        onClick={() => onChange(billing === 'monthly' ? 'annual' : 'monthly')}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
          billing === 'annual' ? 'bg-blue-600' : 'bg-blue-600'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            billing === 'annual' ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>

      <Typography
        as="span"
        variant="body"
        weight={billing === 'annual' ? 'semibold' : 'regular'}
        tone="inherit"
        className={billing === 'annual' ? 'text-slate-900' : 'text-slate-500'}
      >
        {annualLabel}
      </Typography>
    </div>
  );
}

/* ── Savings badge (the orange "ประหยัดกว่า 17%" pill) ───────────── */

function SavingsBadge({ label }: { label: string }) {
  return (
    <span className="relative inline-flex items-center rounded-md border-2 border-amber-400 bg-amber-50 px-3 py-1 text-amber-700">
      <Typography as="span" variant="body-sm" weight="bold" tone="inherit">
        {label}
      </Typography>
      {/* Decorative arrow pointing up-left toward the toggle. */}
      <svg
        aria-hidden
        className="absolute -left-6 -top-3 h-5 w-5 text-amber-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M2 16 Q 6 4 18 8" />
        <path d="M14 4 L18 8 L14 12" />
      </svg>
    </span>
  );
}

/* ── Plan card ──────────────────────────────────────────────────── */

function PlanCard({
  plan,
  recommended,
  billing,
  bestValueLabel,
  recommendBadge,
  training,
  brandLabel,
}: {
  plan: PlanDict;
  recommended: boolean;
  billing: BillingPeriod;
  bestValueLabel: string;
  recommendBadge: string;
  training: PricingDict['training'];
  brandLabel: string;
}) {
  const price = billing === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
  const suffix = billing === 'monthly' ? plan.monthlySuffix : plan.annualSuffix;
  const annualNote =
    billing === 'monthly' ? plan.monthlyAnnualNote : plan.annualAnnualNote;

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] ${
        recommended ? 'border-2 border-blue-500' : 'border border-neutral-200'
      }`}
    >
      {/* BEST VALUE banner — only on the recommended plan. */}
      {recommended && (
        <div className="bg-blue-500 py-1.5 text-center">
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

      {/* ── Top section: audience, name, price, CTA, training ─────
       * Each row of content is given a fixed-height slot so CTAs align
       * vertically across cards regardless of whether a plan has an
       * annual note or not. */}
      <div className="flex flex-col gap-5 p-8">
        <Typography
          variant="body-sm"
          align="center"
          tone="inherit"
          className="text-slate-700 min-h-[44px]"
        >
          {plan.audience}
        </Typography>

        <div className="flex items-center justify-center gap-2">
          <Typography variant="h3" as="h3" weight="bold">
            {plan.name}
          </Typography>
          {recommended && <RecommendBadge label={recommendBadge} />}
        </div>

        {/* Price block — fixed height keeps CTAs aligned across cards even
         * when the Free plan has no `*เหมาจ่าย` line. */}
        <div className="flex min-h-[88px] flex-col items-center justify-center gap-1">
          <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-0">
            <Typography
              as="span"
              variant="h2"
              weight="bold"
              tone="inherit"
              className="text-blue-600"
            >
              {price}
            </Typography>
            <Typography as="span" variant="caption" tone="muted">
              {suffix}
            </Typography>
          </div>
          {/* Always render the annual-note slot so heights match. */}
          <Typography
            variant="caption"
            tone="muted"
            className="min-h-[16px]"
          >
            {annualNote ? `*${annualNote}` : ' '}
          </Typography>
        </div>

        {/* CTA — bigger, more rounded to match the FlowAccount-style design. */}
        <a
          href="#trial"
          className={`inline-flex items-center justify-center rounded-lg px-5 py-3 transition-colors ${
            recommended
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'border border-blue-600 bg-white text-blue-600 hover:bg-blue-50'
          }`}
        >
          <Typography as="span" variant="body-sm" weight="semibold" tone="inherit">
            {plan.ctaLabel}
          </Typography>
        </a>

        {/* Training callout — present on all plans for visual parity. */}
        <div className="flex flex-col gap-2 pt-3">
          <div className="flex items-center gap-1.5 text-blue-600">
            <Lightbulb className="h-4 w-4" />
            <Typography as="span" variant="body-sm" weight="semibold" tone="inherit">
              {training.title}
            </Typography>
          </div>
          <ul className="flex flex-col gap-1.5">
            {training.items.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" strokeWidth={3} />
                <Typography as="span" variant="caption" tone="inherit" className="text-slate-700">
                  {item}
                </Typography>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Bottom section: brand label + features ────────────────
       * `flex-1` lets this section grow to fill the rest of the card so
       * the gray background extends to the bottom even when the feature
       * list is short. Without it, mt-auto would create whitespace inside
       * the top section instead. */}
      <div className="flex flex-1 flex-col gap-3 border-t border-neutral-100 bg-neutral-50 p-6">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
            <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
          </span>
          <Typography as="span" variant="body-sm" weight="semibold" tone="heading">
            {brandLabel}
          </Typography>
        </div>

        <Typography variant="body-sm" weight="semibold" tone="heading">
          {plan.previousPlanFeatures}
        </Typography>

        <ul className="flex flex-col gap-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" strokeWidth={2.5} />
              <Typography as="span" variant="body-sm" tone="body">
                {feature}
              </Typography>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* Small "แนะนำ!" pill that sits beside the plan name on the recommended card. */
function RecommendBadge({ label }: { label: string }) {
  return (
    <span className="rounded-md bg-amber-400 px-2 py-0.5">
      <Typography as="span" variant="caption" weight="bold" tone="inverse">
        {label}
      </Typography>
    </span>
  );
}
