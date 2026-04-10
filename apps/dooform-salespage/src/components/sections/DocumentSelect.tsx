/**
 * Document Select Section - From Figma
 * Desktop: Title 36px, cards in centered row
 * Mobile: Title 20px, horizontal scrolling cards (155px width)
 */

// Document card data
const documents = [
  { title: 'บัตรประชาชน', description: 'จดทะเบียนรถยนต์ กรมการขนส่งทางบก', icon: 'triangle' },
  { title: 'บัตรประชาชน', description: 'จดทะเบียนรถยนต์ กรมการขนส่งทางบก', icon: 'circle' },
  { title: 'บัตรประชาชน', description: 'จดทะเบียนรถยนต์ กรมการขนส่งทางบก', icon: 'star' },
  { title: 'บัตรประชาชน', description: 'จดทะเบียนรถยนต์ กรมการขนส่งทางบก', icon: 'triangle' },
  { title: 'บัตรประชาชน', description: 'จดทะเบียนรถยนต์ กรมการขนส่งทางบก', icon: 'circle' },
];

const IconRenderer = ({ type }: { type: string }) => {
  switch (type) {
    case 'circle':
      return (
        <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="#2c2585">
          <circle cx="5" cy="5" r="5" />
        </svg>
      );
    case 'star':
      return (
        <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="#2c2585">
          <polygon points="5,0 6.5,3.5 10,4 7.5,6.5 8,10 5,8 2,10 2.5,6.5 0,4 3.5,3.5" />
        </svg>
      );
    default:
      return (
        <svg className="w-[11px] h-[10px]" viewBox="0 0 11 10" fill="#2c2585">
          <polygon points="5.5,0 11,10 0,10" />
        </svg>
      );
  }
};

export default function DocumentSelect() {
  return (
    <section className="py-8 px-4 overflow-hidden">
      <div className="max-w-[1396px] mx-auto flex flex-col gap-6">
        {/* Header Row */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[20px] lg:text-[36px] text-black">
              เลือกดูเอกสาร
            </h2>
            <a href="#" className="flex items-center gap-0.5 text-[#656565] text-[14px] lg:text-[20px] font-['IBM_Plex_Sans_Thai'] hover:underline">
              ดูเอกสารทั้งหมด
              <svg className="w-3 h-3 lg:w-[22px] lg:h-[23px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex gap-1.5 items-center lg:justify-end">
            <button className="h-[28px] lg:h-[39px] px-3 py-0.5 bg-white border border-[#d6d6d6] rounded-[27px] flex items-center gap-1.5">
              <span className="font-['IBM_Plex_Sans_Thai'] text-[14px] text-[#272727]">เรียงตาม</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button className="h-[28px] lg:h-[39px] px-3 py-0.5 bg-white border border-[#d6d6d6] rounded-[27px] flex items-center gap-1.5">
              <span className="font-['IBM_Plex_Sans_Thai'] text-[14px] text-[#272727]">หมวดหมู่</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Document Cards - Mobile: horizontal scroll, Desktop: centered row */}
        <div className="overflow-x-auto lg:overflow-visible -mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="flex gap-2.5 lg:items-center lg:justify-center w-max lg:w-auto">
            {documents.map((doc, i) => (
              <div
                key={i}
                className="w-[155px] lg:w-[271px] min-h-[100px] lg:h-[143px] p-3 bg-white border border-[#e6e6e6] rounded-[12px] flex flex-col gap-[3px] cursor-pointer hover:border-[#2c2585] hover:shadow-lg transition-all flex-shrink-0 lg:flex-shrink"
              >
                {/* Icon */}
                <IconRenderer type={doc.icon} />

                {/* Text Content */}
                <div className="flex flex-col gap-[3px]">
                  <h3 className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[16px] text-black">
                    {doc.title}
                  </h3>
                  <p className="font-['IBM_Plex_Sans_Thai'] text-[14px] leading-[18px] text-black">
                    {doc.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
