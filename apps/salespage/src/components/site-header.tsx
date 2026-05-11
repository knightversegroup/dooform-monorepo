import Link from 'next/link';
import { DooformLogo } from '@dooform/shared/components/ui/DooformLogo';
import { Typography } from '@dooform/ui';

const NAV_LINK_CLASS =
  'text-neutral-600 transition-colors hover:text-neutral-900';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Dooform" className="flex items-center">
          <DooformLogo width={120} height={22} />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/templates" className={NAV_LINK_CLASS}>
            <Typography as="span" variant="body-sm" tone="inherit">เทมเพลต</Typography>
          </Link>
          <Link href="/#features" className={NAV_LINK_CLASS}>
            <Typography as="span" variant="body-sm" tone="inherit">ฟีเจอร์</Typography>
          </Link>
          <Link href="/#pricing" className={NAV_LINK_CLASS}>
            <Typography as="span" variant="body-sm" tone="inherit">ราคา</Typography>
          </Link>
          <Link href="/#contact" className={NAV_LINK_CLASS}>
            <Typography as="span" variant="body-sm" tone="inherit">ติดต่อเรา</Typography>
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/templates"
            className="hidden items-center rounded-full px-4 py-2 text-neutral-700 transition-colors hover:bg-neutral-100 sm:inline-flex"
          >
            <Typography as="span" variant="body-sm" weight="medium" tone="inherit">
              เข้าสู่ระบบ
            </Typography>
          </Link>
          <Link
            href="/templates"
            className="inline-flex items-center rounded-full bg-neutral-900 px-4 py-2 text-white transition-colors hover:bg-neutral-800"
          >
            <Typography as="span" variant="body-sm" weight="medium" tone="inherit">
              เริ่มต้นใช้งาน
            </Typography>
          </Link>
        </div>
      </div>
    </header>
  );
}
