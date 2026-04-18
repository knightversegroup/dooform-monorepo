import { getDictionary } from '../../../i18n';
import { type Locale } from '../../../i18n/config';
import DocsPageRenderer from '../../../components/documents/DocsPageRenderer';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DocumentsPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <DocsPageRenderer
      page={dict.documents.article}
      tocTitle={dict.documents.toc.title}
    />
  );
}
