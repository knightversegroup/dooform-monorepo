import type { SalespageDocumentPage } from '@dooform/shared';
import DocsArticle from './DocsArticle';
import DocsTOC from './DocsTOC';

export default function DocsPageRenderer({
  page,
  tocTitle,
}: {
  page: SalespageDocumentPage;
  tocTitle: string;
}) {
  const tocItems = page.sections.map((section) => ({
    id: section.id,
    title: section.heading,
  }));

  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
      <div className="min-w-0 flex-1">
        <DocsArticle dict={page} />
      </div>
      <aside className="hidden shrink-0 lg:sticky lg:top-20 lg:block lg:h-fit lg:w-[200px]">
        <DocsTOC title={tocTitle} items={tocItems} />
      </aside>
    </div>
  );
}
