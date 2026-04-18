"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type {
  SalespageDict,
  SalespageFaq,
  SalespageFaqItem,
  SalespageFooter,
  SalespageHero,
  SalespagePricing,
  SalespagePricingPlan,
  SalespageTrial,
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
