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
}

export interface SalespageHero {
  heading: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
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
    business: SalespageFeatureCard;
    developer: SalespageFeatureCard;
    performance: SalespageFeatureCard;
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

export interface SalespageDocuments {
  search: { placeholder: string };
  sidebar: { sections: SalespageDocsSidebarSection[] };
  toc: { title: string };
  article: {
    eyebrow: string;
    title: string;
    description: string;
    sections: SalespageDocsArticleSection[];
  };
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
  features: SalespageFeatures;
  useCases: SalespageUseCases;
  pricing: SalespagePricing;
  video: SalespageVideo;
  partners: SalespagePartners;
  faq: SalespageFaq;
  documents: SalespageDocuments;
  trial: SalespageTrial;
  footer: SalespageFooter;
}

export type SalespageSectionKey = keyof SalespageDict;

export const SALESPAGE_SECTION_KEYS: SalespageSectionKey[] = [
  'metadata',
  'nav',
  'hero',
  'features',
  'useCases',
  'pricing',
  'video',
  'partners',
  'faq',
  'documents',
  'trial',
  'footer',
];
