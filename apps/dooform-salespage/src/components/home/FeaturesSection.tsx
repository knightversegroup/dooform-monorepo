import { Puzzle, CodeXml, Zap, ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type FeatureCardDict = {
  title: string;
  description: string;
  button: string;
};

type FeaturesDict = {
  heading: string;
  viewUseCases: string;
  cards: {
    business: FeatureCardDict;
    developer: FeatureCardDict;
    performance: FeatureCardDict;
  };
};

type FeatureCardConfig = {
  key: keyof FeaturesDict['cards'];
  icon: LucideIcon;
  iconColor: string;
};

const featureCards: FeatureCardConfig[] = [
  { key: 'business', icon: Puzzle, iconColor: 'text-green-500' },
  { key: 'developer', icon: CodeXml, iconColor: 'text-violet-600' },
  { key: 'performance', icon: Zap, iconColor: 'text-amber-500' },
];

export default function FeaturesSection({
  dict,
  locale,
}: {
  dict: FeaturesDict;
  locale: string;
}) {
  const cards = [...featureCards, ...featureCards];

  return (
    <section className="flex justify-center px-[10px]">
      <div className="w-full max-w-[1280px] px-6 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold md:text-4xl">{dict.heading}</h2>
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
            return (
              <div key={index} className="flex flex-col gap-4">
                <Icon
                  className={`h-14 w-14 ${card.iconColor}`}
                  strokeWidth={2.5}
                />
                <h3 className="text-xl font-bold">{cardDict.title}</h3>
                <p className="text-base leading-relaxed text-[#4d4d4d]">
                  {cardDict.description}
                </p>
                <div className="mt-auto pt-2">
                  <a
                    href="#"
                    className="inline-block rounded-full border border-gray-900 bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                  >
                    {cardDict.button}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
