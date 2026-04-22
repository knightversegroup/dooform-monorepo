import { Typography } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';

export type ComplianceCert = {
  name: string;
  description: string;
};

export type ComplianceCertsDict = {
  heading: string;
  items: ComplianceCert[];
};

const accentColors = [
  'border-l-[#1B1464]',
  'border-l-[#2c2585]',
  'border-l-[#4338ca]',
  'border-l-[#1B1464]',
  'border-l-[#2c2585]',
  'border-l-[#4338ca]',
];

export default function ComplianceCerts({
  dict,
}: {
  dict: ComplianceCertsDict;
}) {
  return (
    <Section padding="lg" className="bg-[#FAFAF8]">
      <Container>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <Typography variant="h2">
            {dict.heading}
          </Typography>
          <div className="hidden h-10 w-10 rounded-full bg-[#2c2585] md:block" />
        </div>

        <div className="mt-4 h-1 w-16 bg-[#1B1464]" />

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dict.items.map((cert, i) => (
            <div
              key={cert.name}
              className={`border-l-4 bg-white py-6 pl-6 pr-8 ${accentColors[i % accentColors.length]}`}
            >
              <Typography variant="h4" as="h3">
                {cert.name}
              </Typography>
              <Typography variant="body" className="mt-2 leading-relaxed">
                {cert.description}
              </Typography>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
