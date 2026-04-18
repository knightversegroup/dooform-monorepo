'use client';

import { Search } from 'lucide-react';

export default function DocsSearch({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
      <input
        type="search"
        placeholder={placeholder}
        className="w-full rounded-full border border-[#e4e4e4] bg-white py-2 pl-9 pr-3 text-sm text-[#262626] placeholder:text-[#a3a3a3] focus:border-[#2c2585] focus:outline-none focus:ring-2 focus:ring-[#2c2585]/20"
      />
    </div>
  );
}
