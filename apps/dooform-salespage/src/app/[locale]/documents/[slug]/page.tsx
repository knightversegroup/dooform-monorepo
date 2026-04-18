import { notFound } from 'next/navigation';
import { getDictionary } from '../../../../i18n';
import { type Locale } from '../../../../i18n/config';
import DocsPageRenderer from '../../../../components/documents/DocsPageRenderer';

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function DocumentSubPage({ params }: Props) {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale as Locale);

  const page = dict.documents.pages?.[slug];
  if (!page) {
    notFound();
  }

  return (
    <DocsPageRenderer page={page} tocTitle={dict.documents.toc.title} />
  );
}
