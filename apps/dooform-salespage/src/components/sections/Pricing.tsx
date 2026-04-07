/**
 * Section: Pricing - Exact match from Figma
 * - Background: #f7f7f7
 * - Card dimensions: 250px width
 * - Card height: 400px for Enterprise, auto for others
 * - Gap: 24px between cards
 * - Border radius: 12px
 * - Plus card: shadow and border-6
 */

// Icon components for features
const ClipboardIcon = () => (
  <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9h6m-6 4h6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M3 3v5h5M3 8a9 9 0 1018 0 9 9 0 00-18 0z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const WandIcon = () => (
  <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M17.8 6.2L19 5M3 21l9-9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ScanIcon = () => (
  <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M2 8V6a2 2 0 012-2h4M2 16v2a2 2 0 002 2h4M16 4h4a2 2 0 012 2v2M16 20h4a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const WebhookIcon = () => (
  <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M18 16.98h-5.99c-1.1 0-1.95.68-2.42 1.5M9 9l-5 9M15 9l5 9M12 2a5 5 0 015 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface FeatureItem {
  icon: React.ReactNode;
  text: string;
  isGradient?: boolean;
}

interface PricingPlan {
  name: string;
  nameGradient?: boolean;
  price: string;
  period: string;
  features: FeatureItem[];
  cta: string;
  highlighted?: boolean;
}

const plans: PricingPlan[] = [
  {
    name: 'Trial',
    price: '฿0',
    period: '/ 1 ผู้ใช้งาน',
    features: [
      { icon: <ClipboardIcon />, text: 'กรอกเอกสารพื้นฐานได้ 5 รายการ' },
      { icon: <UsersIcon />, text: 'ไม่มีผู้ใช้งานในทีม' },
      { icon: <HistoryIcon />, text: 'ไม่สามารถเรียกดูข้อมูลย้อนหลังได้' },
    ],
    cta: 'ทดลองใช้งาน',
  },
  {
    name: 'Starter',
    price: '฿2,490',
    period: '/ 10 ผู้ใช้งานต่อเดือน',
    features: [
      { icon: <ClipboardIcon />, text: 'กรอกเอกสารพื้นฐานได้ 500 รายการ/เดือน' },
      { icon: <UsersIcon />, text: 'มีผู้ใช้งานในทีมได้มากสุด 10 คน' },
      { icon: <HistoryIcon />, text: 'เรียกดูข้อมูลที่เก็บไว้ได้มากสุด 90 วัน' },
    ],
    cta: 'ชำระเงิน',
  },
  {
    name: 'Plus',
    nameGradient: true,
    price: '฿4,990',
    period: '/ 10 ผู้ใช้งานต่อเดือน',
    features: [
      { icon: <ClipboardIcon />, text: 'กรอกเอกสารพื้นฐานได้ไม่จำกัด' },
      { icon: <UsersIcon />, text: 'มีผู้ใช้งานในทีมได้มากสุด 10 คน' },
      { icon: <HistoryIcon />, text: 'เรียกดูข้อมูลที่เก็บไว้ได้มากสุด 1 ปี' },
      { icon: <WandIcon />, text: 'มี AI ช่วยตรวจสอบข้อมูล', isGradient: true },
      { icon: <ScanIcon />, text: 'มีระบบตรวจจับข้อความอัตโนมัติ' },
      { icon: <ClipboardIcon />, text: 'เพิ่มเอกสารใช้งานในองค์กรได้ 10 ชุด' },
    ],
    cta: 'ชำระเงิน',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Contact us',
    period: 'ไม่จำกัดผู้ใช้งานต่อเดือน',
    features: [
      { icon: <ClipboardIcon />, text: 'กรอกเอกสารพื้นฐานได้ไม่จำกัด' },
      { icon: <UsersIcon />, text: 'มีผู้ใช้งานในทีมได้ไม่จำกัด' },
      { icon: <HistoryIcon />, text: 'เรียกดูข้อมูลที่เก็บไว้ไดไม่จำกัดระยะเวลา' },
      { icon: <WandIcon />, text: 'มี AI ช่วยตรวจสอบข้อมูล', isGradient: true },
      { icon: <ScanIcon />, text: 'มีระบบตรวจจับข้อความอัตโนมัติ' },
      { icon: <ClipboardIcon />, text: 'สามารถสร้างเอกสารสำหรับองค์กรได้ไม่จำกัด' },
      { icon: <WebhookIcon />, text: 'Enterprise-level API Webhooks' },
    ],
    cta: 'ติดต่อ',
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-[#f7f7f7] rounded-t-[24px]">
      <div className="mx-auto max-w-[1280px] py-9 px-4">
        {/* Section Header */}
        <div className="text-center mb-9">
          <h2 className="font-ibm-plex-thai font-semibold text-[24px] leading-[29px] text-onyx">
            แพ็คเกจใช้งาน
          </h2>
          <p className="font-ibm-plex-thai text-[16px] text-onyx mt-0.5">
            สามารถเลือกแพ็กเกจการใช้งานได้ตามความต้องการ
          </p>
        </div>

        {/* Pricing Cards - gap 24px */}
        <div className="flex flex-wrap justify-center gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`w-[250px] rounded-[12px] p-4 flex flex-col justify-between ${
                plan.highlighted
                  ? 'bg-white border-[6px] border-primary-navy shadow-[0px_2px_16px_0px_rgba(0,0,0,0.25)]'
                  : 'bg-white border border-[#e6e6e6]'
              } ${plan.name === 'Enterprise' ? 'h-[400px]' : ''}`}
            >
              {/* Plan Info */}
              <div className="flex flex-col gap-2">
                {/* Plan Name & Price */}
                <div className="flex flex-col gap-px">
                  <p className={`font-ibm-plex-thai font-semibold text-[16px] ${
                    plan.nameGradient
                      ? 'bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent'
                      : 'text-onyx'
                  }`}>
                    {plan.name}
                  </p>
                  <div className="flex flex-col pb-[3px]">
                    <p className="font-ibm-plex-thai font-semibold text-[24px] text-onyx">
                      {plan.price}
                    </p>
                    <p className="font-ibm-plex-thai text-[12px] text-black">
                      {plan.period}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-col gap-1">
                  <p className="font-ibm-plex-thai font-semibold text-[12px] text-black">
                    ฟีเจอร์ทั้งหมด
                  </p>
                  <div className="flex flex-col gap-2">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex gap-1 items-center">
                        <span className="text-black">{feature.icon}</span>
                        <p className={`font-ibm-plex-thai text-[12px] leading-[17px] ${
                          feature.isGradient
                            ? 'bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent'
                            : 'text-black'
                        }`}>
                          {feature.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Button - Figma: h-32px, rounded-100px, bg-#262626 */}
              <button
                className="h-8 px-1.5 bg-onyx rounded-full flex items-center justify-center mt-4 hover:bg-onyx-100 transition-colors"
              >
                <span className="px-1.5 font-ibm-plex-thai font-medium text-[12px] text-[#fcfcfc]">
                  {plan.cta}
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <p className="text-center font-ibm-plex-thai text-[12px] text-carbon-100 mt-6">
          แพ็กเกจทั้งหมดเรียกเก็บเงินเป็นรายเดือน ทุกราคา ฿THB
        </p>
      </div>
    </section>
  );
}
