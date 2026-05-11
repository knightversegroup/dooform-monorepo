'use client';

import { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  FileText,
  Palette,
  ScanLine,
  ShieldCheck,
  Stamp,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Container, Modal, Section, Typography } from '@dooform/ui';

type FeatureCardDict = {
  title: string;
  description: string;
  longDescription: string;
  highlights: string[];
  button: string;
};

type FeaturesDict = {
  heading: string;
  viewUseCases: string;
  modalCta: string;
  modalClose: string;
  cards: {
    documents: FeatureCardDict;
    templates: FeatureCardDict;
    stamps: FeatureCardDict;
    collaboration: FeatureCardDict;
    branding: FeatureCardDict;
    security: FeatureCardDict;
  };
};

type FeatureKey = keyof FeaturesDict['cards'];

type FeatureCardConfig = {
  key: FeatureKey;
  icon: LucideIcon;
  /* Tailwind classes for the icon's tinted background + stroke colour. */
  iconBg: string;
  iconColor: string;
};

const featureCards: FeatureCardConfig[] = [
  { key: 'documents', icon: FileText, iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
  { key: 'templates', icon: ScanLine, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
  { key: 'stamps', icon: Stamp, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
  { key: 'collaboration', icon: Users, iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
  { key: 'branding', icon: Palette, iconBg: 'bg-rose-50', iconColor: 'text-rose-500' },
  { key: 'security', icon: ShieldCheck, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
];

export default function FeaturesSection({
  dict,
  locale,
}: {
  dict: FeaturesDict;
  locale: string;
}) {
  const [openKey, setOpenKey] = useState<FeatureKey | null>(null);
  const close = () => setOpenKey(null);

  const openConfig = openKey
    ? featureCards.find((c) => c.key === openKey)
    : undefined;
  const openCard = openKey ? dict.cards[openKey] : undefined;

  return (
    <Section padding="md">
      <Container>
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <Typography variant="h2">{dict.heading}</Typography>
          <a
            href={`/${locale}/usecases`}
            className="flex items-center gap-1 text-[#4d4d4d] transition hover:text-gray-900"
          >
            <Typography as="span" variant="body" tone="inherit">
              {dict.viewUseCases}
            </Typography>
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        {/* Feature Grid — each card is a button that opens its detail modal. */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          {featureCards.map((card) => {
            const Icon = card.icon;
            const cardDict = dict.cards[card.key];
            if (!cardDict) return null;
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setOpenKey(card.key)}
                aria-haspopup="dialog"
                className="group flex cursor-pointer flex-col items-start gap-4 rounded-2xl border-0 bg-transparent p-2 text-left outline-none transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:outline-none"
              >
                <Icon
                  className={`h-14 w-14 ${card.iconColor}`}
                  strokeWidth={2.5}
                />
                <Typography variant="h4" as="h3">
                  {cardDict.title}
                </Typography>
                <Typography variant="body">{cardDict.description}</Typography>
                <Typography
                  as="span"
                  variant="body-sm"
                  weight="semibold"
                  tone="inherit"
                  className="mt-auto inline-flex items-center gap-1 pt-2 text-[#262626] transition-transform group-hover:translate-x-0.5"
                >
                  {cardDict.button}
                  <ArrowUpRight className="h-4 w-4" />
                </Typography>
              </button>
            );
          })}
        </div>
      </Container>

      <Modal
        open={openKey !== null}
        onClose={close}
        ariaLabel={openCard?.title}
        closeLabel={dict.modalClose}
      >
        {openCard && openConfig && (
          <FeatureModalContent
            card={openCard}
            config={openConfig}
            ctaLabel={dict.modalCta}
            onCta={close}
          />
        )}
      </Modal>
    </Section>
  );
}

/* Modal body for one feature. Kept separate so the parent component reads
 * cleanly and the modal layout can evolve independently. */
function FeatureModalContent({
  card,
  config,
  ctaLabel,
  onCta,
}: {
  card: FeatureCardDict;
  config: FeatureCardConfig;
  ctaLabel: string;
  onCta: () => void;
}) {
  const Icon = config.icon;
  return (
    <>
      <div className="flex flex-col gap-5 px-8 pb-2 pt-10 md:px-12 md:pt-12">
        <span
          className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl ${config.iconBg}`}
        >
          <Icon className={`h-7 w-7 ${config.iconColor}`} strokeWidth={2.5} />
        </span>
        <Typography variant="h2" as="h2">
          {card.title}
        </Typography>
        <Typography variant="lead">{card.longDescription}</Typography>
      </div>

      <div className="flex flex-col gap-5 px-8 py-8 md:px-12 md:py-10">
        <ul className="flex flex-col gap-3">
          {card.highlights.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1B1464]">
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              </span>
              <Typography variant="body">{item}</Typography>
            </li>
          ))}
        </ul>

        <a
          href="#trial"
          onClick={onCta}
          className="mt-2 inline-flex items-center justify-center self-start rounded-full bg-[#ff6700] px-6 py-3 text-white transition-colors hover:bg-[#e65d00]"
        >
          <Typography
            as="span"
            variant="body-sm"
            weight="semibold"
            tone="inverse"
          >
            {ctaLabel}
          </Typography>
        </a>
      </div>
    </>
  );
}
