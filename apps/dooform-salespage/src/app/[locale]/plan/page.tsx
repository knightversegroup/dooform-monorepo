import { getDictionary } from '../../../i18n';
import { type Locale } from '../../../i18n/config';
import PlanCards from '../../../components/plan/PlanCards';
import PlanComparison from '../../../components/plan/PlanComparison';
import TrialSection from '../../../components/home/TrialSection';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PlanPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <main>
      <PlanCards dict={dict.planPage} />
      <PlanComparison dict={dict.planPage.comparison} />
      <TrialSection dict={dict.trial} />
    </main>
  );
}
