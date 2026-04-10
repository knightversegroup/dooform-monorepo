/**
 * Hero Section - From Figma
 * Desktop: Background #2c2585, 860px min-height, left-aligned content with screenshot
 * Mobile: Centered content, stacked layout, smaller image
 */

export default function Hero() {
  return (
    <section className="bg-[#2c2585] min-h-[490px] lg:min-h-[860px] flex items-start px-4 pt-16 lg:pl-[94px] lg:pr-4 lg:py-16">
      {/* Mobile Layout */}
      <div className="flex flex-col gap-4 items-center w-full lg:hidden">
        {/* Text Content */}
        <div className="flex flex-col gap-6 items-center text-center">
          <div className="flex flex-col gap-3 items-center text-white">
            <p className="font-['IBM_Plex_Sans_Thai'] text-[14px]">
              ดูฟอร์ม
            </p>
            <div className="flex flex-col gap-0.5 items-center">
              <h1 className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[36px] leading-[43px]">
                กรอกฟอร์มไม่ใช่เรื่อง
                <br />
                ยากอีกต่อไป
              </h1>
              <p className="font-['IBM_Plex_Sans_Thai'] text-[14px]">
                ให้การกรอกฟอร์มไม่เป็นเรื่องยากอีกต่อไป
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-2 items-center">
            <button className="px-3 py-1.5 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
              <span className="font-['IBM_Plex_Sans_Thai'] text-[14px] text-black">
                ทดลองใช้งาน
              </span>
            </button>
            <button className="px-3 py-1.5 bg-[#2c2585] border border-white/30 rounded-full flex items-center justify-center hover:bg-[#3d34a0] transition-colors">
              <span className="font-['IBM_Plex_Sans_Thai'] text-[14px] text-white">
                ทดลองใช้งาน
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Screenshot Placeholder */}
        <div className="w-[222px] h-[222px] bg-[#d9d9d9] rounded-[12px] flex items-center justify-center">
          <span className="font-['IBM_Plex_Sans_Thai'] text-[14px] text-[#737373] text-center">
            [Presenter Image]
          </span>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex gap-[15px] items-start w-full max-w-[1511px]">
        {/* Left Content */}
        <div className="flex flex-col justify-center h-[732px] w-[582px]">
          <div className="flex flex-col gap-[78px]">
            {/* Text Content */}
            <div className="flex flex-col gap-1">
              <h1 className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[36px] leading-[43px] text-[#f9fafb]">
                กรอกฟอร์มไม่ใช่เรื่อง
                <br />
                ยากอีกต่อไป
              </h1>
              <p className="font-['IBM_Plex_Sans_Thai'] font-medium text-[24px] text-white">
                ดูฟอร์ม ผู้ช่วยกรอกเอกสารราชการได้อย่างรวดเร็ว
              </p>
            </div>

            {/* CTA Button */}
            <button className="h-12 px-[14px] bg-white rounded-full flex items-center justify-center w-fit hover:bg-gray-100 transition-colors">
              <span className="px-1.5 font-['IBM_Plex_Sans_Thai'] font-medium text-[16px] text-black">
                ทดลองใช้งาน
              </span>
            </button>
          </div>
        </div>

        {/* Right Screenshot Placeholder */}
        <div className="flex-1">
          <div className="border-[11px] border-[#d6d6d6] rounded-[19px] overflow-hidden w-[1183px] h-[732px] bg-[#e5e5e5] flex items-center justify-center">
            <span className="font-['IBM_Plex_Sans_Thai'] text-[24px] text-[#737373]">
              [App Screenshot / Presenter Image]
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
