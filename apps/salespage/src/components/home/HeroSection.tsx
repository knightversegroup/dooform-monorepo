import {
  FileText,
  PenLine,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Button, Typography } from '@dooform/ui';

type HeroDict = {
  heading: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  bento?: {
    topRight: string;
    bottomLeft: string;
    bottomCenter: string;
    bottomRight: string;
  };
};

/* Floating feature chips arranged around the hero copy. Each chip names a
 * Dooform value prop, reinforcing what the product does without competing
 * with the workspace screenshot below. Class strings are written as
 * literals (not interpolated) so Tailwind's content scanner picks them up. */
type FloatingChip = {
  icon: LucideIcon;
  label: string;
  /* Background tint behind the icon — paired with `iconColor`. */
  iconBg: string;
  iconColor: string;
  /* Tailwind absolute positioning. */
  position: string;
  /* Bob duration + start delay; varied per chip so they never sync up. */
  duration: string;
  delay: string;
};

const FLOATING_CHIPS: readonly FloatingChip[] = [
  {
    icon: FileText,
    label: 'เทมเพลตพร้อมใช้',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    position: 'left-[2%] top-[18%]',
    duration: '4.2s',
    delay: '0s',
  },
  {
    icon: PenLine,
    label: 'เซ็นต์ออนไลน์',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    position: 'left-[6%] top-[48%]',
    duration: '5.1s',
    delay: '-1.4s',
  },
  {
    icon: ShieldCheck,
    label: 'ปลอดภัยระดับองค์กร',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    position: 'left-[3%] top-[74%]',
    duration: '3.7s',
    delay: '-0.6s',
  },
  {
    icon: Sparkles,
    label: 'AI กรอกอัตโนมัติ',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    position: 'right-[3%] top-[16%]',
    duration: '4.6s',
    delay: '-2.1s',
  },
  {
    icon: Zap,
    label: 'สร้างใน 30 วินาที',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    position: 'right-[6%] top-[46%]',
    duration: '3.9s',
    delay: '-1.0s',
  },
  {
    icon: Users,
    label: 'ทำงานร่วมกัน',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    position: 'right-[2%] top-[72%]',
    duration: '5.4s',
    delay: '-2.8s',
  },
];

export default function HeroSection({ dict }: { dict: HeroDict }) {
  return (
    <section className="relative overflow-hidden bg-[#f5f0ea]">
      {/* Decorative background lines */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
        fill="none"
      >
        {/* Curved lines */}
        <path
          d="M-100 200 Q 200 100 400 300 T 800 250 T 1200 350 T 1600 200"
          stroke="#8b7355"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M-50 400 Q 300 300 500 500 T 900 400 T 1300 550 T 1600 400"
          stroke="#8b7355"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M0 600 Q 250 500 450 650 T 850 550 T 1250 700 T 1550 600"
          stroke="#8b7355"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M-80 750 Q 200 680 500 800 T 1000 700 T 1500 820"
          stroke="#8b7355"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Circles along the lines */}
        <circle
          cx="200"
          cy="250"
          r="20"
          stroke="#8b7355"
          strokeWidth="1.5"
          fill="none"
        />
        <circle
          cx="600"
          cy="280"
          r="14"
          stroke="#8b7355"
          strokeWidth="1.5"
          fill="none"
        />
        <circle
          cx="1000"
          cy="320"
          r="18"
          stroke="#8b7355"
          strokeWidth="1.5"
          fill="none"
        />
        <circle
          cx="350"
          cy="480"
          r="12"
          stroke="#8b7355"
          strokeWidth="1.5"
          fill="none"
        />
        <circle
          cx="800"
          cy="420"
          r="22"
          stroke="#8b7355"
          strokeWidth="1.5"
          fill="none"
        />
        <circle
          cx="1200"
          cy="500"
          r="16"
          stroke="#8b7355"
          strokeWidth="1.5"
          fill="none"
        />
        {/* Dots */}
        <circle cx="100" cy="300" r="4" fill="#8b7355" />
        <circle cx="500" cy="350" r="3" fill="#8b7355" />
        <circle cx="900" cy="280" r="5" fill="#8b7355" />
        <circle cx="1100" cy="450" r="3" fill="#8b7355" />
        <circle cx="300" cy="550" r="4" fill="#8b7355" />
        <circle cx="700" cy="600" r="3" fill="#8b7355" />
        <circle cx="1300" cy="350" r="4" fill="#8b7355" />
      </svg>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden md:block"
      >
        {FLOATING_CHIPS.map((chip) => {
          const Icon = chip.icon;
          return (
            <div
              key={chip.label}
              className={`animate-float absolute flex items-center gap-2 whitespace-nowrap rounded-full border border-[#e5e0da] bg-white/90 py-1.5 pl-1.5 pr-4 shadow-sm backdrop-blur-sm ${chip.position}`}
              style={
                {
                  '--float-duration': chip.duration,
                  '--float-delay': chip.delay,
                } as React.CSSProperties
              }
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full ${chip.iconBg}`}
              >
                <Icon className={`h-3.5 w-3.5 ${chip.iconColor}`} strokeWidth={2.5} />
              </span>
              <Typography as="span" variant="body-sm" weight="medium" tone="heading">
                {chip.label}
              </Typography>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="relative z-[1] mx-auto flex w-full max-w-[1280px] flex-col items-center px-6 pt-16 text-center md:pt-24">
        {/* Heading */}
        <Typography variant="display" className="max-w-3xl">
          {dict.heading}
        </Typography>
        <Typography variant="lead" className="mt-5 max-w-xl">
          {dict.subtitle}
        </Typography>

        {/* CTA buttons — side by side */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Button variant="secondary" size="md" href="#trial">
            {dict.primaryCta}
          </Button>
          <Button
            variant="outline"
            size="md"
            href="#trial"
            className="border-[#d4c9b8] text-[#262626] hover:bg-[#e5ddd0]"
          >
            {dict.secondaryCta}
          </Button>
        </div>

        {/* Product screenshot — fills the hero container width on desktop.
         * Cropped via aspect-ratio so the empty whitespace at the bottom of
         * the source PNG is hidden. */}
        <div className="relative mt-14 w-full max-w-7xl md:mt-20">
          <div className="relative aspect-[16/9] overflow-hidden rounded-t-xl">
            <img
              src="/images/workspace-preview-2.png"
              alt="Dooform app preview"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f5f0ea] to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
