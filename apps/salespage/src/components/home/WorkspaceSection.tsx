'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Container, Modal, Section, Typography } from '@dooform/ui';

type WorkspaceCardDict = {
  label: string;
  tagline: string;
  longDescription: string;
  highlights: string[];
};

export type WorkspaceDict = {
  heading: string;
  modalCta: string;
  modalClose: string;
  cards: {
    docs: WorkspaceCardDict;
    knowledgeBase: WorkspaceCardDict;
    projects: WorkspaceCardDict;
  };
};

type WorkspaceKey = keyof WorkspaceDict['cards'];

type CardConfig = {
  key: WorkspaceKey;
  bg: string;
  /* Image used for both the card thumbnail and the modal hero. */
  image: string;
  /* Optional larger / alternate image for the modal hero. Falls back to
   * `image` when omitted. */
  modalImage?: string;
};

const cards: readonly CardConfig[] = [
  {
    key: 'docs',
    bg: 'bg-[#f5f0ea]',
    image: '/images/workspace-preview-1.png',
  },
  {
    key: 'knowledgeBase',
    bg: 'bg-[#f5f0ea]',
    image: '/images/workspace-preview-2.png',
  },
  {
    key: 'projects',
    bg: 'bg-[#f5f0ea]',
    image: '/images/workspace-preview-3.png',
  },
];

export default function WorkspaceSection({ dict }: { dict: WorkspaceDict }) {
  const [openKey, setOpenKey] = useState<WorkspaceKey | null>(null);
  const close = () => setOpenKey(null);
  const openCard = openKey ? dict.cards[openKey] : undefined;
  const openConfig = openKey ? cards.find((c) => c.key === openKey) : undefined;

  return (
    <Section padding="lg">
      <Container>
        <Typography variant="h2" className="mb-10 md:mb-14">
          {dict.heading}
        </Typography>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {cards.map(({ key, bg, image }) => {
            const card = dict.cards[key];
            const isLast = key === 'projects';

            return (
              <button
                key={key}
                type="button"
                onClick={() => setOpenKey(key)}
                aria-haspopup="dialog"
                className={`group flex cursor-pointer flex-col overflow-hidden rounded-2xl border-0 text-left outline-none transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0px_12px_36px_0px_rgba(0,0,0,0.10)] focus:outline-none focus-visible:outline-none ${bg} ${
                  isLast ? 'md:col-span-2' : ''
                }`}
              >
                {/* Label + arrow */}
                <div className="flex items-center justify-between p-6 pb-4 md:p-8 md:pb-4">
                  <div>
                    <Typography variant="overline" as="span">
                      {card.label}
                    </Typography>
                    <Typography variant="h3" as="p" className="mt-1">
                      {card.tagline}
                    </Typography>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0d4b3b] transition-transform group-hover:translate-x-0.5">
                    <ArrowRight size={20} className="text-white" />
                  </div>
                </div>

                {/* Preview image — cropped to top half */}
                <div
                  className={`relative overflow-hidden ${
                    isLast ? 'h-[280px] md:h-[400px]' : 'h-[200px] md:h-[260px]'
                  }`}
                >
                  <img
                    src={image}
                    alt={card.label}
                    className="absolute inset-x-0 top-0 w-full object-cover object-top"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </Container>

      <Modal
        open={openKey !== null}
        onClose={close}
        size="2xl"
        ariaLabel={openCard?.tagline}
        closeLabel={dict.modalClose}
      >
        {openCard && openConfig && (
          <WorkspaceModalContent
            card={openCard}
            image={openConfig.modalImage ?? openConfig.image}
            ctaLabel={dict.modalCta}
            onCta={close}
          />
        )}
      </Modal>
    </Section>
  );
}

function WorkspaceModalContent({
  card,
  image,
  ctaLabel,
  onCta,
}: {
  card: WorkspaceCardDict;
  image: string;
  ctaLabel: string;
  onCta: () => void;
}) {
  return (
    <>
      {/* Hero preview */}
      <div className="relative h-[260px] overflow-hidden bg-[#f5f0ea] md:h-[360px]">
        <img
          src={image}
          alt={card.label}
          className="absolute inset-x-0 top-0 w-full object-cover object-top"
        />
      </div>

      <div className="grid gap-10 px-8 py-10 md:grid-cols-2 md:gap-14 md:px-12 md:py-14">
        {/* Left: title + long description */}
        <div className="flex flex-col gap-4">
          <Typography variant="overline" as="span">
            {card.label}
          </Typography>
          <Typography variant="h2" as="h2">
            {card.tagline}
          </Typography>
          <Typography variant="lead">{card.longDescription}</Typography>

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

        {/* Right: highlights */}
        <ul className="flex flex-col gap-4">
          {card.highlights.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0d4b3b]">
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              </span>
              <Typography variant="body">{item}</Typography>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
