/**
 * Section 5-8: Feature Sections
 * - Navy header (#2C2585) at top
 * - White body
 * - Font: IBM Plex Sans Thai, SemiBold, sizes 36/24/16/12
 * - Feature card dimensions: 410px × 333px (from Figma)
 */

interface FeatureItem {
  icon: string; // placeholder for now
  title: string;
  description: string;
}

interface FeatureSectionProps {
  headerTitle: string;
  headerSubtitle?: string;
  features: FeatureItem[];
  columns?: 2 | 3;
  showHeader?: boolean;
}

export default function FeatureSection({
  headerTitle,
  headerSubtitle,
  features,
  columns = 3,
  showHeader = true,
}: FeatureSectionProps) {
  return (
    <section className="overflow-hidden">
      {/* Navy Header */}
      {showHeader && (
        <div className="bg-primary-navy py-12">
          <div className="mx-auto max-w-container px-4 text-center">
            <h2 className="font-ibm-plex-thai font-semibold text-section-title text-white">
              {headerTitle}
            </h2>
            {headerSubtitle && (
              <p className="font-ibm-plex-thai text-[24px] text-white/80 mt-2">
                {headerSubtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* White Body */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-container px-4">
          <div className={`grid gap-6 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'} md:grid-cols-2 sm:grid-cols-1`}>
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-card border border-stroke hover:shadow-card transition-shadow">
                {/* Icon placeholder */}
                <div className="mx-auto mb-4 h-16 w-16 bg-sand-light rounded-full flex items-center justify-center text-carbon text-xs">
                  {/* TODO: Add icon */}
                  Icon
                </div>
                <h3 className="font-ibm-plex-thai font-semibold text-[24px] text-onyx mb-2">
                  {feature.title}
                </h3>
                <p className="font-ibm-plex-thai text-section-subtitle text-carbon">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Section 5: ใช้งานได้ทุกความต้องการ
 */
export function HowItWorks() {
  const steps = [
    { number: 1, title: 'อัปโหลดเอกสาร', description: 'เลือกเอกสารที่ต้องการกรอก' },
    { number: 2, title: 'กรอกข้อมูล', description: 'ระบบช่วยกรอกอัตโนมัติ' },
    { number: 3, title: 'ดาวน์โหลด', description: 'รับไฟล์ที่เสร็จสมบูรณ์' },
  ];

  return (
    <section className="bg-white py-section-y">
      <div className="mx-auto max-w-container px-4">
        <div className="text-center mb-12">
          <p className="font-ibm-plex-thai text-section-subtitle text-carbon mb-2">
            ใช้งานได้ทุกความต้องการที่จำเป็น
          </p>
          <h2 className="font-ibm-plex-thai font-semibold text-section-title text-onyx">
            ขั้นตอนการใช้งาน
          </h2>
        </div>

        {/* Steps */}
        <div className="flex justify-center items-start gap-8 flex-wrap">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center max-w-[200px]">
              <div className="h-20 w-20 bg-sand-light rounded-full flex items-center justify-center text-primary-navy font-ibm-plex-thai font-bold text-[24px] mb-4">
                {step.number}
              </div>
              <h3 className="font-ibm-plex-thai font-semibold text-[16px] text-onyx mb-1">
                {step.title}
              </h3>
              <p className="font-ibm-plex-thai text-card-body text-carbon text-center">
                {step.description}
              </p>
              {/* Connector line (except last) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute" style={{ left: '100%', top: '50%' }}>
                  {/* Arrow connector would go here */}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Section 6: ดูฟอร์มเป็นไปด้วย (Benefits)
 */
export function Benefits() {
  const benefits = [
    { title: 'ลดข้อผิดพลาดในการกรอก', description: 'ระบบตรวจสอบความถูกต้องอัตโนมัติ' },
    { title: 'ประหยัดเวลาทำงาน', description: 'กรอกเอกสารเร็วขึ้น 10 เท่า' },
    { title: 'ระบบจัดการที่ดีขึ้น', description: 'เก็บและค้นหาเอกสารได้ง่าย' },
  ];

  return (
    <section className="overflow-hidden">
      {/* Navy Header */}
      <div className="bg-primary-navy py-12">
        <div className="mx-auto max-w-container px-4 text-center">
          <h2 className="font-ibm-plex-thai font-semibold text-section-title text-white">
            ดูฟอร์มเป็นไปด้วย
          </h2>
          <p className="font-ibm-plex-thai text-[24px] text-white/80 mt-2">
            ช่วยของการจองสถานที่
          </p>
        </div>
      </div>

      {/* White Body with 3 icons */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-container px-4">
          <div className="grid grid-cols-3 gap-6 md:grid-cols-1">
            {benefits.map((benefit, i) => (
              <div key={i} className="text-center p-6">
                <div className="mx-auto mb-4 h-16 w-16 bg-sand-light rounded-full flex items-center justify-center text-primary-navy">
                  {/* Checkmark icon */}
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-ibm-plex-thai font-semibold text-[24px] text-onyx mb-2">
                  {benefit.title}
                </h3>
                <p className="font-ibm-plex-thai text-section-subtitle text-carbon">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Section 7: ดูฟอร์มทำอะไรได้บ้าง (6 features grid)
 */
export function FeatureList() {
  const features = [
    { title: 'รองรับเอกสารหลากหลาย', description: 'รองรับเอกสารมากกว่า 100+ รูปแบบที่ใช้บ่อย' },
    { title: 'Developer Friendly', description: 'รองรับ API ที่สามารถเชื่อมต่อกับระบบอื่นได้' },
    { title: 'ประหยัดเงิน', description: 'ลดค่าใช้จ่ายในการจ้างพนักงานกรอกเอกสาร' },
    { title: 'รองรับเอกสารราชการ', description: 'รองรับเอกสารทางราชการทุกประเภท' },
    { title: 'ความปลอดภัยสูง', description: 'ระบบรักษาความปลอดภัยระดับสูง' },
    { title: 'ประหยัดเวลา', description: 'ลดเวลาในการกรอกเอกสารได้มากกว่า 80%' },
  ];

  return (
    <section className="bg-white py-section-y">
      <div className="mx-auto max-w-container px-4">
        <h2 className="font-ibm-plex-thai font-semibold text-section-title text-onyx text-center mb-12">
          ดูฟอร์มทำอะไรได้บ้าง
        </h2>

        <div className="grid grid-cols-3 gap-6 md:grid-cols-2 sm:grid-cols-1">
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-card hover:bg-sand-light transition-colors">
              <div className="flex-shrink-0 h-8 w-8 bg-primary-navy rounded-full flex items-center justify-center">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-ibm-plex-thai font-semibold text-card-title text-onyx mb-1">
                  {feature.title}
                </h3>
                <p className="font-ibm-plex-thai text-card-body text-carbon">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Section 8: ลดต้นทุน
 */
export function CostSaving() {
  return (
    <section className="bg-white py-section-y">
      <div className="mx-auto max-w-container px-4 text-center">
        <h2 className="font-ibm-plex-thai font-semibold text-section-title text-onyx mb-4">
          ดูฟอร์มช่วยลดต้นทุนให้กับธุรกิจอย่างไร
        </h2>
        <p className="font-ibm-plex-thai text-section-subtitle text-carbon mb-8 max-w-2xl mx-auto">
          เปรียบเทียบต้นทุนการจ้างพนักงานกับการใช้ Dooform
        </p>

        {/* Cost Comparison - Placeholder with structure */}
        <div className="flex justify-center gap-8 mt-8 flex-wrap">
          {/* Traditional Method */}
          <div className="w-[300px] p-6 rounded-card border border-stroke bg-white">
            <h3 className="font-ibm-plex-thai font-semibold text-[18px] text-carbon mb-4">วิธีดั้งเดิม</h3>
            <div className="space-y-3">
              <div className="flex justify-between font-ibm-plex-thai text-card-body">
                <span className="text-carbon">เงินเดือนพนักงาน</span>
                <span className="text-onyx font-medium">฿15,000/เดือน</span>
              </div>
              <div className="flex justify-between font-ibm-plex-thai text-card-body">
                <span className="text-carbon">ค่าใช้จ่ายอื่นๆ</span>
                <span className="text-onyx font-medium">฿5,000/เดือน</span>
              </div>
              <div className="border-t border-stroke pt-3 flex justify-between font-ibm-plex-thai">
                <span className="text-carbon font-medium">รวม</span>
                <span className="text-onyx font-bold text-[18px]">฿20,000/เดือน</span>
              </div>
            </div>
          </div>

          {/* Dooform */}
          <div className="w-[300px] p-6 rounded-card border-2 border-primary-navy bg-sand-light">
            <h3 className="font-ibm-plex-thai font-semibold text-[18px] text-primary-navy mb-4">ใช้ Dooform</h3>
            <div className="space-y-3">
              <div className="flex justify-between font-ibm-plex-thai text-card-body">
                <span className="text-carbon">แพ็คเกจ Pro</span>
                <span className="text-onyx font-medium">฿4,990/เดือน</span>
              </div>
              <div className="flex justify-between font-ibm-plex-thai text-card-body">
                <span className="text-carbon">ค่าใช้จ่ายอื่นๆ</span>
                <span className="text-onyx font-medium">฿0</span>
              </div>
              <div className="border-t border-stroke pt-3 flex justify-between font-ibm-plex-thai">
                <span className="text-carbon font-medium">รวม</span>
                <span className="text-primary-navy font-bold text-[18px]">฿4,990/เดือน</span>
              </div>
            </div>
          </div>
        </div>

        {/* Savings highlight */}
        <div className="mt-8 inline-flex items-center gap-2 bg-primary-navy text-white px-6 py-3 rounded-pill">
          <span className="font-ibm-plex-thai font-medium">ประหยัดได้ถึง</span>
          <span className="font-ibm-plex-thai font-bold text-[24px]">75%</span>
        </div>
      </div>
    </section>
  );
}
