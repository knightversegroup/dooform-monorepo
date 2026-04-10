/**
 * CTA Form Section - From Figma
 * Desktop: Centered form with title
 * Mobile: Full-width with gradient image above, centered content
 */

export default function CTAForm() {
  return (
    <section className="py-8 lg:py-9">
      {/* Mobile: Gradient Image */}
      <div className="lg:hidden flex flex-col items-center mb-0">
        <div className="w-[calc(100%-32px)] h-[250px] rounded-[12px] bg-gradient-to-b from-[#d9d9d9] to-white" />
      </div>

      <div className="max-w-[1280px] mx-auto flex flex-col gap-6 lg:gap-9 items-center px-4">
        {/* Header */}
        <div className="flex flex-col gap-0.5 items-center text-center text-black w-full">
          <h2 className="font-['IBM_Plex_Sans_Thai'] font-semibold text-[24px] leading-[29px]">
            <span className="lg:hidden">กรอกฟอร์มไม่ใช่เรื่องยากอีกต่อไป</span>
            <span className="hidden lg:inline">ทดลองใช้งานฟรี</span>
          </h2>
          <p className="font-['IBM_Plex_Sans_Thai'] text-[14px] lg:text-[16px]">
            <span className="lg:hidden">ให้การกรอกฟอร์มไม่เป็นเรื่องยากอีกต่อไป</span>
            <span className="hidden lg:inline">เพียงสมัครสมาชิกและกรอกข้อมูลได้ทันที</span>
          </p>
        </div>

        {/* Mobile CTA Buttons */}
        <div className="flex gap-2 items-center lg:hidden">
          <button className="px-3 py-1.5 bg-[#2c2585] rounded-full flex items-center justify-center hover:bg-[#3d34a0] transition-colors">
            <span className="font-['IBM_Plex_Sans_Thai'] text-[14px] text-white">
              ทดลองใช้งาน
            </span>
          </button>
          <button className="px-3 py-1.5 bg-[#e4e4e4] rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
            <span className="font-['IBM_Plex_Sans_Thai'] text-[14px] text-black">
              ดูราคา
            </span>
          </button>
        </div>

        {/* Desktop Form */}
        <div className="hidden lg:flex flex-col gap-6 items-center w-[295px]">
          {/* Input Fields */}
          <div className="flex flex-col gap-1.5 w-full">
            <input
              type="text"
              placeholder="ชื่อ – นามสกุล"
              className="
                w-full p-2.5
                rounded-[12px] border-[1.5px] border-[#c9c1b6] bg-white
                font-['IBM_Plex_Sans_Thai'] text-[12px] text-[#262626]
                placeholder:text-[#262626]
                focus:outline-none focus:border-[#2c2585]
                transition-colors
              "
            />
            <input
              type="email"
              placeholder="อีเมล"
              className="
                w-full p-2.5
                rounded-[12px] border-[1.5px] border-[#c9c1b6] bg-white
                font-['IBM_Plex_Sans_Thai'] text-[12px] text-[#262626]
                placeholder:text-[#262626]
                focus:outline-none focus:border-[#2c2585]
                transition-colors
              "
            />
            <input
              type="password"
              placeholder="รหัสผ่าน"
              className="
                w-full p-2.5
                rounded-[12px] border-[1.5px] border-[#c9c1b6] bg-white
                font-['IBM_Plex_Sans_Thai'] text-[12px] text-[#262626]
                placeholder:text-[#262626]
                focus:outline-none focus:border-[#2c2585]
                transition-colors
              "
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 items-center">
            <button className="h-8 px-1.5 bg-[#262626] rounded-full flex items-center justify-center hover:bg-[#262626]/90 transition-colors">
              <span className="px-1.5 font-['IBM_Plex_Sans_Thai'] font-medium text-[12px] text-[#fcfcfc]">
                สมัครสมาชิก
              </span>
            </button>
            <button className="h-8 px-1.5 bg-[#fcfcfc] rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
              <span className="px-1.5 font-['IBM_Plex_Sans_Thai'] font-medium text-[12px] text-[#262626]">
                มีบัญชีผู้ใช้แล้ว?
              </span>
            </button>
          </div>
        </div>

        {/* Footer Note - Desktop only */}
        <p className="hidden lg:block font-['IBM_Plex_Sans_Thai'] text-[12px] text-[#737373]">
          การสมัครสมาชิกถือว่าคุณได้ยินยอมให้มีการเก็บข้อมูลในการใช้งาน
        </p>
      </div>
    </section>
  );
}
