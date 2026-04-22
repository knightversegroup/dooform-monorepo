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
import { Typography } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';

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
    <Section padding="md">
      <Container>
        <Typography variant="h2" className="mb-10">
          {dict.heading}
        </Typography>

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
                <Typography variant="h4" as="h3" className="mt-4">
                  {item.title}
                </Typography>
                <Typography variant="body" className="mt-2 leading-relaxed">
                  {item.description}
                </Typography>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
