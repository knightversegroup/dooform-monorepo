import { Section, Container } from '@dooform/ui';

export type UsecasesStat = {
  value: string;
  label: string;
};

export type UsecasesStatsDict = {
  items: UsecasesStat[];
};

export default function UsecasesStats({
  dict,
}: {
  dict: UsecasesStatsDict;
}) {
  return (
    <Section padding="lg" className="bg-[#1B1464]">
      <Container>
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {dict.items.map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-white/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
