import { ArrowRight } from 'lucide-react';

export type UsecaseCard = {
  industry: string;
  title: string;
  description: string;
  link: string;
};

export type UsecasesGridDict = {
  items: UsecaseCard[];
};

const placeholderColors = [
  'from-[#1B1464]/15 to-[#1B1464]/5',
  'from-[#2c2585]/15 to-[#2c2585]/5',
  'from-[#4338ca]/10 to-[#4338ca]/3',
  'from-[#1B1464]/10 to-[#1B1464]/3',
  'from-[#2c2585]/12 to-[#2c2585]/4',
  'from-[#4338ca]/15 to-[#4338ca]/5',
];

export default function UsecasesGrid({
  dict,
}: {
  dict: UsecasesGridDict;
}) {
  return (
    <section className="px-[10px] pb-24">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dict.items.map((item, i) => (
            <a
              key={item.title}
              href="#"
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-transform duration-300 hover:scale-[1.02]"
            >
              {/* Image placeholder */}
              <div
                className={`aspect-[16/10] w-full bg-gradient-to-br ${placeholderColors[i % placeholderColors.length]}`}
              />

              <div className="flex flex-1 flex-col p-6">
                {/* Industry tag */}
                <p className="text-xs font-medium uppercase tracking-widest text-[#2c2585]">
                  {item.industry}
                </p>

                <h3 className="mt-3 text-xl font-semibold leading-snug text-[#262626]">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-relaxed text-[#4d4d4d]">
                  {item.description}
                </p>

                {/* Read story link */}
                <div className="mt-auto flex items-center gap-1.5 pt-6 text-sm font-medium text-[#1B1464]">
                  {item.link}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
