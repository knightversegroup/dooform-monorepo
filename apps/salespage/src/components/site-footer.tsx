import Link from 'next/link';
import {
  ChevronRight,
  Clock,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Youtube,
} from 'lucide-react';
import { DooformLogo } from '@dooform/shared/components/ui/DooformLogo';
import { Typography } from '@dooform/ui';

const LINK_CLASS = 'text-white/80 transition-colors hover:text-white';
const HEADING_CLASS = 'text-white';

type FooterLink = {
  label: string;
  href: string;
};

type FooterColumn = {
  heading: string;
  links: FooterLink[];
  /* Optional nested sub-heading + links rendered below the main list,
   * mirroring the FlowAccount footer where some columns stack multiple
   * product groupings. */
  subGroups?: { heading: string; links: FooterLink[] }[];
};

const COLUMNS: FooterColumn[] = [
  {
    heading: 'ผลิตภัณฑ์',
    links: [
      { label: 'Dooform Translate', href: '/' },
      { label: 'Dooform OCR', href: '/' },
      { label: 'Dooform Studio', href: '/' },
      { label: 'Dooform API', href: '/' },
    ],
    subGroups: [
      {
        heading: 'เครื่องมือเสริม',
        links: [
          { label: 'ค้นหาสำนักงานแปลเอกสาร', href: '/' },
          { label: 'คำนวณค่าบริการแปล', href: '/' },
        ],
      },
    ],
  },
  {
    heading: 'Dooform Translate',
    links: [
      { label: 'ฟีเจอร์สำหรับผู้ประกอบการ', href: '/' },
      { label: 'ฟีเจอร์สำหรับนักแปล', href: '/' },
      { label: 'ใบเสนอราคา', href: '/' },
      { label: 'ใบเสร็จรับเงิน', href: '/' },
      { label: 'แอปพลิเคชัน Dooform', href: '/' },
      { label: 'เชื่อมต่อ API สำหรับนักพัฒนา', href: '/' },
    ],
    subGroups: [
      {
        heading: 'Dooform Studio',
        links: [{ label: 'ฟีเจอร์สำหรับผู้แปลมืออาชีพ', href: '/' }],
      },
    ],
  },
  {
    heading: 'แหล่งเรียนรู้',
    links: [
      { label: 'เริ่มต้นใช้งาน Dooform', href: '/' },
      { label: 'ความรู้เรื่องการแปลเอกสาร', href: '/' },
      { label: 'วิดีโอสอนใช้งาน', href: '/' },
      { label: 'วิธีใช้ Dooform', href: '/' },
      { label: 'คำถามที่พบบ่อย', href: '#faq' },
    ],
    subGroups: [
      {
        heading: 'Dooform OCR',
        links: [
          { label: 'ฟีเจอร์สำหรับผู้ประกอบการ', href: '/' },
          { label: 'ฟีเจอร์สำหรับนักแปล', href: '/' },
        ],
      },
    ],
  },
  {
    heading: 'เกี่ยวกับเรา',
    links: [
      { label: 'เข้าสู่ระบบ', href: '/login' },
      { label: 'สมัครสมาชิก', href: '/register' },
      { label: 'ร่วมเป็นพาร์ทเนอร์กับเรา', href: '/' },
      { label: 'เกี่ยวกับ Dooform', href: '/' },
      { label: 'ติดต่อเรา', href: '#contact' },
      { label: 'สมัครงาน', href: '/' },
      { label: 'เงื่อนไขการใช้บริการ', href: '/' },
      { label: 'นโยบายความเป็นส่วนตัว', href: '/' },
      { label: 'อัปเกรดเป็น Dooform Pro', href: '/' },
    ],
  },
];

const SOCIAL_ICON_CLASS =
  'flex h-9 w-9 items-center justify-center text-white/80 transition-colors hover:text-white';

function FooterLinkItem({ label, href }: FooterLink) {
  return (
    <li>
      <Link href={href} className={LINK_CLASS}>
        <Typography as="span" variant="body-sm" tone="inherit">
          {label}
        </Typography>
      </Link>
    </li>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-stone-800 text-white">
      {/* ── Top: link columns ─────────────────────────────────────── */}
      <div className="mx-auto w-full max-w-[1280px] px-6 pt-16 pb-10">
        {/* Logo — SVG paths are hardcoded to #4D4D4D so we invert it
         * to render white on the dark footer background. */}
        <Link
          href="/"
          aria-label="Dooform home"
          className="mb-10 inline-flex"
        >
          <DooformLogo
            width={140}
            height={28}
            className="[filter:brightness(0)_invert(1)]"
          />
        </Link>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3">
              <Typography
                as="h4"
                variant="body"
                weight="semibold"
                tone="inherit"
                className={HEADING_CLASS}
              >
                {col.heading}
              </Typography>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <FooterLinkItem key={link.label} {...link} />
                ))}
              </ul>
              {col.subGroups?.map((group) => (
                <div key={group.heading} className="mt-4 flex flex-col gap-3">
                  <Typography
                    as="h5"
                    variant="body"
                    weight="semibold"
                    tone="inherit"
                    className={HEADING_CLASS}
                  >
                    {group.heading}
                  </Typography>
                  <ul className="flex flex-col gap-2">
                    {group.links.map((link) => (
                      <FooterLinkItem key={link.label} {...link} />
                    ))}
                  </ul>
                </div>
              ))}
              {col.heading === 'เกี่ยวกับเรา' && (
                <Link
                  href="/"
                  className="mt-2 inline-flex items-center gap-1 text-white hover:text-white/80"
                >
                  <Typography
                    as="span"
                    variant="body-sm"
                    weight="medium"
                    tone="inherit"
                  >
                    ค้นหาเพิ่มเติม
                  </Typography>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Middle: contact channels (above thin divider) ─────────── */}
      <div className="mx-auto w-full max-w-[1280px] px-6">
        <div className="h-px w-full bg-white/30" />
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-6 py-10">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Customer support */}
          <div className="flex flex-col gap-4">
            <Typography
              as="h4"
              variant="body"
              weight="semibold"
              tone="inherit"
              className={HEADING_CLASS}
            >
              ติดต่อฝ่ายบริการลูกค้า
            </Typography>
            <Link
              href="tel:"
              className={`flex items-center gap-3 ${LINK_CLASS}`}
            >
              <Phone className="h-4 w-4" />
              <Typography
                as="span"
                variant="body-sm"
                tone="inherit"
                className="inline-flex items-center gap-1"
              >
                [เบอร์โทร]
                <ChevronRight className="h-3.5 w-3.5" />
              </Typography>
            </Link>
            <Link
              href="mailto:support@dooform.com"
              className={`flex items-center gap-3 ${LINK_CLASS}`}
            >
              <Mail className="h-4 w-4" />
              <Typography
                as="span"
                variant="body-sm"
                tone="inherit"
                className="inline-flex items-center gap-1"
              >
                support@dooform.com
                <ChevronRight className="h-3.5 w-3.5" />
              </Typography>
            </Link>
            <div className="flex items-start gap-3 text-white/80">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex flex-col gap-1">
                <Typography as="span" variant="body-sm" tone="inherit">
                  เวลาทำการ
                </Typography>
                <Typography as="span" variant="body-sm" tone="inherit">
                  จันทร์ - ศุกร์ 08:00 - 22:00 น.
                </Typography>
                <Typography as="span" variant="body-sm" tone="inherit">
                  เสาร์ - อาทิตย์ และวันหยุดนักขัตฤกษ์ 09:00 - 20:00 น.
                </Typography>
              </div>
            </div>
          </div>

          {/* Sales */}
          <div className="flex flex-col gap-4">
            <Typography
              as="h4"
              variant="body"
              weight="semibold"
              tone="inherit"
              className={HEADING_CLASS}
            >
              ติดต่อฝ่ายขาย
            </Typography>
            <Typography variant="body-sm" tone="inherit" className="text-white/80">
              ขอนัดสาธิตการใช้งานฟรี ผ่านวิดีโอคอลได้ทุกวัน
            </Typography>
            <Link
              href="tel:"
              className={`flex items-center gap-3 ${LINK_CLASS}`}
            >
              <Phone className="h-4 w-4" />
              <Typography
                as="span"
                variant="body-sm"
                tone="inherit"
                className="inline-flex items-center gap-1"
              >
                [เบอร์โทรฝ่ายขาย]
                <ChevronRight className="h-3.5 w-3.5" />
              </Typography>
            </Link>
            <Link
              href="mailto:demo@dooform.com"
              className={`flex items-center gap-3 ${LINK_CLASS}`}
            >
              <Mail className="h-4 w-4" />
              <Typography
                as="span"
                variant="body-sm"
                tone="inherit"
                className="inline-flex items-center gap-1"
              >
                demo@dooform.com
                <ChevronRight className="h-3.5 w-3.5" />
              </Typography>
            </Link>
            <div className="flex items-start gap-3 text-white/80">
              <Clock className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex flex-col gap-1">
                <Typography as="span" variant="body-sm" tone="inherit">
                  เวลาทำการ
                </Typography>
                <Typography as="span" variant="body-sm" tone="inherit">
                  ทุกวัน 09:00 - 18:00 น.
                </Typography>
              </div>
            </div>
            <Link
              href="#contact"
              className={`flex items-center gap-3 ${LINK_CLASS}`}
            >
              <MessageCircle className="h-4 w-4" />
              <Typography
                as="span"
                variant="body-sm"
                tone="inherit"
                className="inline-flex items-center gap-1"
              >
                ฝากข้อมูลให้ฝ่ายขายติดต่อกลับ
                <ChevronRight className="h-3.5 w-3.5" />
              </Typography>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom: socials + company address ─────────────────────── */}
      <div className="mx-auto w-full max-w-[1280px] px-6 pb-8">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <Link
                href="https://www.facebook.com"
                aria-label="Facebook"
                className={SOCIAL_ICON_CLASS}
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.youtube.com"
                aria-label="YouTube"
                className={SOCIAL_ICON_CLASS}
              >
                <Youtube className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.instagram.com"
                aria-label="Instagram"
                className={SOCIAL_ICON_CLASS}
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
            <Link
              href="https://line.me"
              className="inline-flex w-fit items-center gap-2 rounded-md bg-[#06c755] px-4 py-2 text-white shadow-sm transition-colors hover:bg-[#05b34d]"
            >
              <MessageCircle className="h-4 w-4" />
              <Typography
                as="span"
                variant="body-sm"
                weight="semibold"
                tone="inherit"
              >
                เพิ่มเพื่อน
              </Typography>
            </Link>
          </div>

          <div className="flex flex-col gap-1 text-white/80">
            <Typography variant="body-sm" tone="inherit">
              บริษัท ดูฟอร์ม จำกัด (สำนักงานใหญ่)
            </Typography>
            <Typography variant="body-sm" tone="inherit">
              [กรอกที่อยู่บริษัท]
            </Typography>
            <Typography variant="body-sm" tone="inherit">
              เลขประจำตัวผู้เสียภาษี: [กรอกเลขผู้เสียภาษี]
            </Typography>
            <Link
              href="/"
              className={`mt-1 inline-flex items-center gap-2 ${LINK_CLASS}`}
            >
              <Typography as="span" variant="body-sm" tone="inherit">
                ดูแผนที่
              </Typography>
              <MapPin className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Copyright bar ─────────────────────────────────────────── */}
      <div className="border-t border-white/20">
        <div className="mx-auto w-full max-w-[1280px] px-6 py-5 text-center">
          <Typography variant="caption" tone="inherit" className="text-white/80">
            Copyright © {year} Dooform Co., Ltd. All rights reserved.
          </Typography>
        </div>
      </div>
    </footer>
  );
}
