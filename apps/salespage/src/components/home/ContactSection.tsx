'use client';

import { Section, Container } from '@dooform/ui';

export type ContactDict = {
  heading: string;
  subtitle: string;
  aiLabel: string;
  stats: {
    month1: { value: string; label: string };
    month2: { value: string; label: string };
    month3: { value: string; label: string };
  };
  form: {
    firstName: string;
    firstNamePlaceholder: string;
    company: string;
    companyPlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    details: string;
    detailsPlaceholder: string;
    submit: string;
  };
};

export default function ContactSection({ dict }: { dict: ContactDict }) {
  return (
    <Section padding="lg">
      <Container>
        <div className="overflow-hidden rounded-2xl md:grid md:grid-cols-2">
          {/* Left — Dark side */}
          <div className="flex flex-col justify-between bg-[#1a1a2e] p-8 md:p-12">
            <div>
              <h2 className="text-2xl font-bold leading-tight text-white md:text-3xl lg:text-4xl">
                {dict.heading}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/60 md:text-base">
                {dict.subtitle}
              </p>
            </div>

            {/* Growth chart */}
            <div className="mt-10">
              <div className="flex items-end gap-4 md:gap-6">
                {/* Month 1 */}
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs font-semibold text-white">
                    {dict.stats.month1.value}
                  </div>
                  <div className="h-20 w-14 rounded-t-lg bg-gradient-to-t from-blue-600/40 to-blue-500/20 md:w-20" />
                  <div className="text-[10px] text-white/50">
                    {dict.stats.month1.label}
                  </div>
                </div>

                {/* Month 2 */}
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs font-semibold text-white">
                    {dict.stats.month2.value}
                  </div>
                  <div className="h-32 w-14 rounded-t-lg bg-gradient-to-t from-blue-500/60 to-blue-400/30 md:w-20" />
                  <div className="text-[10px] text-white/50">
                    {dict.stats.month2.label}
                  </div>
                </div>

                {/* Month 3 */}
                <div className="flex flex-col items-center gap-2">
                  <div className="text-xs font-semibold text-white">
                    {dict.stats.month3.value}
                  </div>
                  <div className="relative h-44 w-14 rounded-t-lg bg-gradient-to-t from-blue-500 to-blue-400 md:w-20">
                    {/* Upward trend line */}
                    <svg
                      className="absolute -right-4 -top-6 h-12 w-12 text-white/40"
                      viewBox="0 0 48 48"
                      fill="none"
                    >
                      <path
                        d="M4 40 L24 20 L44 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                      />
                      <path d="M38 4 L44 4 L44 10" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="text-[10px] text-white/50">
                    {dict.stats.month3.label}
                  </div>
                </div>
              </div>

              {/* AI badge */}
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                  +
                </div>
                <span className="text-xs font-medium text-white/80">
                  {dict.aiLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Right — Form side */}
          <div className="bg-white p-8 md:p-12">
            <form
              className="flex flex-col gap-5"
              onSubmit={(e) => e.preventDefault()}
            >
              {/* Row 1: Name + Company */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#262626]">
                    {dict.form.firstName}
                  </label>
                  <input
                    type="text"
                    placeholder={dict.form.firstNamePlaceholder}
                    className="w-full rounded-lg border border-[#e5e0da] px-4 py-2.5 text-sm text-[#262626] placeholder:text-[#ccc] focus:border-[#0d4b3b] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#262626]">
                    {dict.form.company}
                  </label>
                  <input
                    type="text"
                    placeholder={dict.form.companyPlaceholder}
                    className="w-full rounded-lg border border-[#e5e0da] px-4 py-2.5 text-sm text-[#262626] placeholder:text-[#ccc] focus:border-[#0d4b3b] focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Phone + Email */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#262626]">
                    {dict.form.phone}
                  </label>
                  <input
                    type="tel"
                    placeholder={dict.form.phonePlaceholder}
                    className="w-full rounded-lg border border-[#e5e0da] px-4 py-2.5 text-sm text-[#262626] placeholder:text-[#ccc] focus:border-[#0d4b3b] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#262626]">
                    {dict.form.email}
                  </label>
                  <input
                    type="email"
                    placeholder={dict.form.emailPlaceholder}
                    className="w-full rounded-lg border border-[#e5e0da] px-4 py-2.5 text-sm text-[#262626] placeholder:text-[#ccc] focus:border-[#0d4b3b] focus:outline-none"
                  />
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#262626]">
                  {dict.form.details}
                </label>
                <textarea
                  rows={3}
                  placeholder={dict.form.detailsPlaceholder}
                  className="w-full resize-none rounded-lg border border-[#e5e0da] px-4 py-2.5 text-sm text-[#262626] placeholder:text-[#ccc] focus:border-[#0d4b3b] focus:outline-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-[#262626] py-3 text-sm font-semibold text-white transition hover:bg-[#1a1a1a]"
              >
                {dict.form.submit}
              </button>
            </form>
          </div>
        </div>
      </Container>
    </Section>
  );
}
