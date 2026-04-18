"use client";

import { useRouter } from "next/navigation";
import { LayoutDashboard, Users, Settings, FileText, Paintbrush, BookMarked, Megaphone } from "lucide-react";
import { Navbar } from "@dooform/shared";
import type { NavTab } from "@dooform/shared";

const NAV_TABS: NavTab[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, position: "left" },
  { name: "จัดการเทมเพลต", href: "/templates", icon: FileText, position: "left" },
  { name: "จัดการผู้ใช้", href: "/users", icon: Users, position: "left" },
  { name: "คลังคำศัพท์", href: "/dictionary", icon: BookMarked, position: "left" },
  { name: "หน้าเว็บขาย", href: "/content/salespage", icon: Megaphone, position: "left" },
  { name: "ลายน้ำ", href: "/branding", icon: Paintbrush, position: "left" },
  { name: "Console", href: "/console", icon: Settings, position: "left" },
];

export function BackofficeNav() {
  const router = useRouter();

  return (
    <Navbar
      tabs={NAV_TABS}
      badge="Backoffice"
      onLogout={() => router.push("/login")}
    />
  );
}
