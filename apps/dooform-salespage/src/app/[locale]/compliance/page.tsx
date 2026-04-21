import { getDictionary } from '../../../i18n';
import { type Locale } from '../../../i18n/config';
import ComplianceHero from '../../../components/compliance/ComplianceHero';
import CompliancePillars from '../../../components/compliance/CompliancePillars';
import ComplianceCerts from '../../../components/compliance/ComplianceCerts';
import ComplianceDataFlow from '../../../components/compliance/ComplianceDataFlow';
import ComplianceCommitment from '../../../components/compliance/ComplianceCommitment';
import TrialSection from '../../../components/home/TrialSection';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CompliancePage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <main>
      <ComplianceHero dict={dict.compliancePage.hero} />
      <CompliancePillars dict={dict.compliancePage.pillars} />
      <ComplianceCerts dict={dict.compliancePage.certifications} />
      <ComplianceDataFlow dict={dict.compliancePage.dataFlow} />
      <ComplianceCommitment dict={dict.compliancePage.commitment} />
      <TrialSection dict={dict.trial} />
    </main>
  );
}
