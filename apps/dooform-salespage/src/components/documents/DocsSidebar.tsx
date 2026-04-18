type SidebarItem = {
  title: string;
  href: string;
};

type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

export type DocsSidebarDict = {
  sections: SidebarSection[];
};

export default function DocsSidebar({
  dict,
  locale,
}: {
  dict: DocsSidebarDict;
  locale: string;
}) {
  return (
    <nav className="flex flex-col gap-6">
      {dict.sections.map((section) => (
        <div key={section.title} className="flex flex-col gap-1.5">
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wide text-[#737373]">
            {section.title}
          </h3>
          <ul className="flex flex-col">
            {section.items.map((item) => {
              const href = item.href
                ? `/${locale}/documents/${item.href}`
                : `/${locale}/documents`;
              return (
                <li key={href}>
                  <a
                    href={href}
                    className="block rounded-md px-3 py-1.5 text-sm text-[#262626] transition hover:bg-[#f5f5f5] hover:text-[#2c2585]"
                  >
                    {item.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
