const stats = [
  {
    value: '5.3 hours',
    description: 'lost each week jumping between tools and looking for answers',
    width: '60%',
    color: 'bg-orange-500',
  },
  {
    value: '75% of teams',
    description: 'distrust data collected from poorly built forms',
    width: '100%',
    color: 'bg-orange-600',
  },
  {
    value: '19% longer',
    description: 'workflows due to fixing and re-sending broken forms',
    width: '70%',
    color: 'bg-orange-800',
  },
];

export default function Stats() {
  return (
    <section className="pb-12 pt-24">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-12 max-w-lg text-3xl font-bold leading-snug tracking-tight text-gray-900">
          Teams are losing time, trust and patience with badly built forms
        </h2>

        <div className="space-y-3">
          {stats.map((stat) => (
            <div
              key={stat.value}
              className="relative z-10 flex items-center gap-6 px-4 py-3 text-white md:flex-col md:items-start"
            >
              <div className="shrink-0 text-3xl font-bold tracking-tight lg:text-4xl">
                {stat.value}
              </div>
              <div className="max-w-sm text-base font-light">{stat.description}</div>
              {/* Background bar */}
              <div
                className={`absolute inset-0 -z-10 ${stat.color}`}
                style={{ width: stat.width }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
