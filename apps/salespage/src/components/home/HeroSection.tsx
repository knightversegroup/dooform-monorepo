import { Typography } from '@dooform/ui';

type HeroDict = {
  headingLine1: string;
  headingLine2: string;
  headingLine3: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  imageAlt: string;
};

export default function HeroSection({ dict }: { dict: HeroDict }) {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="relative mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-10 px-6 pb-16 pt-12 md:grid-cols-[1.1fr_1fr] md:items-center md:gap-12 md:pb-24 md:pt-20">
        {/* ── Left column: heading, preview cards, CTAs, intro ───── */}
        <div className="flex flex-col items-start gap-8">
          <Typography variant="display-xl" as="h1">
            {dict.headingLine1}
            <br />
            {dict.headingLine2}
            <br />
            {dict.headingLine3}
          </Typography>

          {/* Document preview placeholders (grey boxes in the design). */}
          <div aria-hidden className="flex w-full gap-4">
            <div className="aspect-[435/387] w-1/2 max-w-[220px] rounded-xl bg-neutral-200" />
            <div className="aspect-[435/387] w-1/2 max-w-[220px] rounded-xl bg-neutral-200" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a
              href="#trial"
              className="inline-flex items-center justify-center rounded-full border border-black bg-df-orange px-8 py-3.5 text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] transition-colors hover:bg-[#f57f15]"
            >
              <Typography as="span" variant="h5" weight="bold" tone="inverse">
                {dict.primaryCta}
              </Typography>
            </a>
            <a
              href="/#contact"
              className="inline-flex items-center justify-center rounded-full border border-black bg-white px-8 py-3.5 text-neutral-900 transition-colors hover:bg-neutral-100"
            >
              <Typography as="span" variant="h5" weight="bold" tone="inherit">
                {dict.secondaryCta}
              </Typography>
            </a>
          </div>

          <Typography variant="lead" tone="inherit" className="max-w-xl text-neutral-700">
            {dict.subtitle}
          </Typography>
        </div>

        {/* ── Right column: hero illustration ─────────────────────── */}
        <div className="relative">
          <img
            src="/images/home/hero-illustration.png"
            alt={dict.imageAlt}
            className="mx-auto w-full max-w-[640px] object-contain"
          />
        </div>
      </div>
    </section>
  );
}
