import Link from 'next/link';
import { DooformLogo } from '@dooform/shared/components/ui/DooformLogo';
import { Typography } from '@dooform/ui';

const FOOTER_LINK_CLASS = 'text-neutral-600 hover:text-neutral-900';

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center">
            <DooformLogo width={124} height={24} />
          </div>
          <Typography variant="body-sm" tone="inherit" className="mt-3 text-neutral-600">
            ระบบจัดการเอกสารอัตโนมัติสำหรับทีมยุคใหม่
          </Typography>
        </div>

        <div>
          <Typography as="h4" variant="body-sm" weight="semibold" tone="inherit" className="text-neutral-900">
            ผลิตภัณฑ์
          </Typography>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/templates" className={FOOTER_LINK_CLASS}>
                <Typography as="span" variant="body-sm" tone="inherit">เทมเพลต</Typography>
              </Link>
            </li>
            <li>
              <Link href="/#features" className={FOOTER_LINK_CLASS}>
                <Typography as="span" variant="body-sm" tone="inherit">ฟีเจอร์</Typography>
              </Link>
            </li>
            <li>
              <Link href="/#pricing" className={FOOTER_LINK_CLASS}>
                <Typography as="span" variant="body-sm" tone="inherit">ราคา</Typography>
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <Typography as="h4" variant="body-sm" weight="semibold" tone="inherit" className="text-neutral-900">
            บริษัท
          </Typography>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/#contact" className={FOOTER_LINK_CLASS}>
                <Typography as="span" variant="body-sm" tone="inherit">ติดต่อเรา</Typography>
              </Link>
            </li>
            <li>
              <a href="#" className={FOOTER_LINK_CLASS}>
                <Typography as="span" variant="body-sm" tone="inherit">เกี่ยวกับเรา</Typography>
              </a>
            </li>
            <li>
              <a href="#" className={FOOTER_LINK_CLASS}>
                <Typography as="span" variant="body-sm" tone="inherit">ร่วมงานกับเรา</Typography>
              </a>
            </li>
          </ul>
        </div>

        <div>
          <Typography as="h4" variant="body-sm" weight="semibold" tone="inherit" className="text-neutral-900">
            ข้อกำหนด
          </Typography>
          <ul className="mt-3 space-y-2">
            <li>
              <a href="#" className={FOOTER_LINK_CLASS}>
                <Typography as="span" variant="body-sm" tone="inherit">นโยบายความเป็นส่วนตัว</Typography>
              </a>
            </li>
            <li>
              <a href="#" className={FOOTER_LINK_CLASS}>
                <Typography as="span" variant="body-sm" tone="inherit">เงื่อนไขการใช้งาน</Typography>
              </a>
            </li>
            <li>
              <a href="#" className={FOOTER_LINK_CLASS}>
                <Typography as="span" variant="body-sm" tone="inherit">ความปลอดภัย</Typography>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-200 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-8">
          <Typography variant="caption" tone="inherit" className="text-neutral-500">
            © {new Date().getFullYear()} Dooform สงวนลิขสิทธิ์
          </Typography>
          <Typography variant="caption" tone="inherit" className="text-neutral-500">
            สร้างขึ้นเพื่อทีมที่ใส่ใจในเอกสารทุกฉบับ
          </Typography>
        </div>
      </div>
    </footer>
  );
}
