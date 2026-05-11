'use client';

import { Section, Container, Typography } from '@dooform/ui';

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

/* Form-input typography lives outside the Typography component because it
 * styles a single self-closing element (input/textarea); centralising the
 * class string keeps form fields consistent and the typography scale honest. */
const INPUT_CLASS =
  'w-full rounded-lg border border-[#e5e0da] px-4 py-2.5 text-sm text-[#262626] placeholder:text-[#ccc] focus:border-[#0d4b3b] focus:outline-none';

export default function ContactSection({ dict }: { dict: ContactDict }) {
  return (
    <Section padding="lg">
      <Container>
        <div className="overflow-hidden rounded-2xl md:grid md:grid-cols-2">
          {/* Left — Dark side */}
          <div className="flex flex-col justify-between bg-[#1a1a2e] p-8 md:p-12">
            <div>
              <Typography variant="h2" as="h2" tone="inverse">
                {dict.heading}
              </Typography>
              <Typography variant="lead" tone="inverse-muted" className="mt-4">
                {dict.subtitle}
              </Typography>
            </div>

            {/* Growth chart */}
            <div className="mt-10">
              <div className="flex items-end gap-4 md:gap-6">
                {/* Month 1 */}
                <div className="flex flex-col items-center gap-2">
                  <Typography variant="caption" weight="semibold" tone="inverse">
                    {dict.stats.month1.value}
                  </Typography>
                  <div className="h-20 w-14 rounded-t-lg bg-gradient-to-t from-blue-600/40 to-blue-500/20 md:w-20" />
                  <Typography variant="micro" tone="inherit" className="text-white/50">
                    {dict.stats.month1.label}
                  </Typography>
                </div>

                {/* Month 2 */}
                <div className="flex flex-col items-center gap-2">
                  <Typography variant="caption" weight="semibold" tone="inverse">
                    {dict.stats.month2.value}
                  </Typography>
                  <div className="h-32 w-14 rounded-t-lg bg-gradient-to-t from-blue-500/60 to-blue-400/30 md:w-20" />
                  <Typography variant="micro" tone="inherit" className="text-white/50">
                    {dict.stats.month2.label}
                  </Typography>
                </div>

                {/* Month 3 */}
                <div className="flex flex-col items-center gap-2">
                  <Typography variant="caption" weight="semibold" tone="inverse">
                    {dict.stats.month3.value}
                  </Typography>
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
                  <Typography variant="micro" tone="inherit" className="text-white/50">
                    {dict.stats.month3.label}
                  </Typography>
                </div>
              </div>

              {/* AI badge */}
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
                  <Typography as="span" variant="caption" tone="inverse">+</Typography>
                </div>
                <Typography as="span" variant="caption" weight="medium" tone="inherit" className="text-white/80">
                  {dict.aiLabel}
                </Typography>
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
                  <Typography as="label" variant="label" className="mb-1.5 block">
                    {dict.form.firstName}
                  </Typography>
                  <input
                    type="text"
                    placeholder={dict.form.firstNamePlaceholder}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <Typography as="label" variant="label" className="mb-1.5 block">
                    {dict.form.company}
                  </Typography>
                  <input
                    type="text"
                    placeholder={dict.form.companyPlaceholder}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              {/* Row 2: Phone + Email */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Typography as="label" variant="label" className="mb-1.5 block">
                    {dict.form.phone}
                  </Typography>
                  <input
                    type="tel"
                    placeholder={dict.form.phonePlaceholder}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <Typography as="label" variant="label" className="mb-1.5 block">
                    {dict.form.email}
                  </Typography>
                  <input
                    type="email"
                    placeholder={dict.form.emailPlaceholder}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              {/* Details */}
              <div>
                <Typography as="label" variant="label" className="mb-1.5 block">
                  {dict.form.details}
                </Typography>
                <textarea
                  rows={3}
                  placeholder={dict.form.detailsPlaceholder}
                  className={`${INPUT_CLASS} resize-none`}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-[#262626] py-3 transition hover:bg-[#1a1a1a]"
              >
                <Typography as="span" variant="body-sm" weight="semibold" tone="inverse">
                  {dict.form.submit}
                </Typography>
              </button>
            </form>
          </div>
        </div>
      </Container>
    </Section>
  );
}
