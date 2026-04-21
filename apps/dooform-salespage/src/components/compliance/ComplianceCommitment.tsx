export type ComplianceCommitmentDict = {
  heading: string;
  body: string;
  cta: string;
};

export default function ComplianceCommitment({
  dict,
}: {
  dict: ComplianceCommitmentDict;
}) {
  return (
    <section className="relative overflow-hidden bg-[#1B1464] px-[10px] py-20">
      {/* Bauhaus geometric decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-10 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full border-[3px] border-white/10 md:h-72 md:w-72" />
        <div className="absolute bottom-8 left-8 h-10 w-10 bg-[#2c2585]" />
        <div
          className="absolute right-1/3 top-8 opacity-25"
          style={{
            width: 0,
            height: 0,
            borderLeft: '30px solid transparent',
            borderRight: '30px solid transparent',
            borderBottom: '52px solid #4338ca',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            {dict.heading}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-white/60">
            {dict.body}
          </p>
          <a
            href="#trial"
            className="mt-8 inline-block rounded-full bg-[#2c2585] px-8 py-3 text-sm font-medium text-white transition hover:bg-[#231e6b]"
          >
            {dict.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
