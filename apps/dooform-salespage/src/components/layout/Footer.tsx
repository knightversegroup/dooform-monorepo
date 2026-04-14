type FooterDict = {
  stayUpdated: string;
  subscribeText: string;
  receiveUpdates: string;
  copyright: string;
  sections: {
    ourStack: string;
    company: string;
    support: string;
    elsewhere: string;
  };
  links: Record<string, string>;
};

export default function Footer({ dict }: { dict: FooterDict }) {
  const footerSections = [
    {
      heading: dict.sections.ourStack,
      links: [
        { label: dict.links.product, href: '/product/' },
        { label: dict.links.features, href: '/product/features/', sub: true },
        { label: dict.links.customers, href: '/product/customers/', sub: true },
        { label: dict.links.security, href: '/product/security/', sub: true },
        { label: dict.links.pricing, href: '/product/pricing/', sub: true },
        { label: dict.links.enterprise, href: '/enterprise/' },
        { label: dict.links.integrations, href: '/integrations/' },
        { label: dict.links.partnerships, href: '/partnerships/' },
      ],
    },
    {
      heading: dict.sections.company,
      links: [
        { label: dict.links.leadership, href: '#' },
        { label: dict.links.press, href: '#' },
        { label: dict.links.careers, href: '#' },
        { label: dict.links.socialImpact, href: '#' },
      ],
    },
    {
      heading: dict.sections.support,
      links: [
        { label: dict.links.contact, href: '#' },
        { label: dict.links.helpCenter, href: '#' },
        { label: dict.links.terms, href: '#' },
        { label: dict.links.privacyPolicy, href: '#' },
        { label: dict.links.cookiePolicy, href: '#' },
      ],
    },
    {
      heading: dict.sections.elsewhere,
      links: [
        { label: dict.links.blog, href: '#' },
        { label: dict.links.newsletter, href: '#' },
        { label: dict.links.podcast, href: '#' },
        { label: dict.links.releases, href: '#' },
      ],
    },
  ];

  return (
    <footer>
      <div className="m-3 bg-gray-100 p-6 pb-0">
        <div className="flex sm:flex-col">
          {/* Newsletter Signup */}
          <section className="flex-1 pr-8">
            <div className="mb-6 h-8 w-8 rounded bg-gray-800" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              {dict.stayUpdated}
            </h2>
            <p
              className="mb-6 max-w-xs text-sm text-gray-600"
              dangerouslySetInnerHTML={{ __html: dict.subscribeText }}
            />
            <button className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800">
              {dict.receiveUpdates}
            </button>
          </section>

          {/* Link Columns */}
          <div className="flex flex-[2] gap-6 sm:mt-8 sm:flex-col">
            <div className="flex flex-1 gap-6 md:flex-col">
              {footerSections.slice(0, 2).map((section) => (
                <section key={section.heading} className="flex-1">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    {section.heading}
                  </h3>
                  <ul className="space-y-1.5">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className={`text-sm text-gray-500 transition hover:text-gray-800 ${
                            'sub' in link && link.sub ? 'pl-3' : ''
                          }`}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <div className="flex flex-1 gap-6 md:flex-col">
              {footerSections.slice(2).map((section) => (
                <section key={section.heading} className="flex-1">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    {section.heading}
                  </h3>
                  <ul className="space-y-1.5">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-sm text-gray-500 transition hover:text-gray-800"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>

        {/* Large watermark logo placeholder */}
        <div className="my-8 flex justify-center">
          <div className="h-6 w-full max-w-4xl rounded bg-gray-200" />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-6 py-6 sm:flex-col sm:text-center">
        <div className="text-xs text-gray-400">{dict.copyright}</div>
        <div className="flex gap-2 sm:mt-3">
          {['LinkedIn', 'X', 'YouTube'].map((social) => (
            <a
              key={social}
              href="#"
              className="rounded p-1.5 text-xs text-gray-500 transition hover:bg-orange-500 hover:text-white"
            >
              {social}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
