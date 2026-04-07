/**
 * Section 3: Logo Marquee
 * - Background: white
 * - Spacing: 12px gap (Figma spec)
 * - Placeholder for logos
 */
export default function LogoMarquee() {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-container px-4">
        {/* Header */}
        <p className="text-center font-ibm-plex-thai text-section-subtitle text-carbon mb-8">
          ได้รับความไว้วางใจจาก
        </p>

        {/* Logo placeholder row - gap-3 = 12px */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {/* TODO: Add logo images here */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-10 w-28 bg-sand-light rounded-lg flex items-center justify-center text-card-body text-carbon-100 border border-stroke"
            >
              Logo {i}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
