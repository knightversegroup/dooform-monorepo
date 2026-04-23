'use client';

import { Button, Typography } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';

type TrialDict = {
  heading: string;
  subtitle: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  register: string;
  hasAccount: string;
  consent: string;
};

export default function TrialSection({ dict }: { dict: TrialDict }) {
  return (
    <Section id="trial" padding="none">
      <Container className="py-9">
        {/* Header */}
        <div className="mb-9 text-center">
          <Typography variant="h2">{dict.heading}</Typography>
          <Typography variant="body" className="mt-0.5">
            {dict.subtitle}
          </Typography>
        </div>

        {/* Form */}
        <form
          className="mx-auto flex w-full max-w-[295px] flex-col items-center gap-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex w-full flex-col gap-1.5">
            <input
              type="text"
              placeholder={dict.namePlaceholder}
              className="w-full rounded-xl border-[1.5px] border-[#c9c1b6] bg-white p-2.5 text-xs text-[#262626] outline-none placeholder:text-[#262626] focus:border-[#262626]"
            />
            <input
              type="email"
              placeholder={dict.emailPlaceholder}
              className="w-full rounded-xl border-[1.5px] border-[#c9c1b6] bg-white p-2.5 text-xs text-[#262626] outline-none placeholder:text-[#262626] focus:border-[#262626]"
            />
            <input
              type="password"
              placeholder={dict.passwordPlaceholder}
              className="w-full rounded-xl border-[1.5px] border-[#c9c1b6] bg-white p-2.5 text-xs text-[#262626] outline-none placeholder:text-[#262626] focus:border-[#262626]"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button variant="dark" size="md" type="submit">
              {dict.register}
            </Button>
            <Button variant="ghost" size="md" href="#">
              {dict.hasAccount}
            </Button>
          </div>
        </form>

        {/* Consent */}
        <p className="mt-9 text-center text-xs text-[#737373]">
          {dict.consent}
        </p>
      </Container>
    </Section>
  );
}
