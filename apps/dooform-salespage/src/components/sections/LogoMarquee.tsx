const logos = [
  'Acme Corp',
  'TechFlow',
  'DataSync',
  'CloudBase',
  'FormStack',
  'WorkHub',
  'ScalePro',
  'BuildKit',
  'DevTools',
];

export default function LogoMarquee() {
  return (
    <section className="overflow-hidden bg-gray-100 py-4 text-gray-400">
      <div className="relative h-8">
        <div className="animate-marquee flex items-center gap-16 whitespace-nowrap">
          {[...logos, ...logos].map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="flex h-6 items-center text-sm font-medium uppercase tracking-wider text-gray-300"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
