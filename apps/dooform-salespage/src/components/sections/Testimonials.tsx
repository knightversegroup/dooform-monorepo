const testimonials = [
  {
    quote: 'Dooform has completely transformed how we collect customer feedback. The forms are beautiful and the analytics are incredibly useful.',
    name: 'Sarah Chen',
    role: 'Product Manager',
    company: 'TechCorp',
  },
  {
    quote: 'We switched from our old form builder and saw a 40% increase in completion rates. The drag and drop builder is a game changer.',
    name: 'James Wilson',
    role: 'Marketing Lead',
    company: 'GrowthCo',
  },
  {
    quote: 'The integrations work flawlessly. We pipe everything directly into our CRM and it just works. Highly recommended.',
    name: 'Maria Garcia',
    role: 'Operations Director',
    company: 'ScaleUp Inc',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Testimonials</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Loved by teams worldwide
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <p className="text-sm leading-relaxed text-gray-600">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                {/* Avatar Placeholder */}
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
