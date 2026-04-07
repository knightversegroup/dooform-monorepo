/**
 * Section: CTA Form - Exact match from Figma
 * - Input border: #c9c1b6 1.5px
 * - Input radius: 12px
 * - Button: h-32px, rounded-100px
 */

export default function BottomCTA() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1280px] py-9">
        {/* Section Header */}
        <div className="text-center mb-9">
          <h2 className="font-ibm-plex-thai font-semibold text-[24px] leading-[29px] text-onyx">
            ทดลองใช้งานฟรี
          </h2>
          <p className="font-ibm-plex-thai text-[16px] text-onyx mt-0.5">
            เพียงสมัครสมาชิกและกรอกข้อมูลได้ทันที
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-6 items-center w-[295px] mx-auto">
          {/* Input Fields */}
          <div className="flex flex-col gap-1.5 w-full">
            <input
              type="text"
              placeholder="ชื่อ – นามสกุล"
              className="
                w-full p-[10px]
                rounded-[12px] border-[1.5px] border-[#c9c1b6] bg-white
                font-ibm-plex-thai text-[12px] text-onyx
                placeholder:text-onyx
                focus:outline-none focus:border-primary-navy
                transition-colors
              "
            />
            <input
              type="email"
              placeholder="อีเมล"
              className="
                w-full p-[10px]
                rounded-[12px] border-[1.5px] border-[#c9c1b6] bg-white
                font-ibm-plex-thai text-[12px] text-onyx
                placeholder:text-onyx
                focus:outline-none focus:border-primary-navy
                transition-colors
              "
            />
            <input
              type="password"
              placeholder="รหัสผ่าน"
              className="
                w-full p-[10px]
                rounded-[12px] border-[1.5px] border-[#c9c1b6] bg-white
                font-ibm-plex-thai text-[12px] text-onyx
                placeholder:text-onyx
                focus:outline-none focus:border-primary-navy
                transition-colors
              "
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 items-center">
            {/* Primary Button */}
            <button className="h-8 px-1.5 bg-onyx rounded-full flex items-center justify-center hover:bg-onyx-100 transition-colors">
              <span className="px-1.5 font-ibm-plex-thai font-medium text-[12px] text-[#fcfcfc]">
                สมัครสมาชิก
              </span>
            </button>
            {/* Secondary Button */}
            <button className="h-8 px-1.5 bg-[#fcfcfc] rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
              <span className="px-1.5 font-ibm-plex-thai font-medium text-[12px] text-onyx">
                มีบัญชีผู้ใช้แล้ว?
              </span>
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center font-ibm-plex-thai text-[12px] text-carbon-100 mt-9">
          การสมัครสมาชิกถือว่าคุณได้ยินยอมให้มีการเก็บข้อมูลในการใช้งาน
        </p>
      </div>
    </section>
  );
}
