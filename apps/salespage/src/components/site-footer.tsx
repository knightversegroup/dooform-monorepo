import Link from 'next/link';
import { DooformLogo } from '@dooform/shared/components/ui/DooformLogo';

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center">
            <DooformLogo width={124} height={24} />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            ระบบจัดการเอกสารอัตโนมัติสำหรับทีมยุคใหม่
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-neutral-900">ผลิตภัณฑ์</h4>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li>
              <Link href="/templates" className="hover:text-neutral-900">
                เทมเพลต
              </Link>
            </li>
            <li>
              <Link href="/#features" className="hover:text-neutral-900">
                ฟีเจอร์
              </Link>
            </li>
            <li>
              <Link href="/#pricing" className="hover:text-neutral-900">
                ราคา
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-neutral-900">บริษัท</h4>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li>
              <Link href="/#contact" className="hover:text-neutral-900">
                ติดต่อเรา
              </Link>
            </li>
            <li>
              <a href="#" className="hover:text-neutral-900">
                เกี่ยวกับเรา
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-neutral-900">
                ร่วมงานกับเรา
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-neutral-900">ข้อกำหนด</h4>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600">
            <li>
              <a href="#" className="hover:text-neutral-900">
                นโยบายความเป็นส่วนตัว
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-neutral-900">
                เงื่อนไขการใช้งาน
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-neutral-900">
                ความปลอดภัย
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-200 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-neutral-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Dooform สงวนลิขสิทธิ์</p>
          <p>สร้างขึ้นเพื่อทีมที่ใส่ใจในเอกสารทุกฉบับ</p>
        </div>
      </div>
    </footer>
  );
}
