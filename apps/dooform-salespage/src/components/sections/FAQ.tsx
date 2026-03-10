const faqs = [
  {
    question: 'How does the free plan work?',
    answer: 'The free plan includes up to 3 forms and 100 responses per month. No credit card required to get started.',
  },
  {
    question: 'Can I upgrade or downgrade at any time?',
    answer: 'Yes, you can change your plan at any time. Changes take effect at the start of your next billing cycle.',
  },
  {
    question: 'Do you offer a free trial for paid plans?',
    answer: 'Yes, all paid plans come with a 14-day free trial. You can explore all features before committing.',
  },
  {
    question: 'What integrations do you support?',
    answer: 'We support Zapier, Slack, Google Sheets, Notion, HubSpot, Salesforce, and many more. Check our integrations page for the full list.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use industry-standard encryption, are GDPR compliant, and undergo regular security audits.',
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="bg-white py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">FAQ</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        {/* FAQ List */}
        <div className="mt-16 divide-y divide-gray-200">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-6">
              <summary className="flex cursor-pointer items-center justify-between text-left">
                <span className="text-base font-medium text-gray-900">{faq.question}</span>
                <svg
                  className="h-5 w-5 flex-shrink-0 text-gray-400 transition group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
