import { getDictionary } from '../../../i18n';
import { type Locale } from '../../../i18n/config';
import DocsSearch from '../../../components/documents/DocsSearch';
import DocsSidebar from '../../../components/documents/DocsSidebar';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DocumentsLayout({ children, params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <div className="flex justify-center px-[10px]">
      <div className="flex w-full max-w-[1280px] flex-col gap-8 px-6 py-8 md:flex-row md:gap-10 md:py-12">
        <aside className="flex shrink-0 flex-col gap-6 md:sticky md:top-20 md:h-[calc(100vh-6rem)] md:w-[240px] md:overflow-y-auto md:pb-6">
          <DocsSearch placeholder={dict.documents.search.placeholder} />
          <DocsSidebar dict={dict.documents.sidebar} locale={locale} />
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
