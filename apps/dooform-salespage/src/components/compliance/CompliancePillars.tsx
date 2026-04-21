import { Shield, Lock, Eye, Server } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type CompliancePillar = {
  title: string;
  description: string;
};

export type CompliancePillarsDict = {
  heading: string;
  items: CompliancePillar[];
};

const pillarStyles: {
  icon: LucideIcon;
  accent: string;
  shape: string;
}[] = [
  {
    icon: Shield,
    accent: 'bg-[#1B1464]',
    shape: 'rounded-full',
  },
  {
    icon: Lock,
    accent: 'bg-[#2c2585]',
    shape: 'rounded-none',
  },
  {
    icon: Eye,
    accent: 'bg-[#4338ca]',
    shape: 'rounded-full',
  },
  {
    icon: Server,
    accent: 'bg-[#1B1464]',
    shape: 'rounded-none rotate-45',
  },
];

export default function CompliancePillars({
  dict,
}: {
  dict: CompliancePillarsDict;
}) {
  return (
    <section className="px-[10px] py-20">
      <div className="mx-auto max-w-[1280px] px-6">
        <h2 className="text-3xl font-bold text-[#262626] md:text-4xl">
          {dict.heading}
        </h2>

        <div className="mt-4 h-1 w-16 bg-[#2c2585]" />

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {dict.items.map((item, i) => {
            const style = pillarStyles[i % pillarStyles.length];
            const Icon = style.icon;

            return (
              <div key={item.title} className="group">
                <div
                  className={`flex h-14 w-14 items-center justify-center ${style.accent} ${style.shape}`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="mt-6 text-lg font-bold text-[#262626]">
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
