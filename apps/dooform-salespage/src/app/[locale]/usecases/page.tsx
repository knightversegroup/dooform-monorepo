import { getDictionary } from '../../../i18n';
import { type Locale } from '../../../i18n/config';
import UsecasesHero from '../../../components/usecases/UsecasesHero';
import UsecasesGrid from '../../../components/usecases/UsecasesGrid';
import UsecasesStats from '../../../components/usecases/UsecasesStats';
import UsecasesQuote from '../../../components/usecases/UsecasesQuote';
import UsecasesCta from '../../../components/usecases/UsecasesCta';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function UseCasePage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <main>
      <UsecasesHero dict={dict.usecasesPage.hero} />
      <UsecasesGrid dict={dict.usecasesPage.grid} />
      <UsecasesStats dict={dict.usecasesPage.stats} />
      <UsecasesQuote dict={dict.usecasesPage.quote} />
      <UsecasesCta dict={dict.usecasesPage.cta} />
    </main>
  );
}
