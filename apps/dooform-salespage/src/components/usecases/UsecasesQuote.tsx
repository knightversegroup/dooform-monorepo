export type UsecasesQuoteDict = {
  text: string;
  author: string;
  company: string;
};

export default function UsecasesQuote({
  dict,
}: {
  dict: UsecasesQuoteDict;
}) {
  return (
    <section className="px-[10px] py-24">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="mx-auto max-w-3xl">
          {/* Accent line */}
          <div className="h-px w-16 bg-[#2c2585]" />

          <blockquote className="mt-8 text-2xl font-medium leading-relaxed tracking-tight text-[#262626] md:text-3xl">
            &ldquo;{dict.text}&rdquo;
          </blockquote>

          <div className="mt-8">
            <p className="text-sm font-semibold text-[#262626]">
              {dict.author}
            </p>
            <p className="mt-0.5 text-sm text-[#4d4d4d]">{dict.company}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
