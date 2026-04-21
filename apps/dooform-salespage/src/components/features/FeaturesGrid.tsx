import {
  FileText,
  Languages,
  Users,
  Layers,
  ShieldCheck,
  FilePlus,
  Download,
  Sparkles,
  Bell,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type FeaturesGridItem = {
  title: string;
  description: string;
};

type FeaturesGridDict = {
  heading: string;
  items: FeaturesGridItem[];
};

const ICONS: LucideIcon[] = [
  FileText,
  Languages,
  Users,
  Layers,
  ShieldCheck,
  FilePlus,
  Download,
  Sparkles,
  Bell,
];

export default function FeaturesGrid({ dict }: { dict: FeaturesGridDict }) {
  return (
    <section className="flex justify-center px-[10px]">
      <div className="w-full max-w-[1280px] px-6 py-16">
        <h2 className="mb-10 text-2xl font-bold text-[#262626] md:text-3xl">
          {dict.heading}
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {dict.items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <div
                key={i}
                className="rounded-xl border border-[#e7e7e7] p-6 transition hover:border-[#c9c1b6]"
              >
                <Icon
                  className="h-8 w-8 text-[#2c2585]"
                  strokeWidth={1.5}
                />
                <h3 className="mt-4 text-base font-semibold text-[#262626]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4d4d4d]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
