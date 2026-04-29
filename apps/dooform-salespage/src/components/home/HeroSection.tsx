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

      {/* Floating decorative icons */}
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        {/* Top-left area */}
        <div className="absolute left-[8%] top-[18%] flex h-10 w-10 items-center justify-center rounded-full bg-[#ff6b35] text-lg shadow-lg shadow-orange-500/20">
          📄
        </div>
        <div className="absolute left-[5%] top-[45%] flex h-8 w-8 items-center justify-center rounded-full bg-[#22c55e] text-sm shadow-lg shadow-green-500/20">
          ✓
        </div>
        <div className="absolute left-[15%] top-[70%] flex h-9 w-9 items-center justify-center rounded-full bg-[#a855f7] text-base shadow-lg shadow-purple-500/20">
          🔒
        </div>
        {/* Top-right area */}
        <div className="absolute right-[10%] top-[15%] flex h-9 w-9 items-center justify-center rounded-full bg-[#3b82f6] text-base shadow-lg shadow-blue-500/20">
          📋
        </div>
        <div className="absolute right-[6%] top-[42%] flex h-10 w-10 items-center justify-center rounded-full bg-[#f59e0b] text-lg shadow-lg shadow-amber-500/20">
          ⚡
        </div>
        <div className="absolute right-[14%] top-[68%] flex h-8 w-8 items-center justify-center rounded-full bg-[#ec4899] text-sm shadow-lg shadow-pink-500/20">
          🏷️
        </div>
      </div>

      {/* Content */}
      <div className="relative z-[1] mx-auto flex w-full max-w-[1280px] flex-col items-center px-6 pt-16 text-center md:pt-24">
        {/* Heading */}
        <Typography
          variant="h1"
          className="max-w-3xl text-4xl leading-tight text-[#262626] md:text-5xl lg:text-6xl"
        >
          {dict.heading}
        </Typography>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-[#737373] md:text-lg">
          {dict.subtitle}
        </p>

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

        {/* Product screenshot */}
        <div className="relative mt-14 w-full max-w-5xl md:mt-20">
          {/* Glow effect behind the image */}
          <div className="relative overflow-hidden rounded-t-xl">
            <img
              src="/images/workspace-preview-2.png"
              alt="Dooform app preview"
              className="w-full"
            />
            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f5f0ea] to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
