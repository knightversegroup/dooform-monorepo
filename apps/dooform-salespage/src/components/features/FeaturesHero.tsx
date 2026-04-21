type FeaturesHeroDict = {
  heading: string;
  subtitle: string;
  categories: string[];
};

export default function FeaturesHero({ dict }: { dict: FeaturesHeroDict }) {
  return (
    <section className="flex justify-center px-[10px]">
      <div className="w-full max-w-[1280px] px-6 pt-10 pb-8">
        {/* Header row */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h1 className="text-3xl font-bold text-[#262626] md:text-5xl">
            {dict.heading}
          </h1>
          <p className="max-w-sm text-base leading-relaxed text-[#4d4d4d] md:text-right">
            {dict.subtitle}
          </p>
        </div>

        {/* Category grid on dark background */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-[#1B1464] p-6 md:p-10">
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {dict.categories.map((category, i) => (
              <div
                key={i}
                className="flex items-center justify-center rounded-xl bg-white/10 px-3 py-5 text-center text-xs font-medium text-white transition hover:bg-white/15 md:px-6 md:text-sm"
              >
                {category}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
