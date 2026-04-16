import Image from 'next/image';

type HeroDict = {
  heading: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
};

export default function HeroSection({ dict }: { dict: HeroDict }) {
  return (
    <section className="flex justify-center px-[10px]">
      <div className="flex w-full max-w-[1280px] flex-col items-center px-6 pt-10 pb-16">
        {/* Hero Image */}
        <div className="aspect-[361/250] w-full rounded-xl bg-gradient-to-b from-[#d9d9d9] to-white md:aspect-[16/7] md:rounded-2xl">
          {/* Replace with actual hero image/video */}
          {/* <Image src="/hero-image.png" alt="Dooform" fill className="object-cover rounded-xl md:rounded-2xl" /> */}
        </div>

        {/* Text Content */}
        <div className="mt-8 flex flex-col items-center gap-3 text-center md:mt-12">
          <div>
            <h1 className="text-2xl font-semibold text-black md:text-4xl">
              {dict.heading}
            </h1>
            <p className="mt-0.5 text-sm text-black md:text-base">
              {dict.subtitle}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2">
            <a
              href="#trial"
              className="rounded-full bg-[#2c2585] px-3 py-1.5 text-sm text-white transition hover:bg-[#231e6b]"
            >
              {dict.primaryCta}
            </a>
            <a
              href="#features"
              className="rounded-full bg-[#e4e4e4] px-3 py-1.5 text-sm text-black transition hover:bg-[#d4d4d4]"
            >
              {dict.secondaryCta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
