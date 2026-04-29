// Shape of the salespage i18n dictionary. Mirrors
// apps/dooform-salespage/src/i18n/dictionaries/{en,th}.json and is the source
// of truth for both the backoffice editor and the salespage pages.

export type SalespageLocale = 'en' | 'th';

export interface SalespageMetadata {
  title: string;
  description: string;
}

export interface SalespageNav {
  features: string;
  useCases: string;
  compliance: string;
  plan: string;
  articles: string;
  documents: string;
  register: string;
  login: string;
}

export interface SalespageHero {
  heading: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  bento: {
    topRight: string;
    bottomLeft: string;
    bottomCenter: string;
    bottomRight: string;
  };
}

export interface SalespageFeaturesHighlightCard {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
}

export interface SalespageFeaturesHighlight {
  badge: string;
  heading: string;
  subtitle: string;
  cards: {
    card1: SalespageFeaturesHighlightCard;
    card2: SalespageFeaturesHighlightCard;
  };
}

export interface SalespageFeatureCard {
  title: string;
  description: string;
  button: string;
}

export interface SalespageFeatures {
  heading: string;
  viewUseCases: string;
  cards: {
    documents: SalespageFeatureCard;
    templates: SalespageFeatureCard;
    stamps: SalespageFeatureCard;
    collaboration: SalespageFeatureCard;
    branding: SalespageFeatureCard;
    security: SalespageFeatureCard;
  };
}

export interface SalespageWorkspaceCard {
  label: string;
  tagline: string;
}

export interface SalespageWorkspace {
  heading: string;
  cards: {
    docs: SalespageWorkspaceCard;
    knowledgeBase: SalespageWorkspaceCard;
    projects: SalespageWorkspaceCard;
  };
}

export interface SalespageUseCaseCard {
  title: string;
  description: string;
}

export interface SalespageUseCases {
  heading: string;
  subtitle: string;
  cards: {
    card1: SalespageUseCaseCard;
    card2: SalespageUseCaseCard;
    card3: SalespageUseCaseCard;
  };
}

export interface SalespagePricingPlan {
  name: string;
  price: string;
  period: string;
  button: string;
  features: string[];
}

export interface SalespagePricing {
  heading: string;
  subtitle: string;
  recommendLabel: string;
  footnote: string;
  allFeatures: string;
  plans: {
    trial: SalespagePricingPlan;
    starter: SalespagePricingPlan;
    plus: SalespagePricingPlan;
    enterprise: SalespagePricingPlan;
  };
}

export interface SalespageVideo {
  heading: string;
  viewUseCases: string;
}

export interface SalespagePartners {
  heading: string;
  subtitle: string;
}

export interface SalespageFaqItem {
  question: string;
  answer: string;
}

export interface SalespageFaq {
  heading: string;
  subtitle: string;
  viewDocuments: string;
  readMore: string;
  items: SalespageFaqItem[];
}

export interface SalespageDocsSidebarItem {
  title: string;
  href: string;
}

export interface SalespageDocsSidebarSection {
  title: string;
  items: SalespageDocsSidebarItem[];
}

export interface SalespageDocsArticleSection {
  id: string;
  heading: string;
  body: string;
}

export interface SalespageDocumentPage {
  eyebrow: string;
  title: string;
  description: string;
  sections: SalespageDocsArticleSection[];
}

export interface SalespageDocuments {
  search: { placeholder: string };
  sidebar: { sections: SalespageDocsSidebarSection[] };
  toc: { title: string };
  article: SalespageDocumentPage;
  pages: Record<string, SalespageDocumentPage>;
}

export interface SalespageFeaturesPageHighlight {
  title: string;
  description: string;
  link: string;
}

export interface SalespageFeaturesPageItem {
  title: string;
  description: string;
}

export interface SalespageFeaturesPage {
  heading: string;
  subtitle: string;
  categories: string[];
  highlights: SalespageFeaturesPageHighlight[];
  quote: {
    text: string;
    author: string;
    company: string;
  };
  allFeatures: {
    heading: string;
    items: SalespageFeaturesPageItem[];
  };
  developer: {
    heading: string;
    subtitle: string;
    features: string[];
  };
}

export interface SalespageUsecaseCard {
  industry: string;
  title: string;
  description: string;
  link: string;
}

export interface SalespageUsecasesStat {
  value: string;
  label: string;
}

export interface SalespageUsecasesPage {
  hero: {
    eyebrow: string;
    heading: string;
    subtitle: string;
  };
  grid: {
    items: SalespageUsecaseCard[];
  };
  stats: {
    items: SalespageUsecasesStat[];
  };
  quote: {
    text: string;
    author: string;
    company: string;
  };
  cta: {
    heading: string;
    subtitle: string;
    button: string;
  };
}

export interface SalespageCompliancePillar {
  title: string;
  description: string;
}

export interface SalespageComplianceCert {
  name: string;
  description: string;
}

export interface SalespageComplianceDataFlowStep {
  step: string;
  title: string;
  description: string;
}

export interface SalespageCompliancePage {
  hero: {
    heading: string;
    subtitle: string;
  };
  pillars: {
    heading: string;
    items: SalespageCompliancePillar[];
  };
  certifications: {
    heading: string;
    items: SalespageComplianceCert[];
  };
  dataFlow: {
    heading: string;
    subtitle: string;
    steps: SalespageComplianceDataFlowStep[];
  };
  commitment: {
    heading: string;
    body: string;
    cta: string;
  };
}

export interface SalespagePlanPageCard {
  name: string;
  tagline: string;
  price: string;
  period: string;
  button: string;
  featureIntro: string;
  features: string[];
}

export interface SalespagePlanComparisonRow {
  feature: string;
  description?: string;
  values: (boolean | string)[];
}

export interface SalespagePlanComparisonSection {
  name: string;
  rows: SalespagePlanComparisonRow[];
}

export interface SalespagePlanComparison {
  heading: string;
  columns: string[];
  sections: SalespagePlanComparisonSection[];
}

export interface SalespagePlanPage {
  heading: string;
  subtitle: string;
  recommendLabel: string;
  footnote: string;
  plans: {
    trial: SalespagePlanPageCard;
    starter: SalespagePlanPageCard;
    plus: SalespagePlanPageCard;
    enterprise: SalespagePlanPageCard;
  };
  comparison: SalespagePlanComparison;
}

export interface SalespageContactStat {
  value: string;
  label: string;
}

export interface SalespageContactForm {
  firstName: string;
  firstNamePlaceholder: string;
  company: string;
  companyPlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  details: string;
  detailsPlaceholder: string;
  submit: string;
}

export interface SalespageContact {
  heading: string;
  subtitle: string;
  aiLabel: string;
  stats: {
    month1: SalespageContactStat;
    month2: SalespageContactStat;
    month3: SalespageContactStat;
  };
  form: SalespageContactForm;
}

export interface SalespageTrial {
  heading: string;
  subtitle: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  register: string;
  hasAccount: string;
  consent: string;
}

export interface SalespageFooter {
  copyright: string;
  companyName: string;
  termsNotice: string;
  sections: {
    members: string;
    aboutApp: string;
    forBusiness: string;
    legal: string;
  };
  links: Record<string, string>;
}

export interface SalespageDict {
  metadata: SalespageMetadata;
  nav: SalespageNav;
  hero: SalespageHero;
  workspace: SalespageWorkspace;
  featuresHighlight: SalespageFeaturesHighlight;
  features: SalespageFeatures;
  useCases: SalespageUseCases;
  pricing: SalespagePricing;
  video: SalespageVideo;
  partners: SalespagePartners;
  faq: SalespageFaq;
  documents: SalespageDocuments;
  featuresPage: SalespageFeaturesPage;
  usecasesPage: SalespageUsecasesPage;
  compliancePage: SalespageCompliancePage;
  planPage: SalespagePlanPage;
  contact: SalespageContact;
  trial: SalespageTrial;
  footer: SalespageFooter;
}

export type SalespageSectionKey = keyof SalespageDict;

export const SALESPAGE_SECTION_KEYS: SalespageSectionKey[] = [
  'metadata',
  'nav',
  'hero',
  'workspace',
  'featuresHighlight',
  'features',
  'useCases',
  'pricing',
  'video',
  'partners',
  'faq',
  'documents',
  'featuresPage',
  'usecasesPage',
  'compliancePage',
  'planPage',
  'contact',
  'trial',
  'footer',
];
