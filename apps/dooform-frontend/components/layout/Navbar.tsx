"use client";

import Link from "next/link";
import {
  FileText,
  History,
  BookMarked,
  BookOpenText,
  Stamp,
  Crown,
  Sparkles,
  Zap,
} from "lucide-react";
import { Navbar as SharedNavbar } from "@dooform/shared";
import { useTier } from "@dooform/shared/auth/hooks";
import type { NavTab } from "@dooform/shared";
import type { UserTierName } from "@dooform/shared/auth/types";

const NAV_TABS: NavTab[] = [
  { name: "รายการเอกสาร", href: "/templates", icon: FileText, position: "left" },
  { name: "ประวัติการกรอก", href: "/history", icon: History, position: "left" },
  { name: "ลายน้ำ", href: "/watermarks", icon: Stamp, position: "left" },
  { name: "คลังคำศัพท์", href: "/dictionary", icon: BookMarked, position: "left" },
  { name: "คู่มือการใช้งาน", href: "/docs", icon: BookOpenText, position: "right" },
];

const TIER_CONFIG: Record<UserTierName, { label: string; icon: React.ReactNode; className: string }> = {
  free: {
    label: "Free",
    icon: <Zap className="w-3 h-3" />,
    className: "bg-neutral-100 text-neutral-600 border-neutral-200",
  },
  pro: {
    label: "Pro",
    icon: <Crown className="w-3 h-3" />,
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  max: {
    label: "Max",
    icon: <Sparkles className="w-3 h-3" />,
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
};

function TierBadge() {
  const { tierName } = useTier();
  const config = TIER_CONFIG[tierName];

  return (
    <Link
      href="/pricing"
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition-opacity hover:opacity-80 ${config.className}`}
    >
      {config.icon}
      {config.label}
    </Link>
  );
}

export default function Navbar() {
  return (
    <SharedNavbar
      tabs={NAV_TABS}
      logoHref="/templates"
      showSearch
      searchPlaceholder="ค้นหาเอกสาร..."
      profileHref="/profile"
      tierBadge={<TierBadge />}
    />
  );
}
