import { ArrowUpRight } from 'lucide-react';

type VideoDict = {
  heading: string;
  viewUseCases: string;
};

export default function VideoSection({
  dict,
  locale,
}: {
  dict: VideoDict;
  locale: string;
}) {
  return (
    <section className="flex justify-center px-[10px]">
      <div className="w-full max-w-[1280px] px-6 py-16">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-semibold text-black md:text-4xl">
            {dict.heading}
          </h2>
          <a
            href={`/${locale}/usecases`}
            className="flex shrink-0 items-center gap-0.5 text-sm text-[#424242] transition hover:text-gray-900"
          >
            {dict.viewUseCases}
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

        {/* Video */}
        <div className="aspect-video w-full overflow-hidden rounded-3xl bg-gradient-to-b from-[#d9d9d9] to-white">
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            {/* <source src="/videos/demo.mp4" type="video/mp4" /> */}
          </video>
        </div>
      </div>
    </section>
  );
}
