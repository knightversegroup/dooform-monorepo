import { ArrowRight } from 'lucide-react';

type HighlightDict = {
  title: string;
  description: string;
  link: string;
};

type FeaturesShowcaseDict = {
  highlights: HighlightDict[];
};

export default function FeaturesShowcase({
  dict,
}: {
  dict: FeaturesShowcaseDict;
}) {
  return (
    <section className="flex justify-center px-[10px]">
      <div className="w-full max-w-[1280px] space-y-8 px-6 py-8">
        {dict.highlights.map((item, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-[#e7e7e7] md:flex-row"
          >
            {/* Visual area */}
            <div className="flex min-h-[200px] items-center justify-center bg-[#f5f5f5] p-10 md:w-2/5">
              <div className="h-10 w-36 rounded bg-gray-300" />
            </div>

            {/* Text area */}
            <div className="flex flex-col justify-center p-8 md:w-3/5 md:p-10">
              <h3 className="text-xl font-bold text-[#262626] md:text-2xl">
                {item.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-[#4d4d4d]">
                {item.description}
              </p>
              <a
                href="#"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#2c2585] transition hover:opacity-80"
              >
                {item.link}
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
