import { Typography } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';
import {
  FileText,
  Upload,
  ScanLine,
  Link2,
  Globe,
  CheckCircle2,
  Star,
  Shield,
  Clock,
  Users,
  Zap,
  BarChart3,
} from 'lucide-react';

type FeatureHighlightCard = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
};

export type FeaturesHighlightDict = {
  badge: string;
  heading: string;
  subtitle: string;
  cards: {
    card1: FeatureHighlightCard;
    card2: FeatureHighlightCard;
  };
};

/* ── Preview mockup: Document Collection ── */

function DocumentCollectionPreview() {
  const channels = [
    { icon: FileText, label: 'Forms', color: 'bg-blue-500' },
    { icon: Upload, label: 'Upload', color: 'bg-emerald-500' },
    { icon: ScanLine, label: 'OCR Scan', color: 'bg-amber-500' },
    { icon: Link2, label: 'API', color: 'bg-violet-500' },
    { icon: Globe, label: 'Web', color: 'bg-rose-500' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Channel icons row */}
      <div className="flex items-center justify-center gap-3">
        {channels.map((ch) => (
          <div key={ch.label} className="flex flex-col items-center gap-1.5">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${ch.color} text-white shadow-sm`}
            >
              <ch.icon size={20} />
            </div>
            <span className="text-[10px] font-medium text-[#737373]">
              {ch.label}
            </span>
          </div>
        ))}
      </div>

      {/* Document submission card */}
      <div className="rounded-xl border border-[#e5e0da] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#262626]">
          <FileText size={16} className="text-blue-500" />
          Submit document for processing
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-[#e5e0da] px-3 py-2.5">
            <span className="text-xs text-[#999]">Document ID :</span>
            <span className="font-mono text-sm tracking-widest text-[#262626]">
              DF-2026-00482
            </span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="text-xs text-[#737373]">
              Auto-classified as: Government Form
            </span>
          </div>
        </div>

        <button className="mt-4 w-full rounded-lg bg-[#0d4b3b] py-2.5 text-sm font-semibold text-white">
          Process now
        </button>
      </div>
    </div>
  );
}

/* ── Preview mockup: Smart Processing ── */

function SmartProcessingPreview() {
  return (
    <div className="flex flex-col gap-4">
      {/* User profile card */}
      <div className="rounded-xl border border-[#e5e0da] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-violet-500 text-sm font-bold text-white">
              DF
            </div>
            <div>
              <div className="text-sm font-semibold text-[#262626]">
                Dooform Workspace
              </div>
              <div className="text-xs text-[#999]">team@dooform.com</div>
            </div>
          </div>
          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
            PRO
          </span>
        </div>

        {/* Stats */}
        <div className="mt-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 p-4">
          <div className="text-[10px] font-medium uppercase tracking-wider text-amber-600">
            Documents processed
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[#262626]">1,248</span>
            <Star size={16} className="text-amber-500" fill="#f59e0b" />
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700">
              Starter plan
            </span>
            <span className="text-[10px] text-[#999]">Since Jan 2026</span>
          </div>
        </div>

        {/* Benefits list */}
        <div className="mt-4 space-y-2">
          <div className="text-[10px] font-medium uppercase tracking-wider text-[#999]">
            Benefits
          </div>
          {[
            { icon: Zap, text: 'AI auto-classification', active: true },
            { icon: Users, text: 'Up to 10 team members', active: true },
            { icon: Shield, text: 'Enterprise security', active: true },
            { icon: BarChart3, text: 'Advanced analytics', active: false },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2">
              <item.icon
                size={13}
                className={item.active ? 'text-emerald-500' : 'text-[#ccc]'}
              />
              <span
                className={`text-xs ${item.active ? 'text-[#4d4d4d]' : 'text-[#ccc]'}`}
              >
                {item.text}
              </span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-4 rounded-lg border border-[#f0ece6] p-3">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#737373]">774 pts to Plus</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#f0ece6]">
            <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main section ── */

export default function FeaturesHighlightSection({
  dict,
}: {
  dict: FeaturesHighlightDict;
}) {
  const previews = [DocumentCollectionPreview, SmartProcessingPreview];
  const cards = [dict.cards.card1, dict.cards.card2];

  return (
    <Section padding="lg">
      <Container>
        {/* Badge */}
        <div className="mb-6 flex justify-center">
          <span className="rounded-full border border-[#e5e0da] bg-white px-5 py-2 text-sm font-medium text-[#737373] shadow-sm">
            {dict.badge}
          </span>
        </div>

        {/* Heading */}
        <Typography variant="h2" className="text-center">
          {dict.heading}
        </Typography>
        <Typography
          variant="body"
          className="mx-auto mt-4 max-w-xl text-center"
        >
          {dict.subtitle}
        </Typography>

        {/* Cards */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-2">
          {cards.map((card, i) => {
            const Preview = previews[i];
            return (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-2xl bg-[#f5f0ea]"
              >
                {/* Text content */}
                <div className="p-6 md:p-8">
                  <span className="text-xs font-medium uppercase tracking-wider text-[#737373]">
                    {card.eyebrow}
                  </span>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#262626] md:text-3xl">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#737373] md:text-base">
                    {card.description}
                  </p>
                </div>

                {/* Native preview */}
                <div className="mt-auto px-6 pb-6 md:px-8 md:pb-8">
                  <Preview />
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
