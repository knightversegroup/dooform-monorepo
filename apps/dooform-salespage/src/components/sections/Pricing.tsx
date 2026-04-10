/**
 * Pricing Section - From Figma
 * Desktop: Title 24px, 4 cards in horizontal row
 * Mobile: Title 20px, horizontal scrolling cards (250px width)
 * Plus card: Mesh gradient border and text
 */

// TODO: Replace with actual icon images
const imgClipboard = "https://www.figma.com/api/mcp/asset/bea37d82-e322-4821-a384-414f031546d3";
const imgUsers = "https://www.figma.com/api/mcp/asset/e4da59e2-0125-4605-80a6-3b4199dd61ba";
const imgHistory = "https://www.figma.com/api/mcp/asset/484bac40-29dc-4f9e-94e4-8e83ceccc43f";
const imgWand = "https://www.figma.com/api/mcp/asset/fec9d8f5-0d1f-48fa-9a6b-a2d997a2d8d2";
const imgScanEye = "https://www.figma.com/api/mcp/asset/896b21a2-72e1-4479-8881-127eeb96f2d1";
const imgWebhook = "https://www.figma.com/api/mcp/asset/7c574b50-7709-4da4-b25b-ae54693149b2";

// Mesh gradient style for Plus card (pink-coral, yellow-orange, light-blue)
const meshGradientStyle = {
  background: `
    radial-gradient(circle at 0% 50%, #F8A89A 0%, transparent 50%),
    radial-gradient(circle at 100% 20%, #7DD3FC 0%, transparent 50%),
    radial-gradient(circle at 50% 100%, #FFE066 0%, transparent 60%),
    linear-gradient(135deg, #FFD6CC 0%, #FFF5E6 50%, #E6F4FF 100%)
  `,
};

// Text gradient style
const textGradientStyle = {
  background: `
    radial-gradient(circle at 0% 50%, #F8A89A 0%, transparent 50%),
    radial-gradient(circle at 100% 20%, #7DD3FC 0%, transparent 50%),
    radial-gradient(circle at 50% 100%, #FFE066 0%, transparent 60%),
    linear-gradient(135deg, #F8A89A 0%, #FFE066 50%, #7DD3FC 100%)
  `,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

interface Feature {
  icon: string;
  text: string;
  gradient?: boolean;
}

interface Plan {
  name: string;
  nameGradient?: boolean;
  price: string;
  period: string;
  features: Feature[];
  cta: string;
  highlighted?: boolean;
  fixedHeight?: boolean;
}

const plans: Plan[] = [
  {
    name: 'Trial',
    price: '฿0',
    period: '/ 1 ผู้ใช้งาน',
    features: [
      { icon: imgClipboard, text: 'กรอกเอกสารพื้นฐานได้ 5 รายการ' },
      { icon: imgUsers, text: 'ไม่มีผู้ใช้งานในทีม' },
      { icon: imgHistory, text: 'ไม่สามารถเรียกดูข้อมูลย้อนหลังได้' },
    ],
    cta: 'ทดลองใช้งาน',
  },
  {
    name: 'Starter',
    price: '฿2,490',
    period: '/ 10 ผู้ใช้งานต่อเดือน',
    features: [
      { icon: imgClipboard, text: 'กรอกเอกสารพื้นฐานได้ 500 รายการ/เดือน' },
      { icon: imgUsers, text: 'มีผู้ใช้งานในทีมได้มากสุด 10 คน' },
      { icon: imgHistory, text: 'เรียกดูข้อมูลที่เก็บไว้ได้มากสุด 90 วัน' },
    ],
    cta: 'ชำระเงิน',
  },
  {
    name: 'Plus',
    nameGradient: true,
    price: '฿4,990',
    period: '/ 10 ผู้ใช้งานต่อเดือน',
    features: [
      { icon: imgClipboard, text: 'กรอกเอกสารพื้นฐานได้ไม่จำกัด' },
      { icon: imgUsers, text: 'มีผู้ใช้งานในทีมได้มากสุด 10 คน' },
      { icon: imgHistory, text: 'เรียกดูข้อมูลที่เก็บไว้ได้มากสุด 1 ปี' },
      { icon: imgWand, text: 'มี AI ช่วยตรวจสอบข้อมูล', gradient: true },
      { icon: imgScanEye, text: 'มีระบบตรวจจับข้อความอัตโนมัติ' },
      { icon: imgClipboard, text: 'เพิ่มเอกสารใช้งานในองค์กรได้ 10 ชุด' },
    ],
    cta: 'ชำระเงิน',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Contact us',
    period: 'ไม่จำกัดผู้ใช้งานต่อเดือน',
    features: [
      { icon: imgClipboard, text: 'กรอกเอกสารพื้นฐานได้ไม่จำกัด' },
      { icon: imgUsers, text: 'มีผู้ใช้งานในทีมได้ไม่จำกัด' },
      { icon: imgHistory, text: 'เรียกดูข้อมูลที่เก็บไว้ไดไม่จำกัดระยะเวลา' },
      { icon: imgWand, text: 'มี AI ช่วยตรวจสอบข้อมูล', gradient: true },
      { icon: imgScanEye, text: 'มีระบบตรวจจับข้อความอัตโนมัติ' },
      { icon: imgClipboard, text: 'สามารถสร้างเอกสารสำหรับองค์กรได้ไม่จำกัด' },
      { icon: imgWebhook, text: 'Enterprise-level API Webhooks' },
    ],
    cta: 'ติดต่อ',
    fixedHeight: true,
  },
];

// Plus Card with gradient border wrapper
function PlusCard({ plan }: { plan: Plan }) {
  return (
    <div
      className="w-[250px] rounded-[12px] p-[6px] flex-shrink-0 lg:flex-shrink shadow-[0px_2px_16px_0px_rgba(0,0,0,0.25)]"
      style={meshGradientStyle}
    >
      <div className="bg-white rounded-[8px] p-4 flex flex-col justify-between h-full">
        {/* Plan Info */}
        <div className="flex flex-col gap-2">
          {/* Plan Name & Price */}
          <div className="flex flex-col gap-px">
            <p
              className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[16px]"
              style={textGradientStyle}
            >
              {plan.name}
            </p>
            <div className="flex flex-col pb-[3px]">
              <p className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[24px] text-[#262626]">
                {plan.price}
              </p>
              <p className="font-['IBM_Plex_Sans_Thai'] text-[12px] text-black">
                {plan.period}
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-1">
            <p className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[12px] text-black">
              ฟีเจอร์ทั้งหมด
            </p>
            <div className="flex flex-col gap-2">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex gap-1 items-center">
                  <img src={feature.icon} alt="" className="w-3 h-3 flex-shrink-0" />
                  <p
                    className="font-['IBM_Plex_Sans_Thai'] text-[12px] leading-[17px]"
                    style={feature.gradient ? textGradientStyle : { color: 'black' }}
                  >
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button className="h-8 px-1.5 bg-[#262626] rounded-full flex items-center justify-center mt-4 hover:bg-[#262626]/90 transition-colors">
          <span className="px-1.5 font-['IBM_Plex_Sans_Thai'] font-medium text-[12px] text-[#fcfcfc]">
            {plan.cta}
          </span>
        </button>
      </div>
    </div>
  );
}

// Regular Card
function RegularCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={`
        w-[250px] rounded-[12px] p-4 flex flex-col justify-between bg-white flex-shrink-0 lg:flex-shrink
        border border-[#e6e6e6]
        ${plan.fixedHeight ? 'h-[400px]' : ''}
      `}
    >
      {/* Plan Info */}
      <div className="flex flex-col gap-2">
        {/* Plan Name & Price */}
        <div className="flex flex-col gap-px">
          <p className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[16px] text-[#262626]">
            {plan.name}
          </p>
          <div className="flex flex-col pb-[3px]">
            <p className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[24px] text-[#262626]">
              {plan.price}
            </p>
            <p className="font-['IBM_Plex_Sans_Thai'] text-[12px] text-black">
              {plan.period}
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-col gap-1">
          <p className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[12px] text-black">
            ฟีเจอร์ทั้งหมด
          </p>
          <div className="flex flex-col gap-2">
            {plan.features.map((feature, idx) => (
              <div key={idx} className="flex gap-1 items-center">
                <img src={feature.icon} alt="" className="w-3 h-3 flex-shrink-0" />
                <p
                  className="font-['IBM_Plex_Sans_Thai'] text-[12px] leading-[17px]"
                  style={feature.gradient ? textGradientStyle : { color: 'black' }}
                >
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button className="h-8 px-1.5 bg-[#262626] rounded-full flex items-center justify-center mt-4 hover:bg-[#262626]/90 transition-colors">
        <span className="px-1.5 font-['IBM_Plex_Sans_Thai'] font-medium text-[12px] text-[#fcfcfc]">
          {plan.cta}
        </span>
      </button>
    </div>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="bg-[#f7f7f7] rounded-t-[12px] lg:rounded-t-[24px]">
      <div className="max-w-[1280px] mx-auto py-8 lg:py-9 flex flex-col gap-6 lg:gap-9">
        {/* Header */}
        <div className="px-4 lg:px-0 flex items-center justify-between lg:justify-center">
          <h2 className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[20px] lg:text-[24px] text-black lg:text-center">
            แพ็คเกจใช้งาน
          </h2>
          <a href="#" className="flex items-center gap-0.5 text-[#424242] text-[14px] font-['IBM_Plex_Sans_Thai'] hover:underline lg:hidden">
            ดู Use Case
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </a>
        </div>

        {/* Desktop subtitle */}
        <p className="hidden lg:block font-['IBM_Plex_Sans_Thai'] text-[16px] text-[#262626] text-center -mt-6">
          สามารถเลือกแพ็กเกจการใช้งานได้ตามความต้องการ
        </p>

        {/* Pricing Cards */}
        <div className="overflow-x-auto lg:overflow-visible px-4 lg:px-0">
          <div className="flex gap-6 w-max lg:w-auto lg:justify-center">
            {plans.map((plan) =>
              plan.highlighted ? (
                <PlusCard key={plan.name} plan={plan} />
              ) : (
                <RegularCard key={plan.name} plan={plan} />
              )
            )}
          </div>
        </div>

        {/* Footer Note */}
        <p className="font-['IBM_Plex_Sans_Thai'] text-[12px] text-[#737373] text-center px-4">
          แพ็กเกจทั้งหมดเรียกเก็บเงินเป็นรายเดือน ทุกราคา ฿THB
        </p>
      </div>
    </section>
  );
}
