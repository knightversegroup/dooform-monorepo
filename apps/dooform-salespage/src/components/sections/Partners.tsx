/**
 * Partners Section - From Figma
 * This section is combined with CustomerStories in mobile view
 * Desktop: Standalone section with partner logos
 * Mobile: Hidden (integrated into CustomerStories header)
 */

// TODO: Replace with actual partner logo image
const imgPartnerLogos = "https://www.figma.com/api/mcp/asset/8c0aba48-40e5-448f-8ec8-6ffb8fcecb57";

export default function Partners() {
  return (
    <section className="hidden lg:block py-9">
      <div className="max-w-[1280px] mx-auto flex flex-col gap-9 items-center">
        {/* Header */}
        <div className="flex flex-col gap-0.5 items-center text-center text-[#262626]">
          <h2 className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[24px] leading-[29px]">
            ใช้งานโดยหน่วยงานและบริษัทชั้นนำ
          </h2>
          <p className="font-['IBM_Plex_Sans_Thai'] text-[16px]">
            ดูฟอร์มได้ให้บริการกับหน่วยงานในหลายธุรกิจ
          </p>
        </div>

        {/* Partner Logos */}
        <div className="w-[996px] h-[73px]">
          <img
            src={imgPartnerLogos}
            alt="Partner Logos"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </section>
  );
}
