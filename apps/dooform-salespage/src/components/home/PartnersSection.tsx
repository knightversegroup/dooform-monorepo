type PartnersDict = {
  heading: string;
  subtitle: string;
};

const PARTNER_COUNT = 6;

function LogoPlaceholder({ index }: { index: number }) {
  return (
    <div className="flex h-[73px] w-full items-center justify-center rounded-lg bg-gray-100">
      <div className="h-8 w-24 rounded bg-gray-200" />
    </div>
  );
}

export default function PartnersSection({ dict }: { dict: PartnersDict }) {
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

        {/* Partner Logos */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {Array.from({ length: PARTNER_COUNT }, (_, i) => (
            <LogoPlaceholder key={i} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
