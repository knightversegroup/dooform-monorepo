type PartnersDict = {
  heading: string;
  subtitle: string;
};

const PARTNER_COUNT = 6;

function LogoCard() {
  return (
    <div className="flex h-[80px] w-[280px] shrink-0 items-center justify-center rounded-xl bg-white">
      <div className="h-8 w-28 rounded bg-gray-200" />
    </div>
  );
}

export default function PartnersSection({ dict }: { dict: PartnersDict }) {
  const logos = Array.from({ length: PARTNER_COUNT });

  return (
    <section className="flex justify-center px-[10px]">
      <div className="w-full max-w-[1280px] px-6 py-9">
        {/* Header */}
        <div className="mb-9 text-center">
          <h2 className="text-2xl font-semibold text-[#262626]">
            {dict.heading}
          </h2>
          <p className="mt-0.5 text-base text-[#262626]">{dict.subtitle}</p>
        </div>

        {/* Marquee with edge fade */}
        <div
          className="relative overflow-hidden rounded-2xl bg-[#f5f5f5] py-8"
          style={{
            maskImage:
              'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          }}
        >
          <div className="flex w-max animate-marquee gap-4">
            {logos.map((_, i) => (
              <LogoCard key={`a-${i}`} />
            ))}
            {logos.map((_, i) => (
              <LogoCard key={`b-${i}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
