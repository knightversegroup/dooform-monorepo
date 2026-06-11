import {
  ArrowRight,
  Award,
  FileSpreadsheet,
  Footprints,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Container, Section, Typography } from '@dooform/ui';

type AudienceCard = {
  title: string;
  image: string;
  highlights: string[];
};

type AudienceFeature = {
  icon: string;
  title: string;
  description: string;
};

export type AudienceDict = {
  heading: string;
  readMore: string;
  cards: {
    business: AudienceCard;
    freelance: AudienceCard;
  };
  features: AudienceFeature[];
};

const featureIcons: Record<string, typeof FileSpreadsheet> = {
  spreadsheet: FileSpreadsheet,
  diploma: Award,
  speed: Footprints,
  'ai-human': Sparkles,
  secure: ShieldCheck,
};

function AudienceCardBlock({
  card,
  readMore,
}: {
  card: AudienceCard;
  readMore: string;
}) {
  return (
    <div className="flex h-full flex-col gap-5">
      <Typography
        variant="h3"
        as="h3"
        tone="inherit"
        align="center"
        className="text-df-navy"
      >
        {card.title}
      </Typography>

      <div className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-df-grey">
        <div className="grid flex-1 grid-cols-1 gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center md:gap-8 md:p-8">
          <ul className="flex flex-col gap-2.5">
            {card.highlights.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-df-navy"
                />
                <Typography variant="body-sm">{item}</Typography>
              </li>
            ))}
          </ul>

          <div className="relative mx-auto h-48 w-full max-w-[260px] overflow-hidden rounded-2xl md:h-56 md:w-64">
            <img
              src={card.image}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="border-t border-gray-100 px-6 py-4 md:px-8">
          <a
            href="#trial"
            className="group inline-flex items-center gap-2 text-df-navy transition-transform hover:translate-x-0.5"
          >
            <Typography
              as="span"
              variant="body-sm"
              weight="semibold"
              tone="inherit"
            >
              {readMore}
            </Typography>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-df-orange text-white">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AudienceSection({ dict }: { dict: AudienceDict }) {
  return (
    <Section padding="lg" className="bg-white">
      <Container>
        <Typography
          variant="h2"
          align="center"
          tone="inherit"
          className="text-df-navy"
        >
          {dict.heading}
        </Typography>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
          <AudienceCardBlock
            card={dict.cards.business}
            readMore={dict.readMore}
          />
          <AudienceCardBlock
            card={dict.cards.freelance}
            readMore={dict.readMore}
          />
        </div>

        <div className="mt-14 rounded-3xl bg-[#f5f5f5] px-6 py-5 md:rounded-full md:px-10">
          <ul className="flex flex-col items-stretch gap-6 md:flex-row md:items-center md:justify-between md:gap-4">
            {dict.features.map((feature, index) => {
              const Icon = featureIcons[feature.icon] ?? FileSpreadsheet;
              return (
                <li
                  key={feature.title}
                  className="flex flex-1 items-center gap-3 md:justify-center"
                >
                  <span
                    aria-hidden
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-df-navy shadow-sm"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="flex flex-col">
                    <Typography
                      as="span"
                      variant="body-sm"
                      weight="semibold"
                      tone="inherit"
                      className="text-df-navy"
                    >
                      {feature.title}
                    </Typography>
                    {feature.description ? (
                      <Typography
                        as="span"
                        variant="caption"
                        tone="muted"
                      >
                        {feature.description}
                      </Typography>
                    ) : null}
                  </div>
                  {index < dict.features.length - 1 ? (
                    <span
                      aria-hidden
                      className="hidden h-8 w-px bg-gray-300 md:ml-4 md:inline-block"
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
