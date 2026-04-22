import { ArrowRight } from 'lucide-react';
import { Typography } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';

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
    <Section padding="none">
      <Container className="space-y-8 py-8">
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
              <Typography variant="h3">
                {item.title}
              </Typography>
              <Typography variant="body" className="mt-3 leading-relaxed">
                {item.description}
              </Typography>
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
      </Container>
    </Section>
  );
}
