/**
 * FAQ Section - From Figma
 * Desktop: Two-column layout - left title/CTA, right accordion
 * Mobile: Gray background, single column, card-style FAQ items
 */

const faqItems = [
  { question: 'บัตรประชาชน' },
  { question: 'สูติบัตร' },
  { question: 'ทะเบียนบ้าน' },
  { question: 'ใบสำคัญการสมรส' },
  { question: 'อื่น ๆ' },
];

const mobileFaqItems = [
  {
    question: 'แฟ็กซ์ปิกอัพเซลส์แอโรบิคโมจิ อพาร์ทเมนท์ซิ้มสเก็ตช์ แกสโซฮอล์วอลนัต นิรันดร์ซาบะ แดนซ์กระดี๊กระด๊าฟีเวอร์เฮอร์ริเคน ออร์แกน ธุรกรรมแอพพริคอท บรรพชนชัวร์เซ็กส์',
  },
  {
    question: 'แฟ็กซ์ปิกอัพเซลส์แอโรบิคโมจิ อพาร์ทเมนท์ซิ้มสเก็ตช์ แกสโซฮอล์วอลนัต นิรันดร์ซาบะ แดนซ์กระดี๊กระด๊าฟีเวอร์เฮอร์ริเคน ออร์แกน ธุรกรรมแอพพริคอท บรรพชนชัวร์เซ็กส์',
  },
];

export default function FAQ() {
  return (
    <section id="faq">
      {/* Desktop Layout */}
      <div className="hidden lg:block h-[302px]">
        <div className="max-w-[1280px] mx-auto h-full flex">
          {/* Left Column */}
          <div className="w-[413px] flex flex-col px-6 py-9">
            <div className="flex flex-col gap-3">
              {/* Title & Description */}
              <div className="flex flex-col gap-0.5 text-[#262626] w-[350px]">
                <h2 className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[24px] leading-[29px]">
                  คำถามที่พบบ่อย
                </h2>
                <p className="font-['IBM_Plex_Sans_Thai'] text-[16px]">
                  รองรับเอกสารราชการใช้สำหรับแปลพร้อมยื่นสถานทูต
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3">
                <button className="h-8 px-1.5 bg-[#262626] rounded-full flex items-center justify-center hover:bg-[#262626]/90 transition-colors">
                  <span className="px-1.5 font-['IBM_Plex_Sans_Thai'] font-medium text-[12px] text-[#fcfcfc]">
                    เลือกดูเอกสาร
                  </span>
                </button>
                <button className="h-8 px-1.5 bg-[#fcfcfc] rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <span className="px-1.5 font-['IBM_Plex_Sans_Thai'] font-medium text-[12px] text-[#262626]">
                    อ่านต่อ
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - FAQ Accordion */}
          <div className="flex-1 px-6 py-9">
            <div className="flex flex-col">
              {faqItems.map((item, idx) => (
                <details key={idx} className="group border-b-[1.5px] border-[#d4cec4]">
                  <summary className="flex cursor-pointer items-center justify-between px-3 py-2 list-none">
                    <span className="font-['IBM_Plex_Sans_Thai'] text-[16px] text-black">
                      {item.question}
                    </span>
                    {/* Chevron icon */}
                    <svg
                      className="w-4 h-4 flex-shrink-0 text-black transition-transform duration-200 group-open:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-3 pb-3">
                    <p className="font-['IBM_Plex_Sans_Thai'] text-[14px] text-[#4d4d4d] leading-relaxed">
                      รายละเอียดเกี่ยวกับ{item.question}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden bg-[#f7f7f7] rounded-t-[12px] overflow-hidden">
        <div className="px-4 py-8 flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-center justify-between w-full">
            <h2 className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[20px] text-black">
              คำถามที่พบบ่อย
            </h2>
            <a href="#" className="flex items-center gap-0.5 text-black text-[14px] font-['IBM_Plex_Sans_Thai']">
              ดูทั้งหมด
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
          </div>

          {/* FAQ Cards */}
          <div className="flex flex-col gap-2">
            {mobileFaqItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#e5e5e5] rounded-[16px] p-4"
              >
                <p className="font-['IBM_Plex_Sans_Thai'] text-[14px] text-[#2c2585]">
                  {item.question}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
