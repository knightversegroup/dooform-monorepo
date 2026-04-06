import Image from 'next/image';

export default function HeroMain() {
  return (
    <section className="bg-[#2c2585] px-4 pt-16">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-[15px]">
        {/* Text Content */}
        <div className="flex flex-col items-center gap-6 text-white">
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-sm">ดูฟอร์ม</p>
            <div className="flex flex-col items-center gap-0.5">
              <h1 className="text-4xl font-semibold leading-[43px]">
                กรอกฟอร์มไม่ใช่เรื่อง
                <br />
                ยากอีกต่อไป
              </h1>
              <p className="text-sm">ให้การกรอกฟอร์มไม่เป็นเรื่องยากอีกต่อไป</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <a
              href="#trial"
              className="rounded-full bg-white px-3 py-1.5 text-sm text-black"
            >
              ทดลองใช้งาน
            </a>
            <a
              href="#trial"
              className="rounded-full px-3 py-1.5 text-sm text-white"
            >
              ทดลองใช้งาน
            </a>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative h-[222px] w-[222px]">
          <Image
            src="/hero-image.png"
            alt="Hero"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
