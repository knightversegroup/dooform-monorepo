import Image from 'next/image';
import Link from 'next/link';

/**
 * Hero Section based on Figma design
 * Main Container: 1511px × 860px
 * Background: #2C2585 (Primary Navy)
 * Content Width: 582px
 */
export default function HeroMain() {
  return (
    <section
      className="relative bg-primary-navy min-h-[860px] overflow-hidden"
      aria-label="Hero section"
    >
      {/* Main Container with Figma padding */}
      <div
        className="
          flex items-center
          pl-[94px] pr-4 py-16
          lg:py-hero-vertical
          max-w-full-width mx-auto
        "
      >
        {/* Content Wrapper - Left Side */}
        <div className="flex flex-col justify-center w-full max-w-[582px] min-h-[732px] gap-6">

          {/* Action Block */}
          <div className="flex flex-col gap-[78px]">

            {/* Typography Group */}
            <div className="flex flex-col gap-1">
              {/* Main Headline - from Figma */}
              <h1
                className="
                  font-ibm-plex-thai font-semibold
                  text-[36px] leading-[43px]
                  text-grey-98
                "
              >
                กรอกฟอร์มไม่ใช่เรื่อง
                <br />
                ยากอีกต่อไป
              </h1>

              {/* Sub-headline - from Figma */}
              <p
                className="
                  font-ibm-plex font-medium
                  text-[24px] leading-normal
                  text-white
                  mt-1
                "
              >
                ดูฟอร์ม ผู้ช่วยกรอกเอกสารราชการได้อย่างรวดเร็ว
              </p>
            </div>

            {/* Hero CTA Button */}
            <Link
              href="/trial"
              className="
                inline-flex items-center justify-center
                w-fit h-[48px] px-[14px]
                bg-white rounded-pill
                font-ibm-plex-thai font-medium
                text-[16px] leading-[26px]
                text-black
                hover:bg-grey-98 transition-colors
                focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-navy
              "
            >
              <span className="px-1.5">ทดลองใช้งาน</span>
            </Link>
          </div>
        </div>

        {/* Visual Asset - Right Side - Figma: border-11 solid #d6d6d6, border-radius 19px */}
        <div className="hidden lg:block flex-1 ml-[15px]">
          <div className="relative w-full max-w-[1183px]">
            <div className="border-[11px] border-[#d6d6d6] rounded-[19px] overflow-hidden">
              <Image
                src="/Homepage_preview.png"
                alt="ตัวอย่างหน้าจอการกรอกเอกสารด้วย Dooform"
                width={1183}
                height={732}
                className="object-cover w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration (optional) */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        {/* Add any background patterns or gradients here */}
      </div>
    </section>
  );
}
