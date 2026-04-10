/**
 * Trust Badges Section - From Figma
 * Desktop: Title 36px, logo row centered
 * Mobile: Title 20px, logos in 2 rows with horizontal scroll
 */

export default function TrustBadges() {
  return (
    <section className="bg-white border-b border-[#e6e6e6] rounded-t-[12px] lg:rounded-t-[50px] lg:shadow-[0px_-6px_11.7px_0px_rgba(0,0,0,0.25)] py-8 px-4 -mt-16 lg:-mt-24 relative z-10">
      <div className="flex flex-col gap-1.5 lg:gap-8 items-start lg:items-center max-w-[1280px] mx-auto">
        {/* Title */}
        <h2 className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[20px] lg:text-[36px] text-black lg:text-center">
          ได้รับความไว้วางใจจาก
        </h2>

        {/* Logo Grid - Mobile: 2 rows scrollable, Desktop: single row */}
        <div className="w-full overflow-x-auto lg:overflow-visible opacity-70">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-center">
            {/* Row 1 */}
            <div className="flex gap-3 items-center">
              {[1, 2, 3].map((i) => (
                <div
                  key={`row1-${i}`}
                  className="h-[45px] lg:h-[76px] w-[100px] lg:w-[200px] border border-[#d6d6d6] lg:border-0 lg:bg-[#393939]/20 rounded-lg flex-shrink-0 flex items-center justify-center"
                >
                  <span className="text-[#393939] text-xs lg:text-sm">Logo {i}</span>
                </div>
              ))}
            </div>
            {/* Row 2 - Mobile only shows as second row, desktop combines */}
            <div className="flex gap-3 items-center lg:hidden">
              {[4, 5, 6].map((i) => (
                <div
                  key={`row2-${i}`}
                  className="h-[45px] w-[100px] border border-[#d6d6d6] rounded-lg flex-shrink-0 flex items-center justify-center"
                >
                  <span className="text-[#393939] text-xs">Logo {i}</span>
                </div>
              ))}
            </div>
            {/* Desktop additional logos */}
            <div className="hidden lg:flex gap-3 items-center">
              {[4, 5, 6].map((i) => (
                <div
                  key={`desktop-${i}`}
                  className="h-[76px] w-[200px] bg-[#393939]/20 rounded-lg flex items-center justify-center"
                >
                  <span className="text-[#393939] text-sm">Company Logo {i}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
