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
    <section className="relative flex min-h-[70vh] items-end overflow-hidden md:min-h-[80vh]">
      {/* Background image */}
      <img
        src="/hero-bg-1.jpg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

      {/* Content */}
      <div className="relative z-[1] mx-auto w-full max-w-[1280px] px-6 pb-16 md:pb-24">
        <Typography variant="h1" className="max-w-4xl text-white">
          {dict.heading}
        </Typography>
        <p className="mt-3 max-w-lg text-lg text-white/70">{dict.subtitle}</p>
        <div className="mt-8">
          <Button variant="secondary" size="md" href="#trial">
            {dict.primaryCta}
          </Button>
        </div>
      </div>
    </section>
  );
}
