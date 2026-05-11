'use client';

import { Button, Typography } from '@dooform/ui';
import { Section, Container } from '@dooform/ui';

type TrialDict = {
  heading: string;
  subtitle: string;
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

        {/* CTA Buttons */}
        <div className="mx-auto flex w-full max-w-[295px] flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <Button
              variant="dark"
              size="md"
              href="https://app.dooform.com/register"
            >
              {dict.register}
            </Button>
            <Button
              variant="ghost"
              size="md"
              href="https://app.dooform.com/login"
            >
              {dict.hasAccount}
            </Button>
          </div>
        </div>

        {/* Consent */}
        <Typography variant="caption" align="center" className="mt-9">
          {dict.consent}
        </Typography>
      </Container>
    </Section>
  );
}
