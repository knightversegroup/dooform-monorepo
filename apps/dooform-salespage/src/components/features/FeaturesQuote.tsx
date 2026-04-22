import { Section, Container } from '@dooform/ui';

type FeaturesQuoteDict = {
  text: string;
  author: string;
  company: string;
};

export default function FeaturesQuote({
  dict,
}: {
  dict: FeaturesQuoteDict;
}) {
  return (
    <Section padding="none">
      <Container className="py-8">
        <div className="rounded-2xl bg-[#1B1464] px-8 py-12 md:px-16 md:py-16">
          {/* Quote mark */}
          <svg
            className="mb-4 h-8 w-8 text-white/30"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
          </svg>

          <p className="text-xl leading-relaxed text-white md:text-2xl md:leading-relaxed">
            {dict.text}
          </p>

          <div className="mt-8 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20" />
            <div>
              <p className="text-sm font-medium text-white">{dict.author}</p>
              <p className="text-sm text-white/60">{dict.company}</p>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
