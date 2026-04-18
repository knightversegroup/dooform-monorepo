"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Save, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { apiClient } from "@dooform/shared/api/client";
import {
  SALESPAGE_SECTION_KEYS,
  type SalespageDict,
  type SalespageLocale,
  type SalespageSectionKey,
} from "@dooform/shared";
import {
  DocumentsEditor,
  FaqEditor,
  FeaturesEditor,
  FooterEditor,
  HeroEditor,
  MetadataEditor,
  NavEditor,
  PartnersEditor,
  PricingEditor,
  TrialEditor,
  UseCasesEditor,
  VideoEditor,
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

const SECTION_HELP: Record<SalespageSectionKey, string> = {
  metadata: "Browser tab title and the description search engines show under your link.",
  nav: "Links in the top navigation bar (Features, Use Cases, Compliance, …).",
  hero: "The big banner at the very top of the homepage.",
  features: "The “What can Dooform do?” block with three cards.",
  useCases: "The dark navy strip with three overlapping cards about who it's for.",
  pricing: "The pricing table — four plans (Trial, Starter, Plus, Enterprise).",
  video: "The heading and button for the how-it-works video block.",
  partners: "The “Trusted by leading organizations” strip.",
  faq: "The FAQ block on the homepage. Add or remove items as needed.",
  documents: "The /documents page — left sidebar, article body, and right TOC.",
  trial: "The sign-up form at the bottom of the homepage (labels and placeholders).",
  footer: "Copyright, section headings, and all link labels in the footer.",
};

const SECTION_PREVIEW_PATH: Partial<Record<SalespageSectionKey, string>> = {
  documents: "/documents",
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
      case "metadata":
        return (
          <MetadataEditor
            value={dict.metadata}
            onChange={(v) => setSection("metadata", v)}
          />
        );
      case "nav":
        return (
          <NavEditor value={dict.nav} onChange={(v) => setSection("nav", v)} />
        );
      case "hero":
        return (
          <HeroEditor
            value={dict.hero}
            onChange={(v) => setSection("hero", v)}
          />
        );
      case "features":
        return (
          <FeaturesEditor
            value={dict.features}
            onChange={(v) => setSection("features", v)}
          />
        );
      case "useCases":
        return (
          <UseCasesEditor
            value={dict.useCases}
            onChange={(v) => setSection("useCases", v)}
          />
        );
      case "pricing":
        return (
          <PricingEditor
            value={dict.pricing}
            onChange={(v) => setSection("pricing", v)}
          />
        );
      case "video":
        return (
          <VideoEditor
            value={dict.video}
            onChange={(v) => setSection("video", v)}
          />
        );
      case "partners":
        return (
          <PartnersEditor
            value={dict.partners}
            onChange={(v) => setSection("partners", v)}
          />
        );
      case "faq":
        return (
          <FaqEditor value={dict.faq} onChange={(v) => setSection("faq", v)} />
        );
      case "documents":
        return (
          <DocumentsEditor
            value={dict.documents}
            onChange={(v) => setSection("documents", v)}
          />
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
            <div className="flex flex-col gap-2 border-b border-gray-200 pb-3">
              <div className="flex items-center justify-between">
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
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-gray-500">
                  {SECTION_HELP[activeSection]}
                </p>
                <PreviewLink
                  locale={locale}
                  path={SECTION_PREVIEW_PATH[activeSection] ?? "/"}
                />
              </div>
            </div>
            {editor}
          </section>
        </div>
      ) : null}
    </div>
  );
}

function PreviewLink({ locale, path }: { locale: SalespageLocale; path: string }) {
  const base =
    process.env.NEXT_PUBLIC_SALESPAGE_URL ?? "https://www.dooform.com";
  const href = `${base}/${locale}${path === "/" ? "" : path}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-blue-600 hover:text-blue-700"
    >
      Preview live <ExternalLink className="h-3 w-3" />
    </a>
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
