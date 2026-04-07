/**
 * Section 4: เลือกดูเอกสาร (Document Selection)
 * - Document category cards
 * - Figma styling with proper colors
 */

const documentCategories = [
  { name: 'เอกสารราชการ', count: '50+ แบบฟอร์ม' },
  { name: 'เอกสารธุรกิจ', count: '30+ แบบฟอร์ม' },
  { name: 'เอกสารทั่วไป', count: '25+ แบบฟอร์ม' },
  { name: 'เอกสารอื่นๆ', count: '15+ แบบฟอร์ม' },
];

export default function DocumentSelect() {
  return (
    <section className="bg-white py-section-y">
      <div className="mx-auto max-w-container px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="font-ibm-plex-thai font-semibold text-section-title text-onyx">
            เลือกดูเอกสาร
          </h2>
          <a href="#" className="font-ibm-plex-thai text-section-subtitle text-primary-navy hover:underline">
            ดูทุกประเภท &rarr;
          </a>
        </div>

        {/* Document category cards */}
        <div className="grid grid-cols-4 gap-6 md:grid-cols-2 sm:grid-cols-1">
          {documentCategories.map((category, i) => (
            <div
              key={i}
              className="group h-48 bg-sand-light rounded-card border border-stroke flex flex-col items-center justify-center cursor-pointer hover:border-primary-navy hover:shadow-card transition-all"
            >
              {/* Icon placeholder */}
              <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-btn-subtle group-hover:shadow-card transition-shadow">
                <svg className="h-8 w-8 text-primary-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="font-ibm-plex-thai font-semibold text-card-title text-onyx mb-1">
                {category.name}
              </h3>
              <p className="font-ibm-plex-thai text-card-body text-carbon">
                {category.count}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
