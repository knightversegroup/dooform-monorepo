"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { apiClient } from "@dooform/shared/api/client";
import {
  SALESPAGE_SECTION_KEYS,
  type SalespageDict,
  type SalespageLocale,
  type SalespageSectionKey,
} from "@dooform/shared";
import {
  FaqEditor,
  FooterEditor,
  HeroEditor,
  JsonEditor,
  PricingEditor,
  TrialEditor,
} from "./_components/editors";

const LOCALES: { key: SalespageLocale; label: string }[] = [
  { key: "en", label: "English" },
  { key: "th", label: "ไทย" },
];

type SaveState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved"; at: number }
  | { kind: "error"; message: string };

const SECTION_LABELS: Record<SalespageSectionKey, string> = {
  metadata: "Metadata (SEO)",
  nav: "Navigation",
  hero: "Hero",
  features: "Features",
  useCases: "Use Cases",
  pricing: "Pricing",
  video: "Video",
  partners: "Partners",
  faq: "FAQ",
  documents: "Documents",
  trial: "Trial / Signup",
  footer: "Footer",
};

export default function SalespageContentPage() {
  const [locale, setLocale] = useState<SalespageLocale>("en");
  const [dict, setDict] = useState<SalespageDict | null>(null);
  const [activeSection, setActiveSection] =
    useState<SalespageSectionKey>("hero");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [save, setSave] = useState<SaveState>({ kind: "idle" });
  const [dirty, setDirty] = useState<Partial<Record<SalespageSectionKey, true>>>(
    {}
  );

  const load = useCallback(async (which: SalespageLocale) => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await apiClient.getSalespageContent(which);
      setDict(data);
      setDirty({});
    } catch (err) {
      setDict(null);
      setLoadError(
        err instanceof Error ? err.message : "failed to load salespage content"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(locale);
  }, [locale, load]);

  const setSection = <K extends SalespageSectionKey>(
    key: K,
    value: SalespageDict[K]
  ) => {
    setDict((prev) => (prev ? { ...prev, [key]: value } : prev));
    setDirty((prev) => ({ ...prev, [key]: true }));
    setSave({ kind: "idle" });
  };

  const saveSection = async (key: SalespageSectionKey) => {
    if (!dict) return;
    setSave({ kind: "saving" });
    try {
      await apiClient.patchSalespageSection(locale, key, dict[key]);
      setDirty((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setSave({ kind: "saved", at: Date.now() });
    } catch (err) {
      setSave({
        kind: "error",
        message: err instanceof Error ? err.message : "save failed",
      });
    }
  };

  const saveAll = async () => {
    if (!dict) return;
    setSave({ kind: "saving" });
    try {
      await apiClient.putSalespageContent(locale, dict);
      setDirty({});
      setSave({ kind: "saved", at: Date.now() });
    } catch (err) {
      setSave({
        kind: "error",
        message: err instanceof Error ? err.message : "save failed",
      });
    }
  };

  const editor = useMemo(() => {
    if (!dict) return null;
    switch (activeSection) {
      case "hero":
        return (
          <HeroEditor
            value={dict.hero}
            onChange={(v) => setSection("hero", v)}
          />
        );
      case "pricing":
        return (
          <PricingEditor
            value={dict.pricing}
            onChange={(v) => setSection("pricing", v)}
          />
        );
      case "faq":
        return (
          <FaqEditor value={dict.faq} onChange={(v) => setSection("faq", v)} />
        );
      case "trial":
        return (
          <TrialEditor
            value={dict.trial}
            onChange={(v) => setSection("trial", v)}
          />
        );
      case "footer":
        return (
          <FooterEditor
            value={dict.footer}
            onChange={(v) => setSection("footer", v)}
          />
        );
      default:
        return (
          <JsonEditor
            key={`${locale}:${activeSection}`}
            value={dict[activeSection]}
            onChange={(v) =>
              setSection(
                activeSection,
                v as SalespageDict[typeof activeSection]
              )
            }
          />
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dict, activeSection, locale]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Salespage Content</h1>
          <p className="text-sm text-gray-500">
            Edit the marketing site copy. Changes go live within ~1 minute.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-gray-100 p-1">
            {LOCALES.map((l) => (
              <button
                key={l.key}
                type="button"
                onClick={() => setLocale(l.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  locale === l.key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={saveAll}
            disabled={!dict || save.kind === "saving"}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" /> Save all
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : loadError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Failed to load:</strong> {loadError}
          <button
            type="button"
            onClick={() => load(locale)}
            className="ml-3 rounded-md border border-red-300 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      ) : dict ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
          <nav className="flex flex-col gap-0.5 md:sticky md:top-20 md:self-start">
            {SALESPAGE_SECTION_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSection(key)}
                className={`flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                  activeSection === key
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{SECTION_LABELS[key]}</span>
                {dirty[key] && (
                  <span className="ml-2 h-1.5 w-1.5 rounded-full bg-orange-500" />
                )}
              </button>
            ))}
          </nav>

          <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h2 className="text-base font-semibold text-gray-900">
                {SECTION_LABELS[activeSection]}
              </h2>
              <div className="flex items-center gap-3">
                <SaveStatus state={save} />
                <button
                  type="button"
                  onClick={() => saveSection(activeSection)}
                  disabled={!dirty[activeSection] || save.kind === "saving"}
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:bg-gray-300"
                >
                  <Save className="h-3.5 w-3.5" /> Save section
                </button>
              </div>
            </div>
            {editor}
          </section>
        </div>
      ) : null}
    </div>
  );
}

function SaveStatus({ state }: { state: SaveState }) {
  if (state.kind === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
      </span>
    );
  }
  if (state.kind === "saved") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600">
        <CheckCircle2 className="h-3.5 w-3.5" /> Saved
      </span>
    );
  }
  if (state.kind === "error") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-600">
        <AlertCircle className="h-3.5 w-3.5" /> {state.message}
      </span>
    );
  }
  return null;
}
