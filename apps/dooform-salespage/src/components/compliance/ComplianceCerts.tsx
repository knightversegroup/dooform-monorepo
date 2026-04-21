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
    <section className="bg-[#FAFAF8] px-[10px] py-20">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="text-3xl font-bold text-[#262626] md:text-4xl">
            {dict.heading}
          </h2>
          <div className="hidden h-10 w-10 rounded-full bg-[#2c2585] md:block" />
        </div>

        <div className="mt-4 h-1 w-16 bg-[#1B1464]" />

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dict.items.map((cert, i) => (
            <div
              key={cert.name}
              className={`border-l-4 bg-white py-6 pl-6 pr-8 ${accentColors[i % accentColors.length]}`}
            >
              <h3 className="text-base font-bold text-[#262626]">
                {cert.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4d4d4d]">
                {cert.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
