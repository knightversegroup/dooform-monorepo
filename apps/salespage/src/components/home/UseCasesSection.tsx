'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Modal, Typography } from '@dooform/ui';

type UseCaseCardDict = {
  title: string;
  description: string;
  longDescription: string;
  highlights: string[];
};

type UseCasesDict = {
  heading: string;
  subtitle: string;
  readMore: string;
  modalCta: string;
  modalClose: string;
  cards: {
    card1: UseCaseCardDict;
    card2: UseCaseCardDict;
    card3: UseCaseCardDict;
  };
};

type CardKey = keyof UseCasesDict['cards'];

type CardConfig = {
  key: CardKey;
  image: string;
};

const cardConfigs: CardConfig[] = [
  { key: 'card1', image: '/images/usecase-1.png' },
  { key: 'card2', image: '/images/usecase-2.png' },
  { key: 'card3', image: '/images/usecase-3.png' },
];

export default function UseCasesSection({ dict }: { dict: UseCasesDict }) {
  const [openKey, setOpenKey] = useState<CardKey | null>(null);
  const close = () => setOpenKey(null);

  const openConfig = openKey
    ? cardConfigs.find((c) => c.key === openKey)
    : undefined;
  const openCard = openKey ? dict.cards[openKey] : undefined;

  return (
    <section>
      {/* Dark navy header */}
      <div className="bg-[#1B1464] px-6 pb-48 pt-16 text-center md:pb-52">
        <Typography variant="h2" tone="inverse" className="whitespace-pre-line">
          {dict.heading}
        </Typography>
        <Typography variant="body" tone="inverse-muted" className="mt-3">
          {dict.subtitle}
        </Typography>
      </div>

      {/* Cards overlapping the header */}
      <div className="-mt-36 flex justify-center px-[10px] md:-mt-40">
        <div className="grid w-full max-w-[1280px] grid-cols-1 gap-6 px-6 md:grid-cols-3">
          {cardConfigs.map((config) => {
            const card = dict.cards[config.key];

            return (
              <button
                key={config.key}
                type="button"
                onClick={() => setOpenKey(config.key)}
                aria-haspopup="dialog"
                className="group relative cursor-pointer overflow-hidden rounded-3xl border-0 bg-white text-left shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)] outline-none transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0px_12px_36px_0px_rgba(0,0,0,0.14)] focus:outline-none focus-visible:outline-none"
              >
                <div className="relative min-h-[140px] p-8 pb-4">
                  <div className="absolute right-0 top-0 h-full w-[45%]">
                    <img
                      src={config.image}
                      alt=""
                      className="h-full w-full object-contain object-right-top"
                    />
                  </div>

                  <Typography
                    variant="h4"
                    as="h3"
                    tone="inherit"
                    className="relative z-10 max-w-[55%] text-[#1B1464]"
                  >
                    {card.title}
                  </Typography>
                </div>

                <div className="border-t border-gray-200" />

                <div className="flex flex-col gap-4 p-8 pt-4">
                  <Typography variant="body">{card.description}</Typography>
                  <Typography
                    as="span"
                    variant="body-sm"
                    weight="semibold"
                    tone="inherit"
                    className="inline-flex items-center gap-1 text-[#1B1464] transition-transform group-hover:translate-x-0.5"
                  >
                    {dict.readMore}
                    <ArrowRight className="h-4 w-4" />
                  </Typography>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Modal
        open={openKey !== null}
        onClose={close}
        ariaLabel={openCard?.title}
        closeLabel={dict.modalClose}
      >
        {openCard && openConfig && (
          <>
            {/* Persona header */}
            <div className="relative flex items-end gap-6 bg-[#f5f0ea] px-8 pb-0 pt-10 md:px-12 md:pt-12">
              <div className="flex-1 pb-8 md:pb-12">
                <Typography variant="h2" as="h2" tone="inherit" className="text-[#1B1464]">
                  {openCard.title}
                </Typography>
                <Typography variant="lead" className="mt-3 max-w-md">
                  {openCard.longDescription}
                </Typography>
              </div>
              <div className="relative hidden h-48 w-32 shrink-0 self-end sm:block md:h-64 md:w-44">
                <img
                  src={openConfig.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-contain object-bottom"
                />
              </div>
            </div>

            {/* Highlights */}
            <div className="flex flex-col gap-5 px-8 py-8 md:px-12 md:py-10">
              <ul className="flex flex-col gap-3">
                {openCard.highlights.map((item) => (
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
                onClick={close}
                className="mt-2 inline-flex items-center justify-center self-start rounded-full bg-[#ff6700] px-6 py-3 text-white transition-colors hover:bg-[#e65d00]"
              >
                <Typography
                  as="span"
                  variant="body-sm"
                  weight="semibold"
                  tone="inverse"
                >
                  {dict.modalCta}
                </Typography>
              </a>
            </div>
          </>
        )}
      </Modal>
    </section>
  );
}
