"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import type {
  SalespageDict,
  SalespageDocuments,
  SalespageDocumentPage,
  SalespageDocsArticleSection,
  SalespageDocsSidebarItem,
  SalespageDocsSidebarSection,
  SalespageFaq,
  SalespageFaqItem,
  SalespageFeatureCard,
  SalespageFeatures,
  SalespageFooter,
  SalespageHero,
  SalespageMetadata,
  SalespageNav,
  SalespagePartners,
  SalespagePricing,
  SalespagePricingPlan,
  SalespageTrial,
  SalespageUseCaseCard,
  SalespageUseCases,
  SalespageVideo,
} from "@dooform/shared";

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
const labelClass = "block text-xs font-semibold text-gray-700 mb-1";
const fieldGroupClass = "flex flex-col gap-1";
const cardClass = "flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4";

type EditorProps<K extends keyof SalespageDict> = {
  value: SalespageDict[K];
  onChange: (next: SalespageDict[K]) => void;
};

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className={fieldGroupClass}>
      <label className={labelClass}>{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={inputClass}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}
    </div>
  );
}

// ---------------- Hero ----------------

export function HeroEditor({ value, onChange }: EditorProps<"hero">) {
  const update = (patch: Partial<SalespageHero>) =>
    onChange({ ...value, ...patch });
  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading" value={value.heading} onChange={(v) => update({ heading: v })} />
      <Field label="Subtitle" value={value.subtitle} onChange={(v) => update({ subtitle: v })} multiline />
      <Field label="Primary CTA" value={value.primaryCta} onChange={(v) => update({ primaryCta: v })} />
      <Field label="Secondary CTA" value={value.secondaryCta} onChange={(v) => update({ secondaryCta: v })} />
    </div>
  );
}

// ---------------- Trial ----------------

export function TrialEditor({ value, onChange }: EditorProps<"trial">) {
  const update = (patch: Partial<SalespageTrial>) =>
    onChange({ ...value, ...patch });
  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading" value={value.heading} onChange={(v) => update({ heading: v })} />
      <Field label="Subtitle" value={value.subtitle} onChange={(v) => update({ subtitle: v })} multiline />
      <Field label="Name placeholder" value={value.namePlaceholder} onChange={(v) => update({ namePlaceholder: v })} />
      <Field label="Email placeholder" value={value.emailPlaceholder} onChange={(v) => update({ emailPlaceholder: v })} />
      <Field label="Password placeholder" value={value.passwordPlaceholder} onChange={(v) => update({ passwordPlaceholder: v })} />
      <Field label="Register button" value={value.register} onChange={(v) => update({ register: v })} />
      <Field label="Has account label" value={value.hasAccount} onChange={(v) => update({ hasAccount: v })} />
      <Field label="Consent text" value={value.consent} onChange={(v) => update({ consent: v })} multiline />
    </div>
  );
}

// ---------------- FAQ ----------------

export function FaqEditor({ value, onChange }: EditorProps<"faq">) {
  const update = (patch: Partial<SalespageFaq>) =>
    onChange({ ...value, ...patch });
  const updateItem = (index: number, patch: Partial<SalespageFaqItem>) => {
    const items = value.items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    update({ items });
  };
  const addItem = () =>
    update({ items: [...value.items, { question: "", answer: "" }] });
  const removeItem = (index: number) =>
    update({ items: value.items.filter((_, i) => i !== index) });

  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading" value={value.heading} onChange={(v) => update({ heading: v })} />
      <Field label="Subtitle" value={value.subtitle} onChange={(v) => update({ subtitle: v })} multiline />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="View documents CTA" value={value.viewDocuments} onChange={(v) => update({ viewDocuments: v })} />
        <Field label="Read more CTA" value={value.readMore} onChange={(v) => update({ readMore: v })} />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Items</h3>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <Plus className="h-3.5 w-3.5" /> Add item
        </button>
      </div>

      {value.items.map((item, index) => (
        <div key={index} className={cardClass}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">#{index + 1}</span>
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="rounded-md p-1 text-red-600 hover:bg-red-50"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <Field label="Question" value={item.question} onChange={(v) => updateItem(index, { question: v })} />
          <Field label="Answer" value={item.answer} onChange={(v) => updateItem(index, { answer: v })} multiline />
        </div>
      ))}
    </div>
  );
}

// ---------------- Footer ----------------

export function FooterEditor({ value, onChange }: EditorProps<"footer">) {
  const update = (patch: Partial<SalespageFooter>) =>
    onChange({ ...value, ...patch });
  const updateSection = (key: keyof SalespageFooter["sections"], v: string) =>
    update({ sections: { ...value.sections, [key]: v } });
  const updateLink = (key: string, v: string) =>
    update({ links: { ...value.links, [key]: v } });

  return (
    <div className="flex flex-col gap-4">
      <Field label="Copyright" value={value.copyright} onChange={(v) => update({ copyright: v })} multiline />
      <Field label="Company name" value={value.companyName} onChange={(v) => update({ companyName: v })} />
      <Field label="Terms notice" value={value.termsNotice} onChange={(v) => update({ termsNotice: v })} multiline />

      <div className={cardClass}>
        <h3 className="text-sm font-semibold text-gray-900">Section headings</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Members" value={value.sections.members} onChange={(v) => updateSection("members", v)} />
          <Field label="About app" value={value.sections.aboutApp} onChange={(v) => updateSection("aboutApp", v)} />
          <Field label="For business" value={value.sections.forBusiness} onChange={(v) => updateSection("forBusiness", v)} />
          <Field label="Legal" value={value.sections.legal} onChange={(v) => updateSection("legal", v)} />
        </div>
      </div>

      <div className={cardClass}>
        <h3 className="text-sm font-semibold text-gray-900">Link labels</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Object.entries(value.links).map(([key, linkValue]) => (
            <Field
              key={key}
              label={key}
              value={linkValue}
              onChange={(v) => updateLink(key, v)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- Pricing ----------------

const PLAN_KEYS = ["trial", "starter", "plus", "enterprise"] as const;
type PlanKey = (typeof PLAN_KEYS)[number];

export function PricingEditor({ value, onChange }: EditorProps<"pricing">) {
  const [activePlan, setActivePlan] = useState<PlanKey>("trial");
  const update = (patch: Partial<SalespagePricing>) =>
    onChange({ ...value, ...patch });
  const updatePlan = (plan: PlanKey, patch: Partial<SalespagePricingPlan>) =>
    update({ plans: { ...value.plans, [plan]: { ...value.plans[plan], ...patch } } });

  const plan = value.plans[activePlan];
  const addFeature = () => updatePlan(activePlan, { features: [...plan.features, ""] });
  const removeFeature = (i: number) =>
    updatePlan(activePlan, { features: plan.features.filter((_, idx) => idx !== i) });
  const updateFeature = (i: number, v: string) =>
    updatePlan(activePlan, {
      features: plan.features.map((f, idx) => (idx === i ? v : f)),
    });

  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading" value={value.heading} onChange={(v) => update({ heading: v })} />
      <Field label="Subtitle" value={value.subtitle} onChange={(v) => update({ subtitle: v })} />
      <Field label="Footnote" value={value.footnote} onChange={(v) => update({ footnote: v })} />
      <Field label="All features label" value={value.allFeatures} onChange={(v) => update({ allFeatures: v })} />

      <div className="mt-2 flex gap-1 rounded-lg bg-gray-100 p-1">
        {PLAN_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActivePlan(key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              activePlan === key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className={cardClass}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Name" value={plan.name} onChange={(v) => updatePlan(activePlan, { name: v })} />
          <Field label="Price" value={plan.price} onChange={(v) => updatePlan(activePlan, { price: v })} />
          <Field label="Period" value={plan.period} onChange={(v) => updatePlan(activePlan, { period: v })} />
          <Field label="Button label" value={plan.button} onChange={(v) => updatePlan(activePlan, { button: v })} />
        </div>

        <div className="mt-2 flex items-center justify-between">
          <h4 className="text-xs font-semibold text-gray-700">Features</h4>
          <button
            type="button"
            onClick={addFeature}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {plan.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => updateFeature(i, e.target.value)}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeFeature(i)}
                className="rounded-md p-2 text-red-600 hover:bg-red-50"
                aria-label="Remove feature"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- Metadata (SEO) ----------------

export function MetadataEditor({ value, onChange }: EditorProps<"metadata">) {
  const update = (patch: Partial<SalespageMetadata>) =>
    onChange({ ...value, ...patch });
  return (
    <div className="flex flex-col gap-4">
      <Field
        label="Page title (browser tab / search result)"
        value={value.title}
        onChange={(v) => update({ title: v })}
      />
      <Field
        label="Meta description (search snippet)"
        value={value.description}
        onChange={(v) => update({ description: v })}
        multiline
      />
    </div>
  );
}

// ---------------- Nav ----------------

const NAV_LABELS: Record<keyof SalespageNav, string> = {
  features: "Features",
  useCases: "Use Cases",
  compliance: "Compliance",
  plan: "Plan",
  articles: "Articles",
  documents: "Documents",
  register: "Register button",
};

export function NavEditor({ value, onChange }: EditorProps<"nav">) {
  const update = (key: keyof SalespageNav, v: string) =>
    onChange({ ...value, [key]: v });
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {(Object.keys(NAV_LABELS) as (keyof SalespageNav)[]).map((key) => (
        <Field
          key={key}
          label={NAV_LABELS[key]}
          value={value[key]}
          onChange={(v) => update(key, v)}
        />
      ))}
    </div>
  );
}

// ---------------- Video ----------------

export function VideoEditor({ value, onChange }: EditorProps<"video">) {
  const update = (patch: Partial<SalespageVideo>) =>
    onChange({ ...value, ...patch });
  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading" value={value.heading} onChange={(v) => update({ heading: v })} />
      <Field
        label="View use cases button"
        value={value.viewUseCases}
        onChange={(v) => update({ viewUseCases: v })}
      />
    </div>
  );
}

// ---------------- Partners ----------------

export function PartnersEditor({ value, onChange }: EditorProps<"partners">) {
  const update = (patch: Partial<SalespagePartners>) =>
    onChange({ ...value, ...patch });
  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading" value={value.heading} onChange={(v) => update({ heading: v })} />
      <Field
        label="Subtitle"
        value={value.subtitle}
        onChange={(v) => update({ subtitle: v })}
        multiline
      />
    </div>
  );
}

// ---------------- Features ----------------

const FEATURE_CARD_LABELS: Record<keyof SalespageFeatures["cards"], string> = {
  business: "Card — Business",
  developer: "Card — Developer",
  performance: "Card — Performance",
};

export function FeaturesEditor({ value, onChange }: EditorProps<"features">) {
  const update = (patch: Partial<SalespageFeatures>) =>
    onChange({ ...value, ...patch });
  const updateCard = (
    key: keyof SalespageFeatures["cards"],
    patch: Partial<SalespageFeatureCard>
  ) =>
    update({
      cards: { ...value.cards, [key]: { ...value.cards[key], ...patch } },
    });
  return (
    <div className="flex flex-col gap-4">
      <Field label="Heading" value={value.heading} onChange={(v) => update({ heading: v })} />
      <Field
        label="View use cases button"
        value={value.viewUseCases}
        onChange={(v) => update({ viewUseCases: v })}
      />
      {(Object.keys(FEATURE_CARD_LABELS) as (keyof SalespageFeatures["cards"])[]).map(
        (key) => {
          const card = value.cards[key];
          return (
            <div key={key} className={cardClass}>
              <h3 className="text-sm font-semibold text-gray-900">
                {FEATURE_CARD_LABELS[key]}
              </h3>
              <Field
                label="Title"
                value={card.title}
                onChange={(v) => updateCard(key, { title: v })}
              />
              <Field
                label="Description"
                value={card.description}
                onChange={(v) => updateCard(key, { description: v })}
                multiline
              />
              <Field
                label="Button label"
                value={card.button}
                onChange={(v) => updateCard(key, { button: v })}
              />
            </div>
          );
        }
      )}
    </div>
  );
}

// ---------------- Use Cases ----------------

const USECASE_LABELS: Record<keyof SalespageUseCases["cards"], string> = {
  card1: "Card 1",
  card2: "Card 2",
  card3: "Card 3",
};

export function UseCasesEditor({ value, onChange }: EditorProps<"useCases">) {
  const update = (patch: Partial<SalespageUseCases>) =>
    onChange({ ...value, ...patch });
  const updateCard = (
    key: keyof SalespageUseCases["cards"],
    patch: Partial<SalespageUseCaseCard>
  ) =>
    update({
      cards: { ...value.cards, [key]: { ...value.cards[key], ...patch } },
    });
  return (
    <div className="flex flex-col gap-4">
      <Field
        label="Heading (use \\n for line breaks)"
        value={value.heading}
        onChange={(v) => update({ heading: v })}
        multiline
      />
      <Field
        label="Subtitle"
        value={value.subtitle}
        onChange={(v) => update({ subtitle: v })}
      />
      {(Object.keys(USECASE_LABELS) as (keyof SalespageUseCases["cards"])[]).map(
        (key) => {
          const card = value.cards[key];
          return (
            <div key={key} className={cardClass}>
              <h3 className="text-sm font-semibold text-gray-900">
                {USECASE_LABELS[key]}
              </h3>
              <Field
                label="Title"
                value={card.title}
                onChange={(v) => updateCard(key, { title: v })}
              />
              <Field
                label="Description"
                value={card.description}
                onChange={(v) => updateCard(key, { description: v })}
                multiline
              />
            </div>
          );
        }
      )}
    </div>
  );
}

// ---------------- Documents ----------------

function PageFields({
  value,
  onChange,
}: {
  value: SalespageDocumentPage;
  onChange: (next: SalespageDocumentPage) => void;
}) {
  const update = (patch: Partial<SalespageDocumentPage>) =>
    onChange({ ...value, ...patch });
  const updateSection = (
    index: number,
    patch: Partial<SalespageDocsArticleSection>
  ) =>
    update({
      sections: value.sections.map((s, i) =>
        i === index ? { ...s, ...patch } : s
      ),
    });
  const addSection = () =>
    update({
      sections: [
        ...value.sections,
        { id: "", heading: "", body: "" },
      ],
    });
  const removeSection = (index: number) =>
    update({ sections: value.sections.filter((_, i) => i !== index) });

  return (
    <div className="flex flex-col gap-3">
      <Field
        label="Eyebrow (small label above title)"
        value={value.eyebrow}
        onChange={(v) => update({ eyebrow: v })}
      />
      <Field
        label="Title"
        value={value.title}
        onChange={(v) => update({ title: v })}
      />
      <Field
        label="Description"
        value={value.description}
        onChange={(v) => update({ description: v })}
        multiline
      />

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-700">Body sections</span>
        <button
          type="button"
          onClick={addSection}
          className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <Plus className="h-3.5 w-3.5" /> Add section
        </button>
      </div>
      {value.sections.map((section, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">#{i + 1}</span>
            <button
              type="button"
              onClick={() => removeSection(i)}
              className="rounded-md p-1 text-red-600 hover:bg-red-50"
              aria-label="Remove section"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <Field
            label="Anchor id (letters, dashes)"
            value={section.id}
            onChange={(v) => updateSection(i, { id: v })}
          />
          <Field
            label="Heading"
            value={section.heading}
            onChange={(v) => updateSection(i, { heading: v })}
          />
          <Field
            label="Body"
            value={section.body}
            onChange={(v) => updateSection(i, { body: v })}
            multiline
          />
        </div>
      ))}
    </div>
  );
}

const EMPTY_PAGE: SalespageDocumentPage = {
  eyebrow: "",
  title: "",
  description: "",
  sections: [],
};

const slugify = (raw: string) =>
  raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export function DocumentsEditor({ value, onChange }: EditorProps<"documents">) {
  const pages = value.pages ?? {};
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    __article__: true,
  });
  const toggle = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const update = (patch: Partial<SalespageDocuments>) =>
    onChange({ ...value, pages, ...patch });

  // ----- Sidebar helpers -----
  const updateSidebarSection = (
    index: number,
    patch: Partial<SalespageDocsSidebarSection>
  ) => {
    const sections = value.sidebar.sections.map((s, i) =>
      i === index ? { ...s, ...patch } : s
    );
    update({ sidebar: { sections } });
  };
  const addSidebarSection = () =>
    update({
      sidebar: {
        sections: [...value.sidebar.sections, { title: "", items: [] }],
      },
    });
  const removeSidebarSection = (index: number) =>
    update({
      sidebar: {
        sections: value.sidebar.sections.filter((_, i) => i !== index),
      },
    });
  const updateSidebarItem = (
    sectionIndex: number,
    itemIndex: number,
    patch: Partial<SalespageDocsSidebarItem>
  ) => {
    const section = value.sidebar.sections[sectionIndex];
    const items = section.items.map((it, i) =>
      i === itemIndex ? { ...it, ...patch } : it
    );
    updateSidebarSection(sectionIndex, { items });
  };
  const addSidebarItem = (sectionIndex: number) => {
    const section = value.sidebar.sections[sectionIndex];
    updateSidebarSection(sectionIndex, {
      items: [...section.items, { title: "", href: "" }],
    });
  };
  const removeSidebarItem = (sectionIndex: number, itemIndex: number) => {
    const section = value.sidebar.sections[sectionIndex];
    updateSidebarSection(sectionIndex, {
      items: section.items.filter((_, i) => i !== itemIndex),
    });
  };

  // ----- Pages helpers -----
  const setArticle = (next: SalespageDocumentPage) =>
    update({ article: next });
  const setPage = (slug: string, next: SalespageDocumentPage) =>
    update({ pages: { ...pages, [slug]: next } });
  const addPage = () => {
    const raw = typeof window === "undefined" ? "" : window.prompt("URL slug for the new page (e.g. quick-start)")?.trim() ?? "";
    const slug = slugify(raw);
    if (!slug) return;
    if (pages[slug]) {
      if (typeof window !== "undefined") window.alert(`Page "${slug}" already exists.`);
      return;
    }
    update({ pages: { ...pages, [slug]: { ...EMPTY_PAGE, title: slug } } });
    setExpanded((prev) => ({ ...prev, [slug]: true }));
  };
  const removePage = (slug: string) => {
    if (typeof window !== "undefined" && !window.confirm(`Delete page "${slug}"? This cannot be undone.`)) return;
    const next = { ...pages };
    delete next[slug];
    update({ pages: next });
  };
  const renamePage = (slug: string) => {
    if (typeof window === "undefined") return;
    const raw = window.prompt(`Rename slug "${slug}" to:`, slug)?.trim() ?? "";
    const next = slugify(raw);
    if (!next || next === slug) return;
    if (pages[next]) {
      window.alert(`Page "${next}" already exists.`);
      return;
    }
    const moved = { ...pages };
    moved[next] = moved[slug];
    delete moved[slug];
    update({ pages: moved });
  };

  // Slug integrity warnings
  const pageSlugs = new Set(Object.keys(pages));
  const allLinks = value.sidebar.sections.flatMap((s) => s.items.map((i) => i.href));
  const missingPageLinks = allLinks.filter(
    (href) => href !== "" && !pageSlugs.has(href)
  );
  const orphanPages = Object.keys(pages).filter(
    (slug) => !allLinks.includes(slug)
  );

  const sortedPageSlugs = Object.keys(pages).sort();

  return (
    <div className="flex flex-col gap-6">
      <div className={cardClass}>
        <h3 className="text-sm font-semibold text-gray-900">Page chrome</h3>
        <Field
          label="Search placeholder"
          value={value.search.placeholder}
          onChange={(v) => update({ search: { placeholder: v } })}
        />
        <Field
          label="Table of contents heading"
          value={value.toc.title}
          onChange={(v) => update({ toc: { title: v } })}
        />
      </div>

      {/* Sidebar */}
      <div className={cardClass}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Sidebar navigation</h3>
          <button
            type="button"
            onClick={addSidebarSection}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-3.5 w-3.5" /> Add section
          </button>
        </div>
        {value.sidebar.sections.map((section, si) => (
          <div key={si} className={cardClass}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Section #{si + 1}</span>
              <button
                type="button"
                onClick={() => removeSidebarSection(si)}
                className="rounded-md p-1 text-red-600 hover:bg-red-50"
                aria-label="Remove section"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <Field
              label="Section title"
              value={section.title}
              onChange={(v) => updateSidebarSection(si, { title: v })}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Links</span>
              <button
                type="button"
                onClick={() => addSidebarItem(si)}
                className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <Plus className="h-3.5 w-3.5" /> Add link
              </button>
            </div>
            {section.items.map((item, ii) => {
              const linkBroken =
                item.href !== "" && !pageSlugs.has(item.href);
              return (
                <div
                  key={ii}
                  className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 md:flex-row md:items-end md:gap-3"
                >
                  <div className="flex-1">
                    <Field
                      label="Link label"
                      value={item.title}
                      onChange={(v) => updateSidebarItem(si, ii, { title: v })}
                    />
                  </div>
                  <div className="flex-1">
                    <Field
                      label="URL slug (blank = landing)"
                      value={item.href}
                      onChange={(v) => updateSidebarItem(si, ii, { href: v })}
                    />
                    {linkBroken && (
                      <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-orange-700">
                        <AlertTriangle className="h-3 w-3" /> No page exists for
                        <code className="rounded bg-orange-100 px-1">/{item.href}</code>
                        — create it below.
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSidebarItem(si, ii)}
                    className="rounded-md p-2 text-red-600 hover:bg-red-50"
                    aria-label="Remove link"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Landing article */}
      <div className={cardClass}>
        <button
          type="button"
          onClick={() => toggle("__article__")}
          className="flex items-center justify-between"
        >
          <h3 className="text-sm font-semibold text-gray-900">
            Landing page{" "}
            <span className="ml-1 text-[11px] font-normal text-gray-500">
              /documents
            </span>
          </h3>
          {expanded.__article__ ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </button>
        {expanded.__article__ && (
          <PageFields value={value.article} onChange={setArticle} />
        )}
      </div>

      {/* Sub-pages */}
      <div className={cardClass}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            Sub-pages{" "}
            <span className="ml-1 text-[11px] font-normal text-gray-500">
              /documents/:slug
            </span>
          </h3>
          <button
            type="button"
            onClick={addPage}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" /> New page
          </button>
        </div>

        {missingPageLinks.length > 0 && (
          <div className="flex items-start gap-2 rounded-md border border-orange-200 bg-orange-50 p-2 text-xs text-orange-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div>
              Sidebar links to pages that don't exist yet:{" "}
              {missingPageLinks.map((s) => (
                <code
                  key={s}
                  className="mx-0.5 rounded bg-orange-100 px-1"
                >
                  {s}
                </code>
              ))}
              . Click “New page” to create them.
            </div>
          </div>
        )}

        {orphanPages.length > 0 && (
          <div className="flex items-start gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-2 text-xs text-yellow-800">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div>
              Pages not reachable from the sidebar:{" "}
              {orphanPages.map((s) => (
                <code
                  key={s}
                  className="mx-0.5 rounded bg-yellow-100 px-1"
                >
                  {s}
                </code>
              ))}
              . Add a sidebar link or delete them.
            </div>
          </div>
        )}

        {sortedPageSlugs.length === 0 ? (
          <p className="text-xs text-gray-500">
            No sub-pages yet. Click "New page" to add one.
          </p>
        ) : (
          sortedPageSlugs.map((slug) => {
            const page = pages[slug];
            const isOpen = !!expanded[slug];
            return (
              <div key={slug} className={cardClass}>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggle(slug)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-gray-900">
                        {page.title || <span className="text-gray-400">(untitled)</span>}
                      </div>
                      <div className="truncate text-[11px] text-gray-500">
                        /documents/{slug}
                      </div>
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => renamePage(slug)}
                      className="rounded-md px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-100"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => removePage(slug)}
                      className="rounded-md p-1 text-red-600 hover:bg-red-50"
                      aria-label="Delete page"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {isOpen && (
                  <PageFields
                    value={page}
                    onChange={(next) => setPage(slug, next)}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ---------------- JSON fallback ----------------

export function JsonEditor({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);

  const handleChange = (next: string) => {
    setText(next);
    try {
      const parsed = JSON.parse(next);
      onChange(parsed);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "invalid JSON");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-500">
        Structured form not yet available for this section — edit the JSON directly.
      </p>
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        rows={24}
        spellCheck={false}
        className={`font-mono text-xs ${inputClass}`}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
