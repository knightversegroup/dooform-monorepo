type UseCaseCardDict = {
  title: string;
  description: string;
};

type UseCasesDict = {
  heading: string;
  subtitle: string;
  cards: {
    card1: UseCaseCardDict;
    card2: UseCaseCardDict;
    card3: UseCaseCardDict;
  };
};

type CardConfig = {
  key: keyof UseCasesDict['cards'];
  image: string;
};

const cardConfigs: CardConfig[] = [
  { key: 'card1', image: '/images/usecase-1.png' },
  { key: 'card2', image: '/images/usecase-2.png' },
  { key: 'card3', image: '/images/usecase-3.png' },
];

export default function UseCasesSection({ dict }: { dict: UseCasesDict }) {
  return (
    <section>
      {/* Dark navy header */}
      <div className="bg-[#1B1464] px-6 pb-48 pt-16 text-center md:pb-52">
        <h2 className="whitespace-pre-line text-3xl font-bold leading-tight text-white md:text-4xl">
          {dict.heading}
        </h2>
        <p className="mt-3 text-base text-white/60">{dict.subtitle}</p>
      </div>

      {/* Cards overlapping the header */}
      <div className="-mt-36 flex justify-center px-[10px] md:-mt-40">
        <div className="grid w-full max-w-[1280px] grid-cols-1 gap-6 px-6 md:grid-cols-3">
          {cardConfigs.map((config) => {
            const card = dict.cards[config.key];

            return (
              <div
                key={config.key}
                className="relative overflow-hidden rounded-3xl bg-white shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)]"
              >
                {/* Top area: title + image */}
                <div className="relative min-h-[140px] p-8 pb-4">
                  {/* Person image */}
                  <div className="absolute right-0 top-0 h-full w-[45%]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={config.image}
                      alt=""
                      className="h-full w-full object-contain object-right-top"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="relative z-10 max-w-[55%] text-xl font-bold leading-snug text-[#1B1464]">
                    {card.title}
                  </h3>
                </div>

                {/* Separator */}
                <div className="border-t border-gray-200" />

                {/* Description */}
                <div className="p-8 pt-4">
                  <p className="text-sm leading-relaxed text-[#4d4d4d]">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
