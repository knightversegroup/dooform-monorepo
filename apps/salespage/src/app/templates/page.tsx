import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Typography } from '@dooform/ui';
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
          <nav className="flex items-center gap-1 text-neutral-500">
            <Link href="/" className="hover:text-neutral-900">
              <Typography as="span" variant="caption" tone="inherit">หน้าแรก</Typography>
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Typography as="span" variant="caption" tone="inherit" className="text-neutral-900">
              เทมเพลต
            </Typography>
          </nav>
          <div className="mt-6 max-w-3xl">
            <Typography as="h1" variant="h1" weight="semibold" tone="inherit" className="text-neutral-900">
              คลังเทมเพลต
            </Typography>
            <Typography variant="lead" tone="inherit" className="mt-3 text-neutral-600">
              สำรวจเทมเพลตทั้งหมดที่ Dooform มีให้บริการ กรองตามหมวดหมู่ ค้นหาตามชื่อ
              หรือคลิกที่เทมเพลตเพื่อดูรายละเอียดทั้งหมด
            </Typography>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <TemplatesTable />
      </section>
    </div>
  );
}
