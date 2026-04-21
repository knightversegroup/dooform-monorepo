export type UsecasesCtaDict = {
  heading: string;
  subtitle: string;
  button: string;
};

export default function UsecasesCta({
  dict,
}: {
  dict: UsecasesCtaDict;
}) {
  return (
    <section className="px-[10px] pb-24">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="rounded-2xl bg-[#1B1464] px-8 py-16 text-center md:px-16 md:py-20">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {dict.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-white/50">
            {dict.subtitle}
          </p>
          <a
            href="#trial"
            className="mt-8 inline-block rounded-full bg-[#2c2585] px-8 py-3 text-sm font-medium text-white transition hover:bg-[#231e6b]"
          >
            {dict.button}
          </a>
        </div>
      </div>
    </section>
  );
}
