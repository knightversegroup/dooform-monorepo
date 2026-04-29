import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <div className="hidden lg:block lg:w-2/3 relative">
        <Image
          src="/auth-cover.jpg"
          alt="Dooform"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
          <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
            ลดเวลาแปล
            <br />
            จาก 1 ชั่วโมง เป็น 1 นาที
          </h2>
          <p className="text-sm text-white/80 mb-8 max-w-md">
            ระบบจะนำเอกสารต้นฉบับของคุณมาแปลให้อัตโนมัติ พร้อมรักษารูปแบบเดิม
            ให้คุณพร้อมใช้งานได้ทันที
          </p>
          <div className="flex items-center gap-2">
            <Image src="/logo-w.svg" alt="Dooform" width={103} height={20} />
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/3 flex flex-col min-h-screen p-6 md:p-10">
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
