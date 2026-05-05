import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from 'lucide-react';
import {
  getPublicForm,
  getPublicThumbnailUrl,
  type PublicForm,
} from '../../../lib/dooform-api';
import { ThumbnailLightbox } from '../../../components/thumbnail-lightbox';
import {
  categoryLabel,
  formatDate,
  formatTier,
  formatType,
} from '../../../lib/format';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const tpl = await getPublicForm(id);
    return {
      title: `${tpl.displayName ?? tpl.name} — Dooform`,
      description: tpl.description ?? 'เทมเพลตเอกสารที่พร้อมใช้งานทันที',
    };
  } catch {
    return { title: 'เทมเพลต — Dooform' };
  }
}

export default async function TemplateDetailPage({ params }: Props) {
  const { id } = await params;

  let tpl: PublicForm;
  try {
    tpl = await getPublicForm(id);
  } catch {
    notFound();
  }

  const title = tpl.displayName ?? tpl.name;
  const category = categoryLabel(tpl.category);

  const thumbnailUrl = getPublicThumbnailUrl(tpl.id);

  return (
    <div className="bg-white">
      {/* Hero block — full-bleed thumbnail background */}
      <section className="relative overflow-hidden">
        {/* Background image */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-right bg-no-repeat"
          style={{ backgroundImage: `url(${thumbnailUrl})` }}
        />

        {/* Layered white gradients — left side fully white, fading toward the
            thumbnail on the right; top + bottom also fade to white. */}
        {/* 1. Strong left-to-right white wash so text is fully readable. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/30"
        />
        {/* 2. Top-down white fade. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/80 via-white/20 to-white"
        />
        {/* 3. Diagonal white sweep from bottom-left for extra softness. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white via-white/60 to-transparent"
        />
        {/* 4. Bottom band fading hard into white to blend with the next section. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-white via-white/90 to-transparent"
        />
        {/* 5. Subtle indigo tint kept underneath the white layers for the soft
            purple cast in the reference. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.10),transparent_60%)]"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex flex-wrap items-center gap-1 pt-10 text-sm text-neutral-600">
            <Link
              href="/"
              className="underline-offset-2 hover:text-neutral-900 hover:underline"
            >
              หน้าแรก
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href="/templates"
              className="underline-offset-2 hover:text-neutral-900 hover:underline"
            >
              เทมเพลต
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-neutral-900">{title}</span>
          </nav>

          <div className="grid gap-8 pb-24 pt-10 lg:grid-cols-12 lg:gap-12 lg:pb-32 lg:pt-12">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center rounded-full border border-neutral-300 bg-white/80 px-3 py-1 text-xs font-medium text-neutral-700 backdrop-blur">
                {category}
              </span>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-700 sm:text-lg">
                {tpl.description ??
                  'เทมเพลตเอกสารที่พร้อมใช้งาน ปรับแต่งให้เข้ากับขั้นตอนการทำงานของคุณได้ภายในไม่กี่นาที'}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  ใช้เทมเพลตนี้
                  <ArrowRight className="h-4 w-4" />
                </button>
                <ThumbnailLightbox
                  id={tpl.id}
                  alt={`ตัวอย่าง ${title}`}
                  label="ดูตัวอย่าง"
                />
              </div>

              {/* Meta facts */}
              <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
                <Fact label="หมวดหมู่" value={category} />
                <Fact label="ประเภท" value={formatType(tpl.type)} />
                <Fact label="ระดับ" value={formatTier(tpl.tier)} />
                <Fact label="อัปเดต" value={formatDate(tpl.updatedAt)} />
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <Section id="overview" title="ทำไมต้องใช้เทมเพลตนี้" eyebrow="ภาพรวม">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-base leading-relaxed text-neutral-700 sm:text-lg">
              {tpl.description ??
                'ลดเวลาที่ใช้กับการจัดรูปแบบ และทุ่มเวลาให้กับเนื้อหาสำคัญ เทมเพลตนี้มาพร้อมค่าเริ่มต้นที่เหมาะสม ระบบควบคุมเวอร์ชัน และความสามารถด้านระบบอัตโนมัติเช่นเดียวกับเอกสาร Dooform ทุกฉบับ'}
            </p>
            <p className="mt-4 text-base leading-relaxed text-neutral-700">
              เช่นเดียวกับเทมเพลตอื่นในคลังของ Dooform
              เทมเพลตนี้สามารถแก้ไขได้ทั้งหมด ปรับแต่งฟิลด์ แบรนด์ดิ้ง
              และเงื่อนไขเชิงตรรกะ จากนั้นเผยแพร่ภายในพื้นที่ทำงานของคุณ
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                ข้อมูลโดยสรุป
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                {atGlance(tpl).map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-2 last:border-none last:pb-0"
                  >
                    <span className="text-neutral-500">{row.label}</span>
                    <span className="font-medium text-neutral-900">
                      {row.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* Features grid */}
      <Section
        id="features"
        title="คุณจะได้รับอะไรบ้าง"
        eyebrow="ฟีเจอร์"
        background="muted"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Sparkles,
              title: 'ฟิลด์อัจฉริยะ',
              body: 'รองรับตัวแปร เงื่อนไข และค่าที่คำนวณได้แบบในตัว',
            },
            {
              icon: Workflow,
              title: 'พร้อมใช้กับเวิร์กโฟลว์',
              body: 'เชื่อมต่อกับระบบอนุมัติ ลงนาม และเครื่องมืออื่น ๆ ได้ทันที',
            },
            {
              icon: ShieldCheck,
              title: 'รองรับข้อกำหนด',
              body: 'บันทึกการตรวจสอบและประวัติการแก้ไขโดยอัตโนมัติ',
            },
            {
              icon: Zap,
              title: 'สร้างเอกสารทันที',
              body: 'แปลงเป็น PDF หรือ DOCX ได้ภายในไม่กี่มิลลิวินาที',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900 text-white">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-neutral-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section id="how-it-works" title="ขั้นตอนการใช้งาน" eyebrow="กระบวนการ">
        <ol className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: '01',
              title: 'เลือกเทมเพลต',
              body: 'เปิดเทมเพลต ตรวจสอบโครงสร้าง แล้วคัดลอกเข้าสู่พื้นที่ทำงานของคุณ',
            },
            {
              step: '02',
              title: 'ปรับแต่ง',
              body: 'แก้ไขเนื้อหา เพิ่มฟิลด์ และเชื่อมต่อแหล่งข้อมูล — ใช้ระบบ no-code หรือควบคุมเองได้ทั้งหมด',
            },
            {
              step: '03',
              title: 'ใช้งานจริง',
              body: 'สร้างเอกสารตามต้องการ หรือผสานเข้ากับเวิร์กโฟลว์อัตโนมัติ — Dooform จัดการที่เหลือให้',
            },
          ].map((s) => (
            <li
              key={s.step}
              className="rounded-2xl border border-neutral-200 bg-white p-6"
            >
              <div className="text-xs font-semibold tracking-widest text-indigo-600">
                {s.step}
              </div>
              <h3 className="mt-3 text-base font-semibold text-neutral-900">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      {/* FAQ */}
      <Section id="faq" title="คำถามที่พบบ่อย" eyebrow="FAQ" background="muted">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              q: 'สามารถปรับแต่งเทมเพลตนี้ได้หรือไม่?',
              a: 'ได้ ทุกเทมเพลตแก้ไขได้ทั้งหมด ปรับเนื้อหา โครงสร้าง และเงื่อนไขให้เข้ากับขั้นตอนการทำงานของคุณ',
            },
            {
              q: 'รองรับรูปแบบไฟล์ผลลัพธ์อะไรบ้าง?',
              a: 'Dooform สร้างไฟล์ PDF และ DOCX ได้ในตัว และมีการส่งออกข้อมูลแบบโครงสร้างผ่าน API',
            },
            {
              q: 'เทมเพลตนี้รวมอยู่ในแพ็กเกจของฉันหรือไม่?',
              a: `เทมเพลตนี้อยู่ในระดับ ${formatTier(tpl.tier)} โปรดดูรายละเอียดที่หน้าราคา`,
            },
            {
              q: 'ขอความช่วยเหลือได้อย่างไร?',
              a: 'ติดต่อทีมสนับสนุนของเรา ลูกค้าระดับโปรและองค์กรจะได้รับการตอบกลับแบบ Priority',
            },
          ].map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-neutral-200 bg-white p-6"
            >
              <h3 className="flex items-start gap-2 text-sm font-semibold text-neutral-900">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600" />
                {item.q}
              </h3>
              <p className="mt-2 pl-6 text-sm leading-relaxed text-neutral-600">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Resources / CTA */}
      <Section
        id="resources"
        title="เริ่มต้นใช้เทมเพลตนี้"
        eyebrow="ขั้นตอนต่อไป"
      >
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-neutral-200 bg-gradient-to-br from-neutral-900 to-neutral-800 p-8 text-white sm:flex-row sm:items-center sm:p-12">
          <div className="max-w-xl">
            <h3 className="text-2xl font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-300">
              เพิ่มเทมเพลตนี้เข้าสู่พื้นที่ทำงานของคุณ
              และเริ่มสร้างเอกสารได้ภายในไม่กี่นาที
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
            >
              ใช้เทมเพลตนี้
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/templates"
              className="inline-flex items-center justify-center rounded-full border border-neutral-700 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              ดูเทมเพลตทั้งหมด
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({
  id,
  title,
  eyebrow,
  children,
  background,
}: {
  id: string;
  title: string;
  eyebrow: string;
  children: React.ReactNode;
  background?: 'muted';
}) {
  return (
    <section
      id={id}
      className={
        background === 'muted'
          ? 'border-y border-neutral-200 bg-neutral-50 py-16 lg:py-24'
          : 'py-16 lg:py-24'
      }
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-neutral-900">{value}</dd>
    </div>
  );
}

function atGlance(tpl: PublicForm) {
  return [
    { label: 'หมวดหมู่', value: categoryLabel(tpl.category) },
    { label: 'ประเภท', value: formatType(tpl.type) },
    { label: 'ระดับ', value: formatTier(tpl.tier) },
    {
      label: 'การวางหน้า',
      value: tpl.pageOrientation
        ? formatPageOrientation(tpl.pageOrientation)
        : '—',
    },
    { label: 'ผู้สร้าง', value: tpl.author ?? 'Dooform' },
    { label: 'สร้างเมื่อ', value: formatDate(tpl.createdAt) },
    { label: 'อัปเดตล่าสุด', value: formatDate(tpl.updatedAt) },
  ];
}

function formatPageOrientation(po: string): string {
  const k = po.toUpperCase();
  if (k === 'PORTRAIT') return 'แนวตั้ง';
  if (k === 'LANDSCAPE') return 'แนวนอน';
  return po;
}
