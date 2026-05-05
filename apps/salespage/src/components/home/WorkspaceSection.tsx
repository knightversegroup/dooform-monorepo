import { ArrowRight } from 'lucide-react';
import { Typography } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';

type WorkspaceCardDict = {
  label: string;
  tagline: string;
};

export type WorkspaceDict = {
  heading: string;
  cards: {
    docs: WorkspaceCardDict;
    knowledgeBase: WorkspaceCardDict;
    projects: WorkspaceCardDict;
  };
};

const cards = [
  { key: 'docs' as const, bg: 'bg-[#f5f0ea]' },
  { key: 'knowledgeBase' as const, bg: 'bg-[#f5f0ea]' },
  { key: 'projects' as const, bg: 'bg-[#f5f0ea]' },
];

export default function WorkspaceSection({ dict }: { dict: WorkspaceDict }) {
  return (
    <Section padding="lg">
      <Container>
        <Typography variant="h2" className="mb-10 md:mb-14">
          {dict.heading}
        </Typography>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {cards.map(({ key, bg }) => {
            const card = dict.cards[key];
            const isLast = key === 'projects';

            return (
              <div
                key={key}
                className={`flex flex-col overflow-hidden rounded-2xl ${bg} ${isLast ? 'md:col-span-2' : ''}`}
              >
                {/* Label + arrow */}
                <div className="flex items-center justify-between p-6 pb-4 md:p-8 md:pb-4">
                  <div>
                    <span className="text-sm font-semibold uppercase tracking-wider text-[#737373] md:text-base">
                      {card.label}
                    </span>
                    <p className="mt-1 text-xl font-semibold text-[#262626] md:text-2xl">
                      {card.tagline}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0d4b3b]">
                    <ArrowRight size={20} className="text-white" />
                  </div>
                </div>

                {/* Preview image — cropped to top half */}
                <div className={`relative overflow-hidden ${isLast ? 'h-[280px] md:h-[400px]' : 'h-[200px] md:h-[260px]'}`}>
                  <img
                    src="/images/workspace-preview.png"
                    alt={card.label}
                    className="absolute inset-x-0 top-0 w-full object-cover object-top"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
