import { getDictionary } from '../../../i18n';
import { type Locale } from '../../../i18n/config';
import FeaturesHero from '../../../components/features/FeaturesHero';
import FeaturesShowcase from '../../../components/features/FeaturesShowcase';
import FeaturesQuote from '../../../components/features/FeaturesQuote';
import FeaturesGrid from '../../../components/features/FeaturesGrid';
import FeaturesDeveloper from '../../../components/features/FeaturesDeveloper';
import TrialSection from '../../../components/home/TrialSection';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function FeaturesPage({ params }: Props) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <main>
      <FeaturesHero dict={dict.featuresPage} />
      <FeaturesShowcase dict={dict.featuresPage} />
      <FeaturesQuote dict={dict.featuresPage.quote} />
      <FeaturesGrid dict={dict.featuresPage.allFeatures} />
      <FeaturesDeveloper dict={dict.featuresPage.developer} />
      <TrialSection dict={dict.trial} />
    </main>
  );
}
