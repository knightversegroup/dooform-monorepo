/**
 * Features Section - From Figma
 * Desktop: Title 36px, 6 feature cards in 2 rows x 3
 * Mobile: Title 20px, horizontal scrolling cards (137px width)
 */

// TODO: Replace with actual icon images
const imgUnplug = "https://www.figma.com/api/mcp/asset/625c17e9-f38a-470d-b698-4870bc1deab9";
const imgCodeXml = "https://www.figma.com/api/mcp/asset/8c3c75ff-33d5-40b9-8554-b438afbe3ce4";
const imgZap = "https://www.figma.com/api/mcp/asset/6218c2f5-fbb6-45ce-817c-befdea331fc5";
const imgVectorStroke = "https://www.figma.com/api/mcp/asset/ca1a5d02-d633-4bac-8290-26d516ce60a8";

const features = [
  {
    icon: imgVectorStroke,
    title: 'กรอกฟอร์ม',
    description: 'ฟอร์ม 100+ รายการพร้อมใช้งาน',
    fullDescription: 'นอกจากเอกสารราชการที่ Dooform มีให้ใช้งานแล้ว คุณยังสามารถใช้ syntax จาก Dooform จัดการเอกสารที่มีอยู่ในระบบของคุณได้',
    cta: 'ตัวอย่างงาน',
  },
  {
    icon: imgVectorStroke,
    title: 'กรอกฟอร์ม',
    description: 'ฟอร์ม 100+ รายการพร้อมใช้งาน',
    fullDescription: 'Business API Webhook ออกแบบมาเพื่อให้นักพัฒนาเชื่อมต่อกับ Dooform ได้ง่ายมากยิ่งขึ้น',
    cta: 'API Reference',
  },
  {
    icon: imgVectorStroke,
    title: 'กรอกฟอร์ม',
    description: 'ฟอร์ม 100+ รายการพร้อมใช้งาน',
    fullDescription: 'หากธุรกิจของคุณต้องจัดการเอกสารและส่งออกเป็นจำนวนมาก คุณสามารถเรียก API เพื่อสร้างไฟล์ได้มากถึง 1,000 รายการ/10 seconds',
    cta: 'ดูกราฟวัดประสิทธิภาพ',
  },
  {
    icon: imgVectorStroke,
    title: 'OCR เอกสาร',
    description: '',
    fullDescription: 'นอกจากเอกสารราชการที่ Dooform มีให้ใช้งานแล้ว คุณยังสามารถใช้ syntax จาก Dooform จัดการเอกสารที่มีอยู่ในระบบของคุณได้',
    cta: 'ตัวอย่างงาน',
  },
];

const desktopFeatures = [
  {
    icon: imgUnplug,
    title: 'รองรับธุรกิจที่หลากหลาย',
    description: 'นอกจากเอกสารราชการที่ Dooform มีให้ใช้งานแล้ว คุณยังสามารถใช้ syntax จาก Dooform จัดการเอกสารที่มีอยู่ในระบบของคุณได้',
    cta: 'ตัวอย่างงาน',
  },
  {
    icon: imgCodeXml,
    title: 'Developer Friendly',
    description: 'Business API Webhook ออกแบบมาเพื่อให้นักพัฒนาเชื่อมต่อกับ Dooform ได้ง่ายมากยิ่งขึ้น',
    cta: 'API Reference',
  },
  {
    icon: imgZap,
    title: 'ประมวลผลไว',
    description: 'หากธุรกิจของคุณต้องจัดการเอกสารและส่งออกเป็นจำนวนมาก คุณสามารถเรียก API เพื่อสร้างไฟล์ได้มากถึง 1,000 รายการ/10 seconds',
    cta: 'ดูกราฟวัดประสิทธิภาพ',
  },
  {
    icon: imgUnplug,
    title: 'รองรับธุรกิจที่หลากหลาย',
    description: 'นอกจากเอกสารราชการที่ Dooform มีให้ใช้งานแล้ว คุณยังสามารถใช้ syntax จาก Dooform จัดการเอกสารที่มีอยู่ในระบบของคุณได้',
    cta: 'ตัวอย่างงาน',
  },
  {
    icon: imgCodeXml,
    title: 'Developer Friendly',
    description: 'Business API Webhook ออกแบบมาเพื่อให้นักพัฒนาเชื่อมต่อกับ Dooform ได้ง่ายมากยิ่งขึ้น',
    cta: 'API Reference',
  },
  {
    icon: imgZap,
    title: 'ประมวลผลไว',
    description: 'หากธุรกิจของคุณต้องจัดการเอกสารและส่งออกเป็นจำนวนมาก คุณสามารถเรียก API เพื่อสร้างไฟล์ได้มากถึง 1,000 รายการ/10 seconds',
    cta: 'ดูกราฟวัดประสิทธิภาพ',
  },
];

export default function Features() {
  return (
    <section className="flex flex-col gap-6 items-center justify-center py-8">
      {/* Header */}
      <div className="max-w-[1280px] w-full px-4 lg:px-6 flex items-center justify-between">
        <h2 className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[20px] lg:text-[36px] text-black">
          ดูฟอร์มทำอะไรได้บ้าง
        </h2>
        <a href="#" className="flex items-center gap-0.5 text-[#424242] text-[14px] font-['IBM_Plex_Sans_Thai'] hover:underline">
          ดู Use Case
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </a>
      </div>

      {/* Mobile Feature Cards - Horizontal scroll */}
      <div className="lg:hidden w-full overflow-x-auto px-4">
        <div className="flex gap-2.5 w-max">
          {features.map((feature, i) => (
            <div
              key={i}
              className="w-[137px] p-4 bg-white border border-[#e5e5e5] rounded-[16px] flex flex-col gap-[29px] items-end justify-center flex-shrink-0"
            >
              <div className="flex flex-col gap-0.5 items-start w-full text-black text-center">
                <p className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[16px] w-full">
                  {feature.title}
                </p>
                {feature.description && (
                  <p className="font-['IBM_Plex_Sans_Thai'] text-[12px] leading-[17px] w-full">
                    {feature.description}
                  </p>
                )}
              </div>
              <div className="w-[65px] h-[65px]">
                <img src={feature.icon} alt={feature.title} className="w-full h-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Feature Cards Grid */}
      <div className="hidden lg:block max-w-[1280px] w-full px-6">
        {/* Row 1 */}
        <div className="flex h-[333px]">
          {desktopFeatures.slice(0, 3).map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </div>
        {/* Row 2 */}
        <div className="flex h-[333px]">
          {desktopFeatures.slice(3, 6).map((feature, i) => (
            <FeatureCard key={i + 3} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description, cta }: {
  icon: string;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <div className="flex-1 flex flex-col h-full justify-between px-6 py-9">
      {/* Content */}
      <div className="flex flex-col gap-3">
        {/* Icon */}
        <div className="w-16 h-16">
          <img src={icon} alt={title} className="w-full h-full" />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-0.5 text-[#262626]">
          <h3 className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[24px] leading-[29px]">
            {title}
          </h3>
          <p className="font-['IBM_Plex_Sans_Thai'] text-[16px]">
            {description}
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <button className="h-8 px-1.5 bg-[#262626] rounded-full flex items-center justify-center w-fit hover:bg-[#262626]/90 transition-colors">
        <span className="px-1.5 font-['IBM_Plex_Sans_Thai'] font-medium text-[12px] text-[#fcfcfc]">
          {cta}
        </span>
      </button>
    </div>
  );
}
