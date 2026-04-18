export type TocItem = {
  id: string;
  title: string;
};

export default function DocsTOC({
  title,
  items,
}: {
  title: string;
  items: TocItem[];
}) {
  return (
    <nav className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-[#737373]">
        {title}
      </h4>
      <ul className="flex flex-col border-l border-[#e4e4e4]">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="-ml-px block border-l border-transparent px-3 py-1 text-sm text-[#737373] transition hover:border-[#2c2585] hover:text-[#2c2585]"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
