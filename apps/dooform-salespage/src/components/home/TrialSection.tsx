'use client';

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
    <section id="trial" className="flex justify-center px-[10px]">
      <div className="w-full max-w-[1280px] px-6 py-9">
        {/* Header */}
        <div className="mb-9 text-center">
          <h2 className="text-2xl font-semibold text-[#262626]">
            {dict.heading}
          </h2>
          <p className="mt-0.5 text-base text-[#262626]">{dict.subtitle}</p>
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
            <button
              type="submit"
              className="flex h-8 items-center justify-center rounded-full bg-[#262626] px-3 text-xs font-medium text-[#fcfcfc] transition hover:bg-black"
            >
              {dict.register}
            </button>
            <a
              href="#"
              className="flex h-8 items-center justify-center rounded-full bg-[#fcfcfc] px-3 text-xs font-medium text-[#262626] transition hover:bg-gray-100"
            >
              {dict.hasAccount}
            </a>
          </div>
        </form>

        {/* Consent */}
        <p className="mt-9 text-center text-xs text-[#737373]">
          {dict.consent}
        </p>
      </div>
    </section>
  );
}
