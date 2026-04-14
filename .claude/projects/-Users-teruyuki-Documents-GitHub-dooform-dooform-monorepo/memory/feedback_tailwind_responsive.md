---
name: Tailwind responsive mobile-first
description: Always use mobile-first responsive classes in Tailwind — flex-col default, md:flex-row for desktop
type: feedback
---

Use mobile-first responsive direction in Tailwind: default `flex-col` for mobile, then `md:flex-row` (or `lg:flex-row`) for larger screens. Never use `sm:flex-col` as the responsive override — that's backwards.

**Why:** User corrected this mistake directly. Tailwind is mobile-first by design.

**How to apply:** When writing responsive flex layouts, always start with the mobile layout as the default (no prefix) and add breakpoint prefixes for larger screens.
