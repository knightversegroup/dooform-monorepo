import { Button, Typography } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';

type PlanDict = {
  name: string;
  price: string;
  period: string;
  button: string;
  features: string[];
};

type PricingDict = {
  heading: string;
  subtitle: string;
  recommendLabel: string;
  footnote: string;
  allFeatures: string;
  plans: {
    trial: PlanDict;
    starter: PlanDict;
    plus: PlanDict;
    enterprise: PlanDict;
  };
};

type PlanKey = keyof PricingDict['plans'];

type PlanCardConfig = {
  key: PlanKey;
  accentColor: string;
  highlightsLabel: string;
  description: string;
  icon: React.ReactNode;
};

/* Decorative geometric SVGs per plan */

const TrialIcon = () => (
  <svg width="54" height="36" viewBox="0 0 54 36" fill="none">
    <path
      d="M18 36C8.06 36 0 27.94 0 18C0 8.06 8.06 0 18 0V36Z"
      fill="#85D996"
    />
    <circle cx="36" cy="18" r="18" fill="#0D4B3B" />
  </svg>
);

const StarterIcon = () => (
  <svg width="54" height="36" viewBox="0 0 54 36" fill="none">
    <path
      d="M0 0C9.94 0 18 8.06 18 18C18 27.94 9.94 36 0 36V0Z"
      fill="#5A82DE"
    />
    <rect x="18" width="36" height="36" fill="#19224A" />
  </svg>
);

const PlusIcon = () => (
  <svg width="72" height="36" viewBox="0 0 72 36" fill="none">
    <path
      d="M36 0C36 9.94 27.94 18 18 18C8.06 18 0 9.94 0 0H36Z"
      fill="#EFC078"
    />
    <path
      d="M36 18C36 27.94 27.94 36 18 36C8.06 36 0 27.94 0 18H36Z"
      fill="#EFC078"
    />
    <circle cx="54" cy="18" r="18" fill="#983705" />
  </svg>
);

const EnterpriseIcon = () => (
  <svg width="72" height="36" viewBox="0 0 72 36" fill="none">
    <rect y="9" width="36" height="18" rx="9" fill="#B28FCC" />
    <path d="M18 18C18 27.94 9.94 36 0 36V18H18Z" fill="#9060B3" />
    <circle cx="27" cy="27" r="9" fill="#9060B3" />
    <rect x="36" width="36" height="36" fill="#4C325F" />
  </svg>
);

const planCardConfigs: PlanCardConfig[] = [
  {
    key: 'trial',
    accentColor: '#09825D',
    highlightsLabel: 'ฟีเจอร์หลัก',
    description:
      'สำหรับผู้ที่ต้องการทดลองใช้งานระบบกรอกเอกสาร ใช้งานได้ฟรีไม่จำกัดเวลา',
    icon: <TrialIcon />,
  },
  {
    key: 'starter',
    accentColor: '#5A82DE',
    highlightsLabel: 'ทุกอย่างใน Trial รวมถึง',
    description: 'สำหรับทีมที่ต้องการใช้ Dooform เป็นระบบจัดการเอกสารหลัก',
    icon: <StarterIcon />,
  },
  {
    key: 'plus',
    accentColor: '#BB5504',
    highlightsLabel: 'ทุกอย่างใน Starter รวมถึง',
    description:
      'สำหรับองค์กรที่ต้องการฟีเจอร์ขั้นสูง AI ตรวจสอบข้อมูล และระบบจัดการเอกสารเต็มรูปแบบ',
    icon: <PlusIcon />,
  },
  {
    key: 'enterprise',
    accentColor: '#995FC3',
    highlightsLabel: 'ทุกอย่างใน Plus รวมถึง',
    description:
      'สำหรับองค์กรขนาดใหญ่ที่ต้องการ API ระดับองค์กร และการสนับสนุนเฉพาะทาง',
    icon: <EnterpriseIcon />,
  },
];

function PlanCard({
  plan,
  config,
  recommendLabel,
}: {
  plan: PlanDict;
  config: PlanCardConfig;
  recommendLabel?: string;
}) {
  const isEnterprise = config.key === 'enterprise';
  const isRecommended = config.key === 'plus';

  return (
    <div className={`relative row-span-2 grid grid-rows-subgrid overflow-visible rounded-lg border bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] ${isRecommended ? 'border-[#262626]' : 'border-[#e7e7e7]'}`}>
      {isRecommended && recommendLabel && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-t-lg bg-[#262626] px-12 py-2 text-center">
          <Typography as="span" variant="body-sm" weight="semibold" tone="inverse">
            {recommendLabel}
          </Typography>
        </div>
      )}
      {/* ── Top section ── */}
      <div className="flex flex-col gap-2 border-b border-[#e7e7e7] p-7 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        {/* Header: name + icon */}
        <div className="flex items-start justify-between gap-4">
          <Typography variant="h3" as="h3" weight="medium">{plan.name}</Typography>
          {config.icon}
        </div>

        {/* Description */}
        <Typography variant="body" tone="muted">
          {config.description}
        </Typography>

        {/* Price + period */}
        <div className="mt-auto flex items-baseline gap-2 pt-3">
          <Typography as="span" variant="h1" weight="bold">
            {plan.price}
          </Typography>
          <Typography as="span" variant="overline" weight="semibold">
            {plan.period}
          </Typography>
        </div>

        {/* CTA */}
        <div className="pt-2">
          <Button
            variant={isEnterprise ? 'outline' : 'dark'}
            size="md"
            href="#trial"
          >
            {plan.button}
          </Button>
        </div>
      </div>

      {/* ── Bottom section: features ── */}
      <div className="flex flex-col gap-5 p-7">
        <Typography
          as="h4"
          variant="overline"
          weight="semibold"
          tone="inherit"
          className="uppercase"
          // The accent color is plan-specific and resolved at runtime,
          // so it stays as an inline style on the heading.
        >
          <span style={{ color: config.accentColor }}>{config.highlightsLabel}</span>
        </Typography>

        <ul className="list-disc space-y-2 pl-4">
          {plan.features.map((feature, i) => (
            <li key={i}>
              <Typography as="span" variant="body-sm" tone="body">
                {feature}
              </Typography>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function PricingSection({ dict }: { dict: PricingDict }) {
  return (
    <Section padding="lg">
      <Container>
        {/* Heading */}
        <div className="mb-14 md:mb-20">
          <Typography variant="h2">{dict.heading}</Typography>
          <Typography variant="body" className="mt-3">
            {dict.subtitle}
          </Typography>
        </div>

        {/* Cards — horizontal slider on mobile, grid on md+ */}
        <div
          className="
            -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 pt-14
            [&::-webkit-scrollbar]:hidden [scrollbar-width:none]
            [&>*]:w-[85%] [&>*]:shrink-0 [&>*]:snap-center
            md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 md:pt-10
            md:[&>*]:w-auto md:[&>*]:shrink md:[&>*]:snap-align-none
            lg:grid-cols-4 lg:grid-rows-[auto_1fr]
          "
        >
          {planCardConfigs.map((config) => (
            <PlanCard
              key={config.key}
              plan={dict.plans[config.key]}
              config={config}
              recommendLabel={dict.recommendLabel}
            />
          ))}
        </div>

        {/* Footnote */}
        <Typography variant="body-sm" align="center" className="mt-14 md:mt-20">
          {dict.footnote}
        </Typography>
      </Container>
    </Section>
  );
}
