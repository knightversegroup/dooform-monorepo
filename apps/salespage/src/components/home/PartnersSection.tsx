import { Typography } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';

type PartnersDict = {
  heading: string;
  subtitle: string;
};

const LOGOS = [
  '/logo-group/logo-1.png',
  '/logo-group/logo-2.png',
  '/logo-group/logo-3.png',
  '/logo-group/logo-4.png',
];

export default function PartnersSection({ dict }: { dict: PartnersDict }) {
  return (
    <Section padding="none">
      <Container className="py-9">
        {/* Header */}
        <div className="mb-9 text-center">
          <Typography variant="h2">
            {dict.heading}
          </Typography>
          <Typography variant="body" className="mt-0.5">
            {dict.subtitle}
          </Typography>
        </div>

        {/* Marquee with edge fade.
         *
         * The track is two identical groups laid side-by-side. Each group
         * has internal `gap-4` between items and `pr-4` after its last
         * item, so both groups have the SAME total width including their
         * trailing gap. The CSS animation translates the track from 0 to
         * -50%, which now lands exactly on the start of the second group —
         * visually identical to the start of the first — giving a
         * seamless infinite loop. The previous flat doubled array used
         * one shared gap between copies, so -50% didn't align and the
         * loop visibly jumped on each cycle.
         */}
        <div
          className="relative overflow-hidden py-8"
          style={{
            maskImage:
              'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          }}
        >
          <div className="flex w-max animate-marquee">
            {[0, 1].map((groupIndex) => (
              <div
                key={groupIndex}
                className="flex shrink-0 gap-4 pr-4"
                aria-hidden={groupIndex === 1}
              >
                {LOGOS.map((src, i) => (
                  <div
                    key={i}
                    className="flex h-[60px] w-[160px] shrink-0 items-center justify-center"
                  >
                    <img
                      src={src}
                      alt=""
                      className="h-10 max-w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
