/**
 * Cost Section - From Figma
 * Desktop: Title 36px with full-width gradient placeholder
 * Mobile: Navy header with emphasized title, smaller gradient placeholder
 */

export default function CostSection() {
  return (
    <section>
      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-col gap-6 items-center">
        {/* Header */}
        <div className="max-w-[1280px] w-full px-6 flex items-center justify-between">
          <h2 className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[36px] text-black">
            ดูฟอร์มช่วยลดต้นทุนให้กับธุรกิจอย่างไร
          </h2>
          <a href="#" className="flex items-center gap-0.5 text-[#424242] text-[14px] font-['IBM_Plex_Sans_Thai'] hover:underline">
            ดู Use Case
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </a>
        </div>

        {/* Gradient Placeholder */}
        <div className="max-w-[1280px] w-full px-6">
          <div className="flex-1 h-[554px] rounded-[24px] bg-gradient-to-b from-[#d9d9d9] to-white flex items-center justify-center">
            <p className="text-[#737373] text-lg font-['IBM_Plex_Sans_Thai']">
              Infographic / Cost comparison content goes here
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Navy Header */}
        <div className="bg-[#2c2585] h-[225px] rounded-t-[12px] overflow-hidden">
          <div className="px-4 py-8">
            <div className="flex items-center justify-between">
              <h2 className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[24px] text-white text-center">
                ดูฟอร์มช่วย<span className="underline">ลดต้นทุน</span>
                <br />
                ให้กับธุรกิจอย่างไร
              </h2>
            </div>
          </div>
        </div>

        {/* Gradient Placeholder - Overlapping */}
        <div className="px-4 -mt-[95px]">
          <div className="h-[250px] rounded-[12px] bg-gradient-to-b from-[#d9d9d9] to-white flex items-center justify-center">
            <p className="text-[#737373] text-sm font-['IBM_Plex_Sans_Thai']">
              Cost comparison content
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
