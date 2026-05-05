import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { TemplatesTable } from '../../components/templates-table';

export const metadata = {
  title: 'เทมเพลต — Dooform',
  description: 'สำรวจคลังเทมเพลตเอกสารพร้อมใช้ของ Dooform',
};

export default function TemplatesPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="border-b border-neutral-200 bg-gradient-to-b from-neutral-50 to-white">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 lg:px-8 lg:pb-16 lg:pt-16">
          <nav className="flex items-center gap-1 text-xs text-neutral-500">
            <Link href="/" className="hover:text-neutral-900">
              หน้าแรก
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-neutral-900">เทมเพลต</span>
          </nav>
          <div className="mt-6 max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
              คลังเทมเพลต
            </h1>
            <p className="mt-3 text-base leading-relaxed text-neutral-600">
              สำรวจเทมเพลตทั้งหมดที่ Dooform มีให้บริการ กรองตามหมวดหมู่ ค้นหาตามชื่อ
              หรือคลิกที่เทมเพลตเพื่อดูรายละเอียดทั้งหมด
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <TemplatesTable />
      </section>
    </div>
  );
}
