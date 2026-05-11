import dict from '../../content/dict.json';
import PricingSection from '../../components/home/PricingSection';
import TrialSection from '../../components/home/TrialSection';
import PlanComparison from '../../components/plan/PlanComparison';

export const metadata = {
  title: 'แพ็คเกจราคา — Dooform',
  description:
    'เลือกแพ็กเกจที่เหมาะกับความต้องการของคุณ พร้อมเปรียบเทียบฟีเจอร์ของทุกแพ็กเกจอย่างละเอียด',
};

export default function PricingPage() {
  return (
    <main>
      <PricingSection dict={dict.pricing} />
      <PlanComparison dict={dict.planPage.comparison} />
      <TrialSection dict={dict.trial} />
    </main>
  );
}
