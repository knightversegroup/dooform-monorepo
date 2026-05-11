import { Typography } from '@dooform/ui';

type HeroDict = {
  headingLine1: string;
  headingLine2: string;
  subtitleLine1: string;
  subtitleLine2: string;
  primaryCta: string;
  imageAlt: string;
};

/* Brand-accent CTA pill — orange isn't part of the @dooform/ui Button
 * variants, and this is currently the only surface using it, so the pill is
 * styled inline rather than adding a one-off variant to the shared library. */
const HERO_CTA_CLASS =
  'inline-flex items-center justify-center rounded-full bg-[#ff6700] px-5 py-2 text-white transition-colors hover:bg-[#e65d00]';

export default function HeroSection({ dict }: { dict: HeroDict }) {
  return (
    <section className="relative overflow-hidden bg-[#eceae4]">
      {/* The man bleeds to the section's bottom edge on desktop (no `pb`),
       * and the text column vertically centers against the image. Mobile
       * keeps symmetric padding because the image is hidden there. */}
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-10 px-6 pb-16 pt-12 md:flex-row md:items-center md:justify-between md:gap-20 md:pb-0 md:pt-12">
        {/* Left: copy + CTA */}
        <div className="flex w-full max-w-[675px] flex-col items-start gap-8">
          <div className="flex flex-col gap-3">
            <Typography variant="display-xl" as="h1" tone="inherit" className="text-[#111827]">
              {dict.headingLine1}
              <br />
              {dict.headingLine2}
            </Typography>
            <Typography variant="subhead" tone="inherit" className="text-black">
              {dict.subtitleLine1}
              <br />
              {dict.subtitleLine2}
            </Typography>
          </div>

          <a href="#trial" className={HERO_CTA_CLASS}>
            <Typography as="span" variant="h5" weight="semibold" tone="inverse">
              {dict.primaryCta}
            </Typography>
          </a>
        </div>

        {/* Right: hero portrait. The PNG's native ratio (540×656) defines
         * the wrapper, and `object-cover` keeps the man framed at any
         * column width. Hidden below md to keep mobile copy uncluttered. */}
        <div className="relative hidden aspect-[540/656] w-full max-w-[540px] shrink-0 self-end md:block">
          <img
            src="/images/presenter.png"
            alt={dict.imageAlt}
            className="absolute inset-0 h-full w-full object-cover object-bottom"
          />
        </div>
      </div>
    </section>
  );
}
