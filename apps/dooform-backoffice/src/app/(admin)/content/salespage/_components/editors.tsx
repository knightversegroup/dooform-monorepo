"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
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

const slugify = (raw: string) =>
  raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0E00-\u0E7F-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const LANDING_KEY = "__landing__";

const EMPTY_PAGE: SalespageDocumentPage = {
  eyebrow: "",
  title: "",
  description: "",
  sections: [],
};

function PageFields({
  value,
  onChange,
}: {
  value: SalespageDocumentPage;
  onChange: (next: SalespageDocumentPage) => void;
}) {
  const update = (patch: Partial<SalespageDocumentPage>) =>
    onChange({ ...value, ...patch });

  const uniqueSlug = (base: string, excludeIndex: number) => {
    const root = slugify(base) || "section";
    let candidate = root;
    let n = 1;
    while (
      value.sections.some(
        (s, idx) => idx !== excludeIndex && s.id === candidate
      )
    ) {
      candidate = `${root}-${++n}`;
    }
    return candidate;
  };

  const updateSection = (
    index: number,
    patch: Partial<SalespageDocsArticleSection>
  ) =>
    update({
      sections: value.sections.map((s, i) =>
        i === index ? { ...s, ...patch } : s
      ),
    });

  const updateHeading = (index: number, heading: string) => {
    const section = value.sections[index];
    // Keep the anchor id in sync with the heading unless the admin has
    // customized it to something that no longer matches the old heading.
    const previousAuto = slugify(section.heading) || "section";
    const headingDrivenId =
      !section.id || section.id === previousAuto || section.id.startsWith(previousAuto + "-");
    if (headingDrivenId) {
      updateSection(index, { heading, id: uniqueSlug(heading, index) });
    } else {
      updateSection(index, { heading });
    }
  };

  const addSection = () =>
    update({
      sections: [
        ...value.sections,
        { id: uniqueSlug("section", -1), heading: "", body: "" },
      ],
    });

  const removeSection = (index: number) =>
    update({ sections: value.sections.filter((_, i) => i !== index) });

  return (
    <div className="flex flex-col gap-4">
      <Field
        label="Small label above title (optional)"
        value={value.eyebrow}
        onChange={(v) => update({ eyebrow: v })}
      />
      <Field
        label="Page title"
        value={value.title}
        onChange={(v) => update({ title: v })}
      />
      <Field
        label="Short description (one or two sentences)"
        value={value.description}
        onChange={(v) => update({ description: v })}
        multiline
      />

      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">Body</span>
          <button
            type="button"
            onClick={addSection}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" /> Add heading + text
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Break the body into short headings with a paragraph under each. These become the right-side table of contents.
        </p>

        {value.sections.length === 0 ? (
          <p className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-xs text-gray-500">
            No body yet. Click "Add heading + text" to start.
          </p>
        ) : (
          value.sections.map((section, i) => (
            <div
              key={i}
              className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">
                  {i + 1}.
                </span>
                <button
                  type="button"
                  onClick={() => removeSection(i)}
                  className="rounded-md p-1 text-red-600 hover:bg-red-50"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <Field
                label="Heading"
                value={section.heading}
                onChange={(v) => updateHeading(i, v)}
              />
              <Field
                label="Text"
                value={section.body}
                onChange={(v) => updateSection(i, { body: v })}
                multiline
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function DocumentsEditor({ value, onChange }: EditorProps<"documents">) {
  const pages = value.pages ?? {};
  const [selected, setSelected] = useState<string>(LANDING_KEY);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const update = (patch: Partial<SalespageDocuments>) =>
    onChange({ ...value, pages, ...patch });

  // When a page is added / renamed / deleted, keep sidebar links in sync so
  // the admin never has to think about hrefs.
  const syncSidebar = (
    op:
      | { kind: "add"; slug: string; title: string }
      | { kind: "rename"; from: string; to: string; title: string }
      | { kind: "delete"; slug: string }
  ): SalespageDocsSidebarSection[] => {
    const sections = value.sidebar.sections.map((s) => ({ ...s, items: [...s.items] }));
    if (op.kind === "add") {
      const target = sections[sections.length - 1];
      if (target) {
        target.items.push({ title: op.title, href: op.slug });
      } else {
        sections.push({
          title: "Documents",
          items: [{ title: op.title, href: op.slug }],
        });
      }
    } else if (op.kind === "rename") {
      for (const s of sections) {
        for (const it of s.items) {
          if (it.href === op.from) {
            it.href = op.to;
            it.title = op.title || it.title;
          }
        }
      }
    } else if (op.kind === "delete") {
      for (const s of sections) {
        s.items = s.items.filter((it) => it.href !== op.slug);
      }
    }
    return sections;
  };

  const addPage = () => {
    if (typeof window === "undefined") return;
    const title = window.prompt("What's the page title?")?.trim();
    if (!title) return;
    let slug = slugify(title);
    if (!slug) slug = `page-${Date.now().toString(36)}`;
    let unique = slug;
    let n = 1;
    while (pages[unique]) unique = `${slug}-${++n}`;
    update({
      pages: { ...pages, [unique]: { ...EMPTY_PAGE, title } },
      sidebar: {
        sections: syncSidebar({ kind: "add", slug: unique, title }),
      },
    });
    setSelected(unique);
  };

  const deletePage = (slug: string) => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Delete "${pages[slug]?.title || slug}"?`)
    ) {
      return;
    }
    const nextPages = { ...pages };
    delete nextPages[slug];
    update({
      pages: nextPages,
      sidebar: { sections: syncSidebar({ kind: "delete", slug }) },
    });
    setSelected(LANDING_KEY);
  };

  const renamePage = (slug: string) => {
    if (typeof window === "undefined") return;
    const newTitle = window.prompt("New page title:", pages[slug]?.title ?? "")?.trim();
    if (!newTitle) return;
    const newSlug = slugify(newTitle);
    if (!newSlug) return;
    let unique = newSlug;
    let n = 1;
    while (unique !== slug && pages[unique]) unique = `${newSlug}-${++n}`;
    const moved = { ...pages };
    moved[unique] = { ...moved[slug], title: newTitle };
    if (unique !== slug) delete moved[slug];
    update({
      pages: moved,
      sidebar: {
        sections:
          unique === slug
            ? syncSidebar({ kind: "rename", from: slug, to: slug, title: newTitle })
            : syncSidebar({ kind: "rename", from: slug, to: unique, title: newTitle }),
      },
    });
    setSelected(unique);
  };

  const sortedSlugs = Object.keys(pages).sort((a, b) =>
    (pages[a].title || a).localeCompare(pages[b].title || b)
  );

  const isLanding = selected === LANDING_KEY;
  const selectedPage = isLanding ? value.article : pages[selected];
  const setSelectedPage = (next: SalespageDocumentPage) => {
    if (isLanding) {
      update({ article: next });
    } else {
      update({ pages: { ...pages, [selected]: next } });
    }
  };

  // Fall back to landing if selected slug disappears (e.g. after delete).
  const effectivePage = selectedPage ?? value.article;
  const effectiveIsLanding = !selectedPage || isLanding;

  return (
    <div className="flex flex-col gap-6">
      {/* Page picker */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Which page are you editing?
            </h3>
            <p className="text-xs text-gray-500">
              The landing page is the main /documents page. Sub-pages are the links in the sidebar.
            </p>
          </div>
          <button
            type="button"
            onClick={addPage}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" /> New page
          </button>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <select
            value={effectiveIsLanding ? LANDING_KEY : selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 md:flex-1"
          >
            <option value={LANDING_KEY}>
              Landing page · /documents
            </option>
            {sortedSlugs.map((slug) => (
              <option key={slug} value={slug}>
                {pages[slug].title || slug} · /documents/{slug}
              </option>
            ))}
          </select>

          {!effectiveIsLanding && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => renamePage(selected)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Rename
              </button>
              <button
                type="button"
                onClick={() => deletePage(selected)}
                className="rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Selected page editor */}
      <div className="flex flex-col gap-2 border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">
            {effectiveIsLanding ? "Landing page" : effectivePage.title || "Untitled page"}
          </h3>
          <span className="text-xs text-gray-500">
            /documents{effectiveIsLanding ? "" : `/${selected}`}
          </span>
        </div>
        <PageFields value={effectivePage} onChange={setSelectedPage} />
      </div>

      {/* Advanced */}
      <div className="flex flex-col border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-gray-900"
        >
          {showAdvanced ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
          Advanced: sidebar order, search placeholder
        </button>

        {showAdvanced && (
          <div className="mt-4 flex flex-col gap-6">
            <div className={cardClass}>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Page chrome
              </h4>
              <Field
                label="Search box placeholder"
                value={value.search.placeholder}
                onChange={(v) => update({ search: { placeholder: v } })}
              />
              <Field
                label="Right-side TOC heading"
                value={value.toc.title}
                onChange={(v) => update({ toc: { title: v } })}
              />
            </div>

            <AdvancedSidebar value={value} update={update} />
          </div>
        )}
      </div>
    </div>
  );
}

function AdvancedSidebar({
  value,
  update,
}: {
  value: SalespageDocuments;
  update: (patch: Partial<SalespageDocuments>) => void;
}) {
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

  return (
    <div className={cardClass}>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Sidebar groups
          </h4>
          <p className="mt-1 text-xs text-gray-500">
            Pages added above appear here automatically. Use this to reorder or regroup them.
          </p>
        </div>
        <button
          type="button"
          onClick={addSidebarSection}
          className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <Plus className="h-3.5 w-3.5" /> Add group
        </button>
      </div>

      {value.sidebar.sections.map((section, si) => (
        <div
          key={si}
          className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 p-3"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={section.title}
              placeholder="Group title"
              onChange={(e) => updateSidebarSection(si, { title: e.target.value })}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => removeSidebarSection(si)}
              className="rounded-md p-2 text-red-600 hover:bg-red-50"
              aria-label="Remove group"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {section.items.map((item, ii) => (
            <div key={ii} className="flex items-center gap-2">
              <input
                type="text"
                value={item.title}
                placeholder="Link label"
                onChange={(e) => updateSidebarItem(si, ii, { title: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                value={item.href}
                placeholder="slug"
                onChange={(e) => updateSidebarItem(si, ii, { href: e.target.value })}
                className={`${inputClass} max-w-[180px]`}
              />
              <button
                type="button"
                onClick={() => removeSidebarItem(si, ii)}
                className="rounded-md p-2 text-red-600 hover:bg-red-50"
                aria-label="Remove link"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addSidebarItem(si)}
            className="self-start rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus className="inline h-3 w-3" /> Add link
          </button>
        </div>
      ))}
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
