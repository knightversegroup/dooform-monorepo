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
      {/* Presenter Image - Positioned to the right, behind text */}
      <div className="absolute right-0 top-0 hidden h-full w-[65%] md:block lg:w-[60%]">
        <img
          src="/images/presenter.png"
          alt="Dooform Presenter"
          className="h-full w-full object-contain object-right-bottom"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 mx-auto min-h-[600px] max-w-[1280px] px-6 py-24 lg:min-h-[700px] lg:px-8 lg:py-32">
        {/* Left Content */}
        <div className="flex max-w-[675px] flex-col gap-10 lg:gap-12">
          {/* Headline */}
          <Typography
            variant="h1"
            className="text-4xl font-semibold leading-tight text-gray-900 md:text-5xl lg:text-[64px] lg:leading-[70px]"
          >
            {dict.heading}
          </Typography>

          {/* Description */}
          <p className="text-xl font-medium leading-snug text-black md:text-2xl lg:text-[32px] lg:leading-[100%]">
            {dict.subtitle}
          </p>

          {/* CTA Button */}
          <Button
            variant="secondary"
            size="lg"
            href="https://legacy.dooform.com/"
            className="h-[64px] w-fit rounded-[7px] bg-[#ff6700] px-6 text-xl font-semibold text-white shadow-[8px_9px_2px_rgba(0,0,0,0.25)] transition-colors hover:bg-[#e55d00] md:text-2xl lg:px-8 lg:text-[30px]"
          >
            {dict.primaryCta}
          </Button>
        </div>
      </div>

      {/* Mobile Image - Show below content on small screens */}
      <div className="relative mx-auto max-w-md px-6 pb-12 md:hidden">
        <img
          src="/images/presenter.png"
          alt="Dooform Presenter"
          className="w-full object-contain"
        />
      </div>
    </section>
  );
}
