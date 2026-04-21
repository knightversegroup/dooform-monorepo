import { Check } from 'lucide-react';

type FeaturesDeveloperDict = {
  heading: string;
  subtitle: string;
  features: string[];
};

export default function FeaturesDeveloper({
  dict,
}: {
  dict: FeaturesDeveloperDict;
}) {
  return (
    <section className="bg-[#1B1464]">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center px-6 py-20 text-center">
        {/* Decorative circles */}
        <div className="relative mb-8 h-20 w-40">
          <div className="absolute left-4 top-0 h-20 w-20 rounded-full bg-white/10" />
          <div className="absolute right-4 top-0 h-20 w-20 rounded-full bg-white/5" />
        </div>

        <h2 className="text-3xl font-bold text-white md:text-4xl">
          {dict.heading}
        </h2>
        <p className="mt-3 max-w-md text-base text-white/60">
          {dict.subtitle}
        </p>

        <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-3 text-left md:grid-cols-2">
          {dict.features.map((feature, i) => (
            <li
              key={i}
              className="flex items-center gap-2.5 text-sm text-white/80"
            >
              <Check className="h-4 w-4 shrink-0 text-green-400" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
