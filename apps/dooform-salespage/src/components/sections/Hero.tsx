'use client';

import { useState } from 'react';

const useCases = [
  {
    id: 'form-builder',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
    title: 'Form Builder',
    subtitle: 'Create stunning forms with drag & drop, anywhere',
    heading: 'Form Builder',
    bullets: [
      { color: 'bg-red-500', shape: 'square', text: 'Drag & drop builder for any form type' },
      { color: 'bg-orange-500', shape: 'circle', text: 'Replace your clunky legacy tools' },
      { color: 'bg-red-800', shape: 'square', text: 'Conditional logic and branching for complex workflows' },
      { color: 'bg-red-500', shape: 'square', text: 'Embed forms anywhere without code' },
      { color: 'bg-orange-500', shape: 'circle', text: 'Works with any website or app' },
    ],
  },
  {
    id: 'surveys',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
      </svg>
    ),
    title: 'Surveys',
    subtitle: 'Gather feedback and insights from your audience.',
    heading: 'Surveys',
    bullets: [
      { color: 'bg-blue-500', shape: 'square', text: 'NPS, CSAT, and custom survey templates' },
      { color: 'bg-teal-500', shape: 'circle', text: 'Real-time response analytics' },
      { color: 'bg-blue-800', shape: 'square', text: 'Multi-language support out of the box' },
      { color: 'bg-blue-500', shape: 'square', text: 'Skip logic for personalized experiences' },
      { color: 'bg-teal-500', shape: 'circle', text: 'Share via link, QR code, or embed' },
    ],
  },
  {
    id: 'quizzes',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    title: 'Quizzes',
    subtitle: 'Engage users with interactive quiz experiences.',
    heading: 'Quizzes',
    bullets: [
      { color: 'bg-purple-500', shape: 'square', text: 'Scored and personality-type quizzes' },
      { color: 'bg-pink-500', shape: 'circle', text: 'Automatic grading and result pages' },
      { color: 'bg-purple-800', shape: 'square', text: 'Lead capture with quiz funnels' },
      { color: 'bg-purple-500', shape: 'square', text: 'Branching paths based on answers' },
      { color: 'bg-pink-500', shape: 'circle', text: 'Social sharing for viral reach' },
    ],
  },
  {
    id: 'registration',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H5.228A2.25 2.25 0 013 16.883c0-2.118 1.722-4.128 4.5-4.128a6.735 6.735 0 013.286.88M15 19.128a9.337 9.337 0 01-4.121-.952M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: 'Registration',
    subtitle: 'Streamlined signup for events and programs.',
    heading: 'Registration',
    bullets: [
      { color: 'bg-green-600', shape: 'square', text: 'Event and webinar registration forms' },
      { color: 'bg-emerald-500', shape: 'circle', text: 'Automatic confirmation emails' },
      { color: 'bg-green-800', shape: 'square', text: 'Waitlist and capacity management' },
      { color: 'bg-green-600', shape: 'square', text: 'Custom fields for any use case' },
      { color: 'bg-emerald-500', shape: 'circle', text: 'CRM and calendar integrations' },
    ],
  },
  {
    id: 'payments',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    title: 'Payments',
    subtitle: 'Collect payments directly within your forms.',
    heading: 'Payments',
    bullets: [
      { color: 'bg-amber-600', shape: 'square', text: 'Stripe and payment gateway integration' },
      { color: 'bg-yellow-500', shape: 'circle', text: 'One-time and recurring payments' },
      { color: 'bg-amber-800', shape: 'square', text: 'Order forms with product selection' },
      { color: 'bg-amber-600', shape: 'square', text: 'Automatic receipts and invoices' },
      { color: 'bg-yellow-500', shape: 'circle', text: 'Multi-currency support' },
    ],
  },
];

export default function Hero() {
  const [activeId, setActiveId] = useState('form-builder');
  const active = useCases.find((uc) => uc.id === activeId) ?? useCases[0];

  return (
    <section className="bg-white">
      {/* CTA Text Area */}
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-600">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
            New: AI-powered form builder
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Build forms that{' '}
            <span className="text-red-500">convert</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Create beautiful, responsive forms in minutes. No coding required.
            Collect data, gather feedback, and grow your business.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <a
              href="#"
              className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
            >
              Start for free
            </a>
            <a
              href="#"
              className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              View demo
            </a>
          </div>
        </div>
      </div>

      {/* Use Case Tabs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {useCases.map((uc) => {
            const isActive = uc.id === activeId;
            return (
              <button
                key={uc.id}
                onClick={() => setActiveId(uc.id)}
                className={`group flex flex-col items-start rounded-xl p-4 text-left transition ${
                  isActive
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'bg-white text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-gray-500'}>
                  {uc.icon}
                </span>
                <span className="mt-3 text-sm font-semibold leading-tight">
                  {uc.title}
                </span>
                <span
                  className={`mt-1 text-xs leading-snug ${
                    isActive ? 'text-red-100' : 'text-gray-500'
                  }`}
                >
                  {uc.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-10 bg-gray-100 px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-2">
          {/* Left: Text */}
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
              Use Case
            </p>
            <h2 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {active.heading}
            </h2>

            <ul className="mt-8 space-y-4">
              {active.bullets.map((bullet) => (
                <li key={bullet.text} className="flex items-start gap-3">
                  <span
                    className={`mt-1.5 h-3 w-3 flex-shrink-0 ${bullet.color} ${
                      bullet.shape === 'circle' ? 'rounded-full' : 'rounded-sm'
                    }`}
                  />
                  <span className="text-base text-gray-700">{bullet.text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <a
                href="#"
                className="inline-block rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Learn more
              </a>
            </div>
          </div>

          {/* Right: Product Mockup */}
          <div className="relative">
            {/* Main screenshot mockup */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-4 flex-1 rounded-md bg-gray-200 px-3 py-1 text-xs text-gray-400">
                  app.dooform.com
                </span>
              </div>
              {/* App content placeholder */}
              <div className="p-4">
                {/* Toolbar */}
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <div className="h-6 w-24 rounded bg-gray-100" />
                  <div className="h-6 w-16 rounded bg-red-100" />
                  <div className="flex-1" />
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-5 w-5 rounded bg-gray-100" />
                    ))}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-5 gap-3">
                  {/* Sidebar list */}
                  <div className="col-span-2 space-y-3">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
                        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-1">
                          <div className="h-2.5 w-3/4 rounded bg-gray-200" />
                          <div className="h-2 w-1/2 rounded bg-gray-100" />
                        </div>
                        <div className="h-2 w-8 rounded bg-gray-100" />
                      </div>
                    ))}
                  </div>
                  {/* Main content area */}
                  <div className="col-span-3 rounded-lg border border-gray-100 p-4">
                    <div className="h-3 w-3/4 rounded bg-gray-200" />
                    <div className="mt-4 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200" />
                      <div className="space-y-1">
                        <div className="h-2.5 w-24 rounded bg-gray-200" />
                        <div className="h-2 w-32 rounded bg-gray-100" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-2.5 w-full rounded bg-gray-100" />
                      <div className="h-2.5 w-5/6 rounded bg-gray-100" />
                      <div className="h-2.5 w-4/6 rounded bg-gray-100" />
                    </div>
                    <div className="mt-6 space-y-2">
                      <div className="h-2.5 w-full rounded bg-gray-100" />
                      <div className="h-2.5 w-3/4 rounded bg-gray-100" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Status Card */}
            <div className="absolute -right-4 top-8 w-56 rounded-xl border border-gray-200 bg-white p-4 shadow-xl lg:-right-8">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded bg-red-100">
                  <div className="h-3 w-3 rounded-sm bg-red-400" />
                </div>
                <span className="text-sm font-semibold text-gray-900">Dooform Status</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-500">Syncing responses</span>
                <span className="ml-auto text-xs font-medium text-red-500">Configure</span>
              </div>
              <div className="mt-3">
                <div className="grid grid-cols-2 gap-x-2 border-b border-gray-100 pb-2 text-xs font-medium text-gray-500">
                  <span>Metric</span>
                  <span>Status</span>
                </div>
                {[
                  { metric: 'Connection', status: 'Online', dot: 'bg-green-500' },
                  { metric: 'Latency', status: '23ms', dot: 'bg-green-500' },
                  { metric: 'Webhooks', status: 'Connected', dot: 'bg-green-500' },
                  { metric: 'Responses', status: '1,205' },
                  { metric: 'Uptime', status: '36d 12h 13m' },
                ].map((row) => (
                  <div
                    key={row.metric}
                    className="grid grid-cols-2 gap-x-2 border-b border-gray-50 py-1.5 text-xs"
                  >
                    <span className="text-gray-500">{row.metric}</span>
                    <span className="flex items-center gap-1 text-gray-900">
                      {row.dot && <span className={`h-1.5 w-1.5 rounded-full ${row.dot}`} />}
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
