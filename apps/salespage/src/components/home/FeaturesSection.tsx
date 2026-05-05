import {
  FileText,
  ScanLine,
  Stamp,
  Users,
  Palette,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button, Typography } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';

type FeatureCardDict = {
  title: string;
  description: string;
  button: string;
};

type FeaturesDict = {
  heading: string;
  viewUseCases: string;
  cards: {
    documents: FeatureCardDict;
    templates: FeatureCardDict;
    stamps: FeatureCardDict;
    collaboration: FeatureCardDict;
    branding: FeatureCardDict;
    security: FeatureCardDict;
  };
};

type FeatureCardConfig = {
  key: keyof FeaturesDict['cards'];
  icon: LucideIcon;
  iconColor: string;
};

const featureCards: FeatureCardConfig[] = [
  { key: 'documents', icon: FileText, iconColor: 'text-blue-500' },
  { key: 'templates', icon: ScanLine, iconColor: 'text-green-500' },
  { key: 'stamps', icon: Stamp, iconColor: 'text-amber-500' },
  { key: 'collaboration', icon: Users, iconColor: 'text-violet-600' },
  { key: 'branding', icon: Palette, iconColor: 'text-rose-500' },
  { key: 'security', icon: ShieldCheck, iconColor: 'text-emerald-600' },
];

export default function FeaturesSection({
  dict,
  locale,
}: {
  dict: FeaturesDict;
  locale: string;
}) {
  const cards = featureCards;

  return (
    <Section padding="md">
      <Container>
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Typography variant="h2">{dict.heading}</Typography>
          <a
            href={`/${locale}/usecases`}
            className="flex items-center gap-1 text-base text-[#4d4d4d] transition hover:text-gray-900"
          >
            {dict.viewUseCases}
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
          {cards.map((card, index) => {
            const Icon = card.icon;
            const cardDict = dict.cards[card.key];
            if (!cardDict) return null;
            return (
              <div key={index} className="flex flex-col gap-4">
                <Icon
                  className={`h-14 w-14 ${card.iconColor}`}
                  strokeWidth={2.5}
                />
                <Typography variant="h4" as="h3">
                  {cardDict.title}
                </Typography>
                <Typography variant="body" className="leading-relaxed">
                  {cardDict.description}
                </Typography>
                <div className="mt-auto pt-2">
                  <Button variant="dark" size="md" href="#">
                    {cardDict.button}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
