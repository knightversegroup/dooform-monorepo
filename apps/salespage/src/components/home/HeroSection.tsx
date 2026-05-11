import {
  Award,
  BadgeCheck,
  Building2,
  FileText,
  Globe,
  Lock,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Typography } from '@dooform/ui';

type HeroDict = {
  trustBadge: string;
  headingLine1: string;
  headingLine2: string;
  headingLine3: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  socialProofValue: string;
  socialProofLabel: string;
  imageAlt: string;
};

/* Hero-only accent color is Tailwind `blue-600` (#2563eb) with `blue-700`
 * (#1d4ed8) on hover — applied via utility classes throughout. */

/* Floating chips along the left side of the hero photo — feature highlights. */
type FeatureChip = {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  /* Tailwind absolute positioning — written as literals so the content
   * scanner sees them. */
  position: string;
};

const FEATURE_CHIPS: readonly FeatureChip[] = [
  {
    icon: Sparkles,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    title: 'AI + Human Review',
    subtitle: 'แปลด้วย AI ตรวจโดยผู้เชี่ยวชาญ',
    position: 'left-[2%] top-[8%]',
  },
  {
    icon: ShieldCheck,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    title: 'Verified Translation',
    subtitle: 'รับรองความถูกต้อง',
    position: 'left-[6%] top-[28%]',
  },
  {
    icon: Building2,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    title: 'Embassy Ready',
    subtitle: 'ใช้ยื่นได้ในต่างประเทศ',
    position: 'left-[3%] top-[50%]',
  },
  {
    icon: Lock,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    title: 'Secure Upload',
    subtitle: 'เข้ารหัสข้อมูล ปลอดภัย 100%',
    position: 'left-[7%] top-[72%]',
  },
];

/* Document type chips along the right side — what kinds of docs we handle. */
type DocumentChip = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  position: string;
};

const DOCUMENT_CHIPS: readonly DocumentChip[] = [
  { icon: BadgeCheck, title: 'บัตรประชาชน', subtitle: 'ID CARD', position: 'right-[2%] top-[10%]' },
  { icon: FileText, title: 'ทะเบียนบ้าน', subtitle: 'HOUSE REGISTRATION', position: 'right-[5%] top-[32%]' },
  { icon: Building2, title: 'หนังสือรับรองบริษัท', subtitle: 'COMPANY CERTIFICATE', position: 'right-[3%] top-[54%]' },
  { icon: Award, title: 'ทรานสคริปต์', subtitle: 'TRANSCRIPT', position: 'right-[6%] top-[76%]' },
];

/* Trust strip below the hero — 4 reassurance pills. */
type TrustItem = {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
};

const TRUST_ITEMS: readonly TrustItem[] = [
  {
    icon: FileText,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    title: 'รองรับเอกสารราชการไทย',
    subtitle: 'หลากหลายประเภท',
  },
  {
    icon: Globe,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    title: 'ใช้งานสำหรับวีซ่า',
    subtitle: 'และต่างประเทศ',
  },
  {
    icon: BadgeCheck,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    title: 'จัดรูปแบบเอกสาร',
    subtitle: 'อย่างเป็นทางการ',
  },
  {
    icon: Users,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    title: 'AI + Human Review',
    subtitle: 'แม่นยำ เชื่อถือได้',
  },
];

/* Avatar palette for the social-proof stack — solid colour discs with
 * initials substitute for real customer photos. */
const AVATARS = [
  { initials: 'TS', bg: 'bg-rose-400' },
  { initials: 'KW', bg: 'bg-amber-400' },
  { initials: 'NP', bg: 'bg-emerald-400' },
  { initials: 'AR', bg: 'bg-sky-400' },
];

export default function HeroSection({ dict }: { dict: HeroDict }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#eef4ff] via-[#f5f8ff] to-white">
      {/* Soft network/sphere background suggestion — pure CSS, no SVG asset. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.12),transparent_55%)]"
      />

      <div className="relative mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-10 px-6 pb-16 pt-12 md:grid-cols-2 md:items-center md:gap-12 md:pb-20 md:pt-16">
        {/* ── Left column: copy + CTAs ──────────────────────────── */}
        <div className="flex flex-col items-start gap-6">
          {/* Trust badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <Typography
              as="span"
              variant="body-sm"
              weight="medium"
              tone="inherit"
              className="text-slate-800"
            >
              {dict.trustBadge}
            </Typography>
          </span>

          {/* 3-line heading with blue accent on line 2 */}
          <Typography
            variant="display-xl"
            as="h1"
            tone="inherit"
            className="text-slate-900"
          >
            {dict.headingLine1}
            <br />
            <span className="text-blue-600">{dict.headingLine2}</span>
            <br />
            {dict.headingLine3}
          </Typography>

          {/* Subtitle */}
          <Typography variant="lead" tone="inherit" className="max-w-xl text-slate-600">
            {dict.subtitle}
          </Typography>

          {/* CTAs */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a
              href="#trial"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              <FileText className="h-4 w-4" />
              <Typography as="span" variant="body" weight="semibold" tone="inverse">
                {dict.primaryCta}
              </Typography>
            </a>
            <a
              href="/templates"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-blue-600 bg-white px-6 py-3 text-blue-600 transition-colors hover:bg-blue-50"
            >
              <Sparkles className="h-4 w-4" />
              <Typography as="span" variant="body" weight="semibold" tone="inherit">
                {dict.secondaryCta}
              </Typography>
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {AVATARS.map((a) => (
                <div
                  key={a.initials}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white ring-1 ring-black/5 ${a.bg}`}
                >
                  <Typography as="span" variant="micro" weight="bold" tone="inverse">
                    {a.initials}
                  </Typography>
                </div>
              ))}
            </div>
            <div>
              <Typography variant="body-sm" weight="semibold" tone="inherit" className="block text-slate-900">
                {dict.socialProofValue}
              </Typography>
              <Typography variant="caption" tone="inherit" className="block text-slate-500">
                {dict.socialProofLabel}
              </Typography>
            </div>
          </div>
        </div>

        {/* ── Right column: photo + floating chips ──────────────── */}
        <div className="relative">
          {/* The hero photo lives in its own aspect-locked frame. The source
           * PNG is landscape (1000×667) but the design wants a portrait
           * presence, so the wrapper is portrait + `object-cover` to crop
           * the empty side margins of the source while keeping the man
           * filling the full frame height. `object-top` anchors his head
           * to the top so we crop the empty white space at the bottom of
           * the source instead of cropping his face. */}
          <div className="relative mx-auto aspect-[5/6] w-full max-w-[600px]">
            <img
              src="/images/presenter.png"
              alt={dict.imageAlt}
              className="absolute inset-0 h-full w-full object-cover object-top"
            />

            {/* Floating feature chips — desktop only, decorative. */}
            <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
              {FEATURE_CHIPS.map((chip) => {
                const Icon = chip.icon;
                return (
                  <div
                    key={chip.title}
                    className={`absolute flex items-center gap-2 whitespace-nowrap rounded-xl border border-blue-100 bg-white/95 py-2 pl-2 pr-3 shadow-[0_8px_24px_-8px_rgba(37,99,235,0.25)] backdrop-blur-sm ${chip.position}`}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${chip.iconBg}`}>
                      <Icon className={`h-4 w-4 ${chip.iconColor}`} strokeWidth={2.5} />
                    </span>
                    <div className="flex flex-col">
                      <Typography as="span" variant="caption" weight="semibold" tone="inherit" className="text-slate-900">
                        {chip.title}
                      </Typography>
                      <Typography as="span" variant="micro" tone="inherit" className="text-slate-500">
                        {chip.subtitle}
                      </Typography>
                    </div>
                  </div>
                );
              })}

              {/* Document-type chips on the right. */}
              {DOCUMENT_CHIPS.map((chip) => {
                const Icon = chip.icon;
                return (
                  <div
                    key={chip.title}
                    className={`absolute flex items-center gap-2 whitespace-nowrap rounded-xl border border-blue-100 bg-white/95 py-2 pl-2 pr-3 shadow-[0_8px_24px_-8px_rgba(37,99,235,0.25)] backdrop-blur-sm ${chip.position}`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                      <Icon className="h-4 w-4 text-blue-600" strokeWidth={2.5} />
                    </span>
                    <div className="flex flex-col">
                      <Typography as="span" variant="caption" weight="semibold" tone="inherit" className="text-slate-900">
                        {chip.title}
                      </Typography>
                      <Typography as="span" variant="micro" tone="inherit" className="text-slate-500 uppercase [letter-spacing:0.05em]">
                        {chip.subtitle}
                      </Typography>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust strip ─────────────────────────────────────────── */}
      <div className="relative mx-auto mb-10 max-w-[1280px] px-6 md:mb-14">
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-4 shadow-[0_4px_24px_rgba(37,99,235,0.08)] md:grid-cols-4 md:gap-2 md:px-6 md:py-5">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
                  <Icon className={`h-5 w-5 ${item.iconColor}`} strokeWidth={2.5} />
                </span>
                <div className="flex min-w-0 flex-col">
                  <Typography
                    as="span"
                    variant="body-sm"
                    weight="semibold"
                    tone="inherit"
                    className="truncate text-slate-900"
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    as="span"
                    variant="caption"
                    tone="inherit"
                    className="truncate text-slate-500"
                  >
                    {item.subtitle}
                  </Typography>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
