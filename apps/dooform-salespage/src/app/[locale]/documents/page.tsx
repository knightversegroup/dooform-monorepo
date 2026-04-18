import { getDictionary } from '../../../i18n';
import { type Locale } from '../../../i18n/config';
import DocsArticle from '../../../components/documents/DocsArticle';
import DocsTOC from '../../../components/documents/DocsTOC';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DocumentsPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  const article = dict.documents.article;
  const tocItems = article.sections.map((section) => ({
    id: section.id,
    title: section.heading,
  }));

  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
      <div className="min-w-0 flex-1">
        <DocsArticle dict={article} />
      </div>
      <aside className="hidden shrink-0 lg:sticky lg:top-20 lg:block lg:h-fit lg:w-[200px]">
        <DocsTOC title={dict.documents.toc.title} items={tocItems} />
      </aside>
    </div>
  );
}
