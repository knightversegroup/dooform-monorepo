/**
 * Section: FAQ - Exact match from Figma
 * - Two-column layout: left info, right accordion
 * - Border: #d4cec4 bottom 1.5px
 * - Chevron icon for expand/collapse
 */

const faqItems = [
  { question: 'บัตรประชาชน' },
  { question: 'สูติบัตร' },
  { question: 'ทะเบียนบ้าน' },
  { question: 'ใบสำคัญการสมรส' },
  { question: 'อื่น ๆ' },
];

export default function FAQ() {
  return (
    <section id="faq" className="bg-white">
      <div className="mx-auto max-w-[1280px]">
        <div className="flex min-h-[302px]">
          {/* Left Column - Info */}
          <div className="w-[413px] flex flex-col px-6 py-9">
            <div className="flex flex-col gap-3">
              {/* Title & Description */}
              <div className="flex flex-col gap-0.5 w-[350px]">
                <h2 className="font-ibm-plex-thai font-semibold text-[24px] leading-[29px] text-onyx">
                  คำถามที่พบบ่อย
                </h2>
                <p className="font-ibm-plex-thai text-[16px] text-onyx">
                  รองรับเอกสารราชการใช้สำหรับแปลพร้อมยื่นสถานทูต
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3">
                {/* Primary Button */}
                <button className="h-8 px-1.5 bg-onyx rounded-full flex items-center justify-center">
                  <span className="px-1.5 font-ibm-plex-thai font-medium text-[12px] text-[#fcfcfc]">
                    เลือกดูเอกสาร
                  </span>
                </button>
                {/* Secondary Button */}
                <button className="h-8 px-1.5 bg-[#fcfcfc] rounded-full flex items-center justify-center">
                  <span className="px-1.5 font-ibm-plex-thai font-medium text-[12px] text-onyx">
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
                    <span className="font-ibm-plex-thai text-[16px] text-black">
                      {item.question}
                    </span>
                    {/* Chevron icon - 16x16 */}
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-black transition-transform duration-200 group-open:rotate-180"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-3 pb-3">
                    <p className="font-ibm-plex-thai text-[14px] text-carbon leading-relaxed">
                      รายละเอียดเกี่ยวกับ{item.question}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
