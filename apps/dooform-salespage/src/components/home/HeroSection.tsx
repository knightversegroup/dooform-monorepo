import { Button, Typography } from '@dooform/ui';

type HeroDict = {
  heading: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta?: string;
};

export default function HeroSection({ dict }: { dict: HeroDict }) {
  return (
    <section className="relative w-full overflow-hidden bg-[#eceae4]">
      {/* Presenter Image - Desktop: right side, aligned to bottom */}
      <div className="absolute bottom-0 right-0 hidden w-[65%] md:block lg:w-[55%]">
        <img
          src="/images/presenter.png"
          alt="Dooform Presenter"
          className="w-full object-contain object-bottom"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 mx-auto max-w-[1280px] px-6 py-16 md:min-h-[600px] md:py-24 lg:min-h-[700px] lg:px-8 lg:py-32">
        {/* Content - Centered on mobile, left on desktop */}
        <div className="flex max-w-[675px] flex-col gap-8 text-center md:gap-10 md:text-left lg:gap-12">
          {/* Headline */}
          <Typography
            variant="h1"
            className="text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl md:text-5xl lg:text-[64px] lg:leading-[70px]"
          >
            {dict.heading}
          </Typography>

          {/* Description */}
          <p className="text-lg font-medium leading-snug text-black sm:text-xl md:text-2xl lg:text-[32px] lg:leading-[100%]">
            {dict.subtitle}
          </p>

          {/* CTA Button - Centered on mobile */}
          <div className="flex justify-center md:justify-start">
            <Button
              variant="secondary"
              size="lg"
              href="https://legacy.dooform.com/"
              className="h-[56px] w-fit rounded-[7px] bg-[#ff6700] px-5 text-lg font-semibold text-white shadow-[8px_9px_2px_rgba(0,0,0,0.25)] transition-colors hover:bg-[#e55d00] sm:h-[64px] sm:px-6 sm:text-xl md:text-2xl lg:px-8 lg:text-[30px]"
            >
              {dict.primaryCta}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Image - Centered, touching bottom */}
      <div className="relative mx-auto max-w-xs px-4 md:hidden">
        <img
          src="/images/presenter.png"
          alt="Dooform Presenter"
          className="mx-auto w-full object-contain"
        />
      </div>
    </section>
  );
}
