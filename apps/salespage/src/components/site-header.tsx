import Link from 'next/link';
import { DooformLogo } from '@dooform/shared/components/ui/DooformLogo';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Dooform" className="flex items-center">
          <DooformLogo width={120} height={22} />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/templates"
            className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
          >
            เทมเพลต
          </Link>
          <Link
            href="/#features"
            className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
          >
            ฟีเจอร์
          </Link>
          <Link
            href="/#pricing"
            className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
          >
            ราคา
          </Link>
          <Link
            href="/#contact"
            className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
          >
            ติดต่อเรา
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/templates"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 sm:inline-flex"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="/templates"
            className="inline-flex items-center rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
          >
            เริ่มต้นใช้งาน
          </Link>
        </div>
      </div>
    </header>
  );
}
