export type ArticleSection = {
  id: string;
  heading: string;
  body: string;
};

export type DocsArticleDict = {
  eyebrow: string;
  title: string;
  description: string;
  sections: ArticleSection[];
};

export default function DocsArticle({ dict }: { dict: DocsArticleDict }) {
  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-[#2c2585]">
          {dict.eyebrow}
        </span>
        <h1 className="text-3xl font-semibold text-[#262626] md:text-4xl">
          {dict.title}
        </h1>
        <p className="text-base text-[#737373]">{dict.description}</p>
      </header>

      {dict.sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="flex scroll-mt-24 flex-col gap-3"
        >
          <h2 className="text-xl font-semibold text-[#262626] md:text-2xl">
            {section.heading}
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-[#4d4d4d] md:text-base">
            {section.body}
          </p>
        </section>
      ))}
    </article>
  );
}
