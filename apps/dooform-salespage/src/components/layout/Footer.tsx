/**
 * Footer - From Figma
 * Desktop: Multi-column footer with links
 * Mobile: Stacked accordion-style sections for easy navigation
 */

'use client';

import { useState } from 'react';

// TODO: Replace with actual logo image
const imgLogo = "https://www.figma.com/api/mcp/asset/d998ad5d-456a-47bd-a05e-3df4053a4520";

const footerSections = [
  {
    heading: 'สมาชิก',
    links: [
      { label: 'สมาชิกระดับองค์กร', href: '#' },
      { label: 'เข้าสู่ระบบ', href: '#' },
      { label: 'สมัครสมาชิก', href: '#' },
    ],
  },
  {
    heading: 'เกี่ยวกับแอปพลิเคชั่น',
    links: [
      { label: 'รายการเอกสาร', href: '#' },
      { label: 'คำแนะนำในการใช้งาน', href: '#' },
      { label: 'เอกสารประกอบการใช้งาน', href: '#' },
      { label: 'รายงานวิเคราะห์คุณภาพ', href: '#' },
      { label: 'ทีมพัฒนา', href: '#' },
      { label: 'เกี่ยวกับเว็บไซต์', href: '#' },
    ],
  },
  {
    heading: 'สำหรับหน่วยงานธุรกิจ',
    links: [
      { label: 'แพลนสำหรับหน่วยงาน', href: '#' },
      { label: 'ค่าบริการ', href: '#' },
      { label: 'ติดต่อสอบถาม', href: '#' },
    ],
  },
  {
    heading: 'ข้อบังคับทางกฎหมาย',
    links: [
      { label: 'ข้อตกลงในการใช้งาน', href: '#' },
      { label: 'นโยบายการจัดเก็บข้อมูล', href: '#' },
    ],
  },
];

export default function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (heading: string) => {
    setOpenSection(openSection === heading ? null : heading);
  };

  return (
    <footer>
      {/* Mobile Footer */}
      <div className="lg:hidden bg-[#f7f7f7]">
        <div className="px-4 py-8">
          {/* Logo & Copyright */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="h-6 w-[124px]">
              <img src={imgLogo} alt="Dooform" className="h-full w-auto" />
            </div>
            <p className="font-['IBM_Plex_Sans_Thai'] text-[14px] text-[#4d4d4d] leading-normal">
              © 2025 Dooform by Knight Consultant
              <br />
              Under License of Rinkai
            </p>
          </div>

          {/* Accordion Sections */}
          <div className="flex flex-col border-t border-[#e5e5e5]">
            {footerSections.map((section) => (
              <div key={section.heading} className="border-b border-[#e5e5e5]">
                <button
                  onClick={() => toggleSection(section.heading)}
                  className="w-full flex items-center justify-between py-4"
                >
                  <span className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[14px] text-[#262626]">
                    {section.heading}
                  </span>
                  <svg
                    className={`w-4 h-4 text-[#262626] transition-transform duration-200 ${
                      openSection === section.heading ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openSection === section.heading && (
                  <div className="pb-4 flex flex-col gap-3">
                    {section.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        className="font-['IBM_Plex_Sans_Thai'] text-[14px] text-[#4d4d4d] hover:text-[#2c2585] transition-colors pl-2"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Company Link */}
          <div className="mt-6">
            <a href="#" className="flex gap-1 items-center hover:text-[#2c2585] transition-colors">
              <p className="font-['IBM_Plex_Sans_Thai'] text-[12px] text-[#4d4d4d]">
                knight consultant worldwide company limited
              </p>
              <svg
                className="w-3 h-3 text-[#4d4d4d]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
          </div>

          {/* Terms Notice */}
          <p className="font-['IBM_Plex_Sans_Thai'] text-[12px] text-[#737373] mt-4">
            การใช้งานเว็บไซต์นี้นับว่าคุณได้ยอมรับเงื่อนไขในการใช้งานเรียบร้อย
          </p>
        </div>
      </div>

      {/* Desktop Footer */}
      <div className="hidden lg:block rounded-t-[12px] px-2.5">
        <div className="max-w-[1280px] mx-auto px-6 py-9 rounded-[28px]">
          {/* Main Footer Content */}
          <div className="flex flex-col gap-6">
            {/* Top Row: Logo/Info + Links */}
            <div className="flex justify-between">
              {/* Logo & Copyright */}
              <div className="flex flex-col gap-3">
                {/* Logo */}
                <div className="h-6 w-[124px]">
                  <img src={imgLogo} alt="Dooform" className="h-full w-auto" />
                </div>
                {/* Copyright */}
                <div className="w-[274px]">
                  <p className="font-['IBM_Plex_Sans_Thai'] text-[16px] text-[#4d4d4d] leading-normal">
                    © 2025 Dooform by Knight Consultant
                    <br />
                    Under License of Rinkai
                  </p>
                </div>
              </div>

              {/* Link Columns */}
              <div className="flex gap-6">
                {footerSections.map((section) => (
                  <div key={section.heading} className="flex flex-col gap-2">
                    {/* Section Heading */}
                    <p className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[16px] text-[#262626]">
                      {section.heading}
                    </p>
                    {/* Links */}
                    {section.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        className="font-['IBM_Plex_Sans_Thai'] text-[16px] text-[#262626] hover:text-[#2c2585] transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex items-end justify-between">
              {/* Company Link */}
              <a href="#" className="flex gap-1 items-center hover:text-[#2c2585] transition-colors">
                <p className="font-['IBM_Plex_Sans_Thai'] text-[14px] text-[#4d4d4d]">
                  knight consultant worldwide company limited
                </p>
                {/* Arrow Up Right Icon */}
                <svg
                  className="w-3 h-3 text-[#4d4d4d]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </a>

              {/* Terms Notice */}
              <p className="font-['IBM_Plex_Sans_Thai'] text-[14px] text-[#4d4d4d]">
                การใช้งานเว็บไซต์นี้นับว่าคุณได้ยอมรับเงื่อนไขในการใช้งานเรียบร้อย
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
