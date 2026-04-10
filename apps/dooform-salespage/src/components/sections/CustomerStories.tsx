/**
 * Customer Stories Section - From Figma
 * Desktop: Navy header with 3 horizontal story cards
 * Mobile: Navy header with stacked full-width cards
 */

const stories = [
  {
    title: 'ดูฟอร์มเข้าใจเจ้าของกิจการและนักแปล',
    description: 'แฟ็กซ์ปิกอัพเซลส์แอโรบิคโมจิ อพาร์ทเมนท์ซิ้มสเก็ตช์ แกสโซฮอล์วอลนัต นิรันดร์ซาบะ',
  },
  {
    title: 'ลดเวลากรอกเอกสาร',
    description: 'แฟ็กซ์ปิกอัพเซลส์แอโรบิคโมจิ อพาร์ทเมนท์ซิ้มสเก็ตช์ แกสโซฮอล์วอลนัต นิรันดร์ซาบะ แดนซ์กระดี๊กระด๊าฟีเวอร์เฮอร์ริเคน ออร์แกน ธุรกรรมแอพพริคอท บรรพชนชัวร์เซ็กส์',
  },
];

// Placeholder component for presenter/person images
function ImagePlaceholder({ label = 'Image' }: { label?: string }) {
  return (
    <div className="w-full h-full bg-[#d9d9d9] flex items-center justify-center">
      <span className="font-['IBM_Plex_Sans_Thai'] text-[10px] text-[#737373] text-center">
        [{label}]
      </span>
    </div>
  );
}

export default function CustomerStories() {
  return (
    <section className="pb-8 lg:pb-20">
      {/* Navy Header */}
      <div className="bg-[#2c2585] h-[190px] rounded-t-[12px] lg:rounded-t-[36px] mb-[-80px] overflow-hidden">
        <div className="max-w-[1280px] mx-auto pt-8 px-4">
          <div className="flex items-center justify-between lg:flex-col lg:gap-0.5 lg:items-center text-white">
            <div className="lg:text-center">
              <h2 className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[20px] lg:text-[24px] leading-tight lg:leading-[29px]">
                ดูฟอร์มเข้าใจ
                <br />
                เจ้าของกิจการและนักแปล
              </h2>
            </div>
            {/* Mobile: View Use Case link */}
            <a href="#" className="flex items-center gap-0.5 text-[#ececec] text-[14px] font-['IBM_Plex_Sans_Thai'] lg:hidden">
              ดู Use Case
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
            <p className="hidden lg:block font-['IBM_Plex_Sans_Thai'] text-[16px]">
              สามารถเลือกแพ็กเกจการใช้งานได้ตามความต้องการ
            </p>
          </div>
        </div>
      </div>

      {/* Story Cards */}
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-3 lg:h-[252px]">
          {stories.map((story, i) => (
            <div
              key={i}
              className="w-full lg:flex-1 bg-white border border-[#e5e5e5] rounded-[16px] flex flex-col overflow-hidden"
            >
              {/* Card Header with Image Placeholder */}
              <div className="bg-[#f4f3fc] flex items-center pl-4 rounded-t-[16px]">
                <h3 className="flex-1 font-['IBM_Plex_Sans_Thai'] font-semibold text-[20px] text-[#2c2585]">
                  {story.title}
                </h3>
                <div className="w-[119px] h-[110px] flex-shrink-0">
                  <ImagePlaceholder label="Presenter" />
                </div>
              </div>

              {/* Card Body */}
              <div className="bg-white p-4 rounded-b-[16px] flex-1">
                <p className="font-['IBM_Plex_Sans_Thai'] text-[14px] text-[#2c2585]">
                  {story.description}
                </p>
              </div>
            </div>
          ))}
          {/* Third card - Desktop only */}
          <div className="hidden lg:flex w-full lg:flex-1 bg-white border border-[#e5e5e5] rounded-[16px] flex-col overflow-hidden">
            <div className="bg-[#f4f3fc] flex items-center pl-4 rounded-t-[16px]">
              <h3 className="flex-1 font-['IBM_Plex_Sans_Thai'] font-semibold text-[20px] text-[#2c2585]">
                ดูฟอร์มเข้าใจเจ้าของกิจการและนักแปล
              </h3>
              <div className="w-[119px] h-[110px] flex-shrink-0">
                <ImagePlaceholder label="Presenter" />
              </div>
            </div>
            <div className="bg-white p-4 rounded-b-[16px] flex-1">
              <p className="font-['IBM_Plex_Sans_Thai'] text-[14px] text-[#2c2585]">
                แฟ็กซ์ปิกอัพเซลส์แอโรบิคโมจิ อพาร์ทเมนท์ซิ้มสเก็ตช์ แกสโซฮอล์วอลนัต นิรันดร์ซาบะ
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
