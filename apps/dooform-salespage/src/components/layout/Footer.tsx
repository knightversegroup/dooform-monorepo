import { DooformLogo } from '@dooform/shared/components/ui/DooformLogo';
import { ArrowUpRight } from 'lucide-react';

type FooterDict = {
  copyright: string;
  companyName: string;
  termsNotice: string;
  sections: {
    members: string;
    aboutApp: string;
    forBusiness: string;
    legal: string;
  };
  links: Record<string, string>;
};

export default function Footer({ dict }: { dict: FooterDict }) {
  const footerSections = [
    {
      heading: dict.sections.members,
      links: [
        { label: dict.links.enterprise, href: '#' },
        { label: dict.links.login, href: '#' },
        { label: dict.links.register, href: '#' },
      ],
    },
    {
      heading: dict.sections.aboutApp,
      links: [
        { label: dict.links.documents, href: '#' },
        { label: dict.links.guide, href: '#' },
        { label: dict.links.documentation, href: '#' },
        { label: dict.links.qualityReport, href: '#' },
        { label: dict.links.devTeam, href: '#' },
        { label: dict.links.aboutWebsite, href: '#' },
      ],
    },
    {
      heading: dict.sections.forBusiness,
      links: [
        { label: dict.links.businessPlan, href: '#' },
        { label: dict.links.pricing, href: '#' },
        { label: dict.links.contact, href: '#' },
      ],
    },
    {
      heading: dict.sections.legal,
      links: [
        { label: dict.links.terms, href: '#' },
        { label: dict.links.dataPolicy, href: '#' },
      ],
    },
  ];

  return (
    <footer className="flex justify-center px-[10px]">
      <div className="flex w-full max-w-[1280px] flex-col gap-6 px-6 py-9">
        {/* Top section */}
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          {/* Logo + Copyright */}
          <div className="flex flex-col gap-3">
            <DooformLogo width={124} height={24} />
            <p className="whitespace-pre-line text-base text-[#4d4d4d]">
              {dict.copyright}
            </p>
          </div>

          {/* Link Columns */}
          <div className="flex flex-col gap-6 md:flex-row">
            {footerSections.map((section) => (
              <div key={section.heading} className="flex flex-col gap-2">
                <h3 className="text-base font-semibold text-[#262626]">
                  {section.heading}
                </h3>
                {section.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-base text-[#262626] transition hover:opacity-70"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <a
            href="#"
            className="flex items-center gap-1 text-sm text-[#4d4d4d] transition hover:opacity-70"
          >
            {dict.companyName}
            <ArrowUpRight className="h-3 w-3" />
          </a>
          <p className="text-sm text-[#4d4d4d]">{dict.termsNotice}</p>
        </div>
      </div>
    </footer>
  );
}
