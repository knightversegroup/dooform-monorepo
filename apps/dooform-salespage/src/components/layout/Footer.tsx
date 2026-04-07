/**
 * Footer - Exact match from Figma
 * - Padding: 36px 24px
 * - Gap: 24px
 * - Border radius: 28px
 * - Max width: 1280px
 */

const footerSections = [
  {
    heading: 'สมาชิก',
    links: [
      'สมาชิกระดับองค์กร',
      'เข้าสู่ระบบ',
      'สมัครสมาชิก',
    ],
  },
  {
    heading: 'เกี่ยวกับแอปพลิเคชั่น',
    links: [
      'รายการเอกสาร',
      'คำแนะนำในการใช้งาน',
      'เอกสารประกอบการใช้งาน',
      'รายงานวิเคราะห์คุณภาพ',
      'ทีมพัฒนา',
      'เกี่ยวกับเว็บไซต์',
    ],
  },
  {
    heading: 'สำหรับหน่วยงานธุรกิจ',
    links: [
      'แพลนสำหรับหน่วยงาน',
      'ค่าบริการ',
      'ติดต่อสอบถาม',
    ],
  },
  {
    heading: 'ข้อบังคับทางกฎหมาย',
    links: [
      'ข้อตกลงในการใช้งาน',
      'นโยบายการจัดเก็บข้อมูล',
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-white rounded-t-[12px] px-[10px]">
      <div className="mx-auto max-w-[1280px] px-6 py-9 rounded-[28px]">
        {/* Main Footer Content - gap 24px */}
        <div className="flex flex-col gap-6">
          {/* Top Row: Logo/Info + Links */}
          <div className="flex justify-between flex-wrap gap-6">
            {/* Logo & Copyright Info */}
            <div className="flex flex-col gap-3">
              {/* Logo */}
              <div className="h-6 w-[124px]">
                <img
                  src="/logo.svg"
                  alt="Dooform"
                  className="h-full w-auto"
                />
              </div>
              {/* Copyright Text */}
              <div className="w-[274px]">
                <p className="font-ibm-plex-thai text-[16px] text-carbon leading-normal">
                  © 2025 Dooform by Knight Consultant
                  <br />
                  Under License of Rinkai
                </p>
              </div>
            </div>

            {/* Link Columns - gap 24px */}
            <div className="flex gap-6 flex-wrap">
              {footerSections.map((section) => (
                <div key={section.heading} className="flex flex-col gap-2">
                  {/* Section Heading */}
                  <p className="font-ibm-plex-thai font-semibold text-[16px] text-onyx">
                    {section.heading}
                  </p>
                  {/* Links */}
                  {section.links.map((link) => (
                    <a
                      key={link}
                      href="#"
                      className="font-ibm-plex-thai text-[16px] text-onyx hover:text-primary-navy transition-colors"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex items-end justify-between flex-wrap gap-4">
            {/* Company Link */}
            <div className="flex gap-1 items-center">
              <p className="font-ibm-plex-thai text-[14px] text-carbon">
                knight consultant worldwide company limited
              </p>
              {/* Arrow Up Right Icon - 12x12 */}
              <svg
                className="h-3 w-3 text-carbon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </div>

            {/* Terms Notice */}
            <p className="font-ibm-plex-thai text-[14px] text-carbon">
              การใช้งานเว็บไซต์นี้นับว่าคุณได้ยอมรับเงื่อนไขในการใช้งานเรียบร้อย
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
