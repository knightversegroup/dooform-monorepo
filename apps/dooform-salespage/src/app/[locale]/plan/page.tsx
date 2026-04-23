import { getDictionary } from '../../../i18n';
import { type Locale } from '../../../i18n/config';
import PlanCards from '../../../components/plan/PlanCards';
import PlanComparison from '../../../components/plan/PlanComparison';
import TrialSection from '../../../components/home/TrialSection';
import PricingSection from 'apps/dooform-salespage/src/components/home/PricingSection';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PlanPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <main>
      <PricingSection dict={dict.pricing} />
      <PlanComparison dict={dict.planPage.comparison} />
      <TrialSection dict={dict.trial} />
    </main>
  );
}
