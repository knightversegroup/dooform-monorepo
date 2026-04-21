export type UsecasesHeroDict = {
  eyebrow: string;
  heading: string;
  subtitle: string;
};

export default function UsecasesHero({
  dict,
}: {
  dict: UsecasesHeroDict;
}) {
  return (
    <section className="px-[10px] pb-16 pt-16 md:pb-24 md:pt-20">
      <div className="mx-auto max-w-[1280px] px-6">
        <p className="text-sm font-medium text-[#2c2585]">{dict.eyebrow}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-[#262626] md:text-6xl">
          {dict.heading}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#4d4d4d]">
          {dict.subtitle}
        </p>
      </div>
    </section>
  );
}
